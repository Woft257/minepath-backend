import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not, Brackets } from 'typeorm';
import { Player } from '../database/entities/player.entity';
import { CommissionLog } from '../database/entities/commission-log.entity';
import { TransactionLog } from '../database/entities/transaction-log.entity';
import { AddKolDto } from './dto/add-kol.dto';
import { UpdateKolDto } from './dto/update-kol.dto';

@Injectable()
export class KolsService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(CommissionLog)
    private commissionLogRepository: Repository<CommissionLog>,
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
  ) {}

  private getRecursiveReferralsQuery(kolUuid: string) {
    return `
      WITH RECURSIVE referral_chain AS (
        SELECT uuid
        FROM players
        WHERE referred_by = '${kolUuid}'
        UNION ALL
        SELECT p.uuid
        FROM players p
        INNER JOIN referral_chain rc ON p.referred_by = rc.uuid
      )
      SELECT uuid FROM referral_chain;
    `;
  }

  /**
   * Get KOL statistics for the dashboard
   */
  async getStats() {
    // We need to iterate through KOLs as a single recursive query for all is too complex and error-prone.
    const kols = await this.playerRepository.find({ where: { role: 'KOL' } });
    let topByVolume = null;
    let maxVolume = -1;

    for (const kol of kols) {
      const referralsQuery = this.getRecursiveReferralsQuery(kol.uuid);
      const referredUuidsResult = await this.playerRepository.query(referralsQuery);
      if (referredUuidsResult.length === 0) continue;

      const referredUuids = referredUuidsResult.map((r: { uuid: string }) => r.uuid);
      const volumeResult = await this.transactionLogRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.sol_amount)', 'totalVolume')
        .where('tx.player_uuid IN (:...referredUuids)', { referredUuids })
        .andWhere('tx.method = :method', { method: 'MINING' })
        .getRawOne();

      const currentVolume = parseFloat(volumeResult.totalVolume || 0);
      if (currentVolume > maxVolume) {
        maxVolume = currentVolume;
        topByVolume = {
          username: kol.username,
          uuid: kol.uuid,
          volume: currentVolume,
        };
      }
    }

    const topByReferrals = await this.playerRepository.findOne({
      where: { role: 'KOL' },
      order: { allReferred: 'DESC' },
    });

    return {
      topByVolume,
      topByReferrals: topByReferrals
        ? {
            username: topByReferrals.username,
            uuid: topByReferrals.uuid,
            referrals: topByReferrals.allReferred,
          }
        : null,
    };
  }

  /**
   * Get list of BD Managers
   */
  async getBdManagers() {
    return this.playerRepository.find({
      where: { role: 'BD' },
      select: ['uuid', 'username'],
    });
  }

  /**
   * Get all KOLs with search and filtering
   */
  async getAllKols(search?: string, status?: string) {
    const queryBuilder = this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.managedBy', 'bdManager')
      .where('player.role = :role', { role: 'KOL' });

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('player.username ILIKE :search', { search: `%${search}%` })
            .orWhere('player.solana_address ILIKE :search')
            .orWhere('player.ref_code ILIKE :search');
        }),
      );
    }

    const kols = await queryBuilder.getMany();

    const kolsWithStats = await Promise.all(
      kols.map(async (kol) => {
        const referralsQuery = this.getRecursiveReferralsQuery(kol.uuid);
        const referredUuidsResult = await this.playerRepository.query(referralsQuery);
        const referredUuids = referredUuidsResult.map((r: { uuid: string }) => r.uuid);

        let totalVolume = 0;
        if (referredUuids.length > 0) {
          const volumeResult = await this.transactionLogRepository
            .createQueryBuilder('tx')
            .select('SUM(tx.sol_amount)', 'totalVolume')
            .where('tx.player_uuid IN (:...referredUuids)', { referredUuids })
            .andWhere('tx.method = :method', { method: 'MINING' })
            .getRawOne();
          totalVolume = parseFloat(volumeResult.totalVolume || 0);
        }

        return {
          uuid: kol.uuid,
          username: kol.username,
          wallet: kol.solanaAddress,
          refCode: kol.refCode,
          managedBy: kol.managedBy?.username || null,
          totalReferrals: kol.allReferred,
          totalVolume,
          status: 'ACTIVE',
        };
      }),
    );

    return kolsWithStats;
  }

  /**
   * Get detailed information about a specific KOL
   */
  async getKolDetails(uuid: string) {
    const kol = await this.playerRepository.findOne({
      where: { uuid, role: 'KOL' },
      relations: ['managedBy'],
    });

    if (!kol) {
      throw new NotFoundException('KOL not found');
    }

    const referralsQuery = this.getRecursiveReferralsQuery(uuid);
    const referredUuidsResult = await this.playerRepository.query(referralsQuery);
    const referredUuids = referredUuidsResult.map((r: { uuid: string }) => r.uuid);

    let totalVolume = 0;
    let topUsers = [];

    if (referredUuids.length > 0) {
      const volumeResult = await this.transactionLogRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.sol_amount)', 'totalVolume')
        .where('tx.player_uuid IN (:...referredUuids)', { referredUuids })
        .andWhere('tx.method = :method', { method: 'MINING' })
        .getRawOne();
      totalVolume = parseFloat(volumeResult.totalVolume || 0);

      topUsers = await this.transactionLogRepository
        .createQueryBuilder('tx')
        .select('p.username', 'username')
        .addSelect('p.solana_address', 'wallet')
        .addSelect('SUM(tx.sol_amount)', 'totalSpent')
        .innerJoin(Player, 'p', 'p.uuid = tx.player_uuid')
        .where('tx.player_uuid IN (:...referredUuids)', { referredUuids })
        .andWhere('tx.method = :method', { method: 'MINING' })
        .groupBy('p.uuid, p.username, p.solana_address')
        .orderBy('"totalSpent"', 'DESC')
        .limit(10)
        .getRawMany();
    }

    const unpaidCommission = totalVolume * kol.solFeeShare;

    const commissionHistory = await this.commissionLogRepository.find({
      where: { kolUuid: uuid },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const referralGrowth = await this.getReferralGrowthData(uuid);

    return {
      kol: {
        uuid: kol.uuid,
        username: kol.username,
        wallet: kol.solanaAddress,
        refCode: kol.refCode,
        managedBy: kol.managedBy?.username || null,
        managedByUuid: kol.managedBy?.uuid || null,
        solFeeShare: kol.solFeeShare,
        commissionRate: kol.commissionRate,
      },
      performance: {
        totalReferrals: kol.allReferred,
        f1Referrals: kol.totalReferred,
        totalVolume,
        unpaidCommission,
        referralGrowth,
      },
      topUsers: topUsers.map((user) => ({
        username: user.username,
        wallet: user.wallet,
        totalSpent: parseFloat(user.totalSpent || 0),
      })),
      commissionHistory: commissionHistory.map((log) => ({
        date: log.createdAt,
        solAmount: parseFloat(log.solAmount.toString()),
        mineAmount: log.mineAmount,
        status: log.status,
        txnHash: log.transactionHash,
      })),
    };
  }

  private async getReferralGrowthData(kolUuid: string) {
    const referralsQuery = this.getRecursiveReferralsQuery(kolUuid);
    const referredUuidsResult = await this.playerRepository.query(referralsQuery);
    if (referredUuidsResult.length === 0) return [];
    const referredUuids = referredUuidsResult.map((r: { uuid: string }) => r.uuid);

    const referrals = await this.playerRepository
      .createQueryBuilder('player')
      .select("DATE_TRUNC('month', player.last_login)", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('player.uuid IN (:...referredUuids)', { referredUuids })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return referrals.map((r) => ({
      month: r.month,
      count: parseInt(r.count),
    }));
  }

  async addKol(addKolDto: AddKolDto) {
    if (!addKolDto.username && !addKolDto.refCode) {
      throw new BadRequestException('Either username or refCode must be provided.');
    }

    const findCondition = addKolDto.username
      ? { username: addKolDto.username }
      : { refCode: addKolDto.refCode };

    const user = await this.playerRepository.findOne({ where: findCondition });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'KOL') {
      throw new BadRequestException('User is already a KOL');
    }

    user.role = 'KOL';

    if (addKolDto.managedByUuid) {
      const bdManager = await this.playerRepository.findOneBy({ uuid: addKolDto.managedByUuid, role: 'BD' });
      if (!bdManager) {
        throw new NotFoundException('BD Manager not found');
      }
      user.managedBy = bdManager;
    }

    if (addKolDto.commissionRate !== undefined) {
      user.commissionRate = addKolDto.commissionRate;
    }

    if (addKolDto.solFeeShare !== undefined) {
      user.solFeeShare = addKolDto.solFeeShare;
    }

    await this.playerRepository.save(user);
    return { message: 'KOL added successfully', kol: user };
  }

  async updateKol(uuid: string, updateKolDto: UpdateKolDto) {
    const kol = await this.playerRepository.findOneBy({ uuid, role: 'KOL' });
    if (!kol) {
      throw new NotFoundException('KOL not found');
    }

    if (updateKolDto.managedByUuid) {
      const bdManager = await this.playerRepository.findOneBy({ uuid: updateKolDto.managedByUuid, role: 'BD' });
      if (!bdManager) {
        throw new NotFoundException('BD Manager not found');
      }
      kol.managedBy = bdManager;
    }

    if (updateKolDto.solFeeShare !== undefined) {
      kol.solFeeShare = updateKolDto.solFeeShare;
    }
    if (updateKolDto.commissionRate !== undefined) {
      kol.commissionRate = updateKolDto.commissionRate;
    }

    await this.playerRepository.save(kol);
    return { message: 'KOL updated successfully', kol };
  }

  async removeKol(uuid: string) {
    const kol = await this.playerRepository.findOneBy({ uuid, role: 'KOL' });
    if (!kol) {
      throw new NotFoundException('KOL not found');
    }

    kol.role = 'USER';
    kol.managedBy = null;
    kol.commissionRate = 0.3; // Reset to default USER rate
    kol.solFeeShare = 0; // Reset SOL fee share

    await this.playerRepository.save(kol);

    return { message: 'KOL removed successfully' };
  }
}

