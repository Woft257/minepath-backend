import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../database/entities/player.entity';
import { TransactionLog } from '../../database/entities/transaction-log.entity';
import { RefLog } from '../../database/entities/ref-log.entity';
import { MineToEarn } from '../../database/entities/mine-to-earn.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
    @InjectRepository(RefLog)
    private readonly refLogRepository: Repository<RefLog>,
    @InjectRepository(MineToEarn)
    private readonly mineToEarnRepository: Repository<MineToEarn>,
  ) {}

  async getStats() {
    const totalUsers = await this.playerRepository.count({ where: { role: 'USER' } });
    const topReferrer = await this.playerRepository
      .createQueryBuilder('player')
      .where("player.role = 'USER'")
      .orderBy('player.totalReferred', 'DESC')
      .limit(1)
      .getOne();
    const topMiner = await this.playerRepository
      .createQueryBuilder('player')
      .select(['player.uuid', 'player.username', 'player.mineBalance'])
      .where("player.role = 'USER'")
      .orderBy('player.mineBalance', 'DESC')
      .limit(1)
      .getOne();

    return {
      totalUsers,
      topReferrer: topReferrer
        ? {
            username: topReferrer.username,
            totalReferred: topReferrer.totalReferred,
          }
        : null,
      topMiner: topMiner
        ? {
            username: topMiner.username,
            mineBalance: topMiner.mineBalance,
          }
        : null,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search: string, volume: string) {
    const queryBuilder = this.playerRepository.createQueryBuilder('player');

    // Always filter for users with the 'USER' role
    queryBuilder.where("player.role = 'USER'");

    if (search) {
      queryBuilder.andWhere('(player.username ILIKE :search OR player.solanaAddress ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // The status filter is now redundant as we only show USERs.
    // If you need to filter by other statuses for other roles, we can adjust this.


    if (volume) {
      const order = volume.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy('player.totalSolShare', order);
    } else {
      queryBuilder.orderBy('player.username', 'ASC');
    }

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [players, total] = await queryBuilder.getManyAndCount();

    const data = await Promise.all(
      players.map(async (player) => {
        const totalClaims = await this.transactionLogRepository.count({
          where: {
            playerUuid: player.uuid,
            method: 'MINING',
          },
        });

        const volumeResult = await this.transactionLogRepository
          .createQueryBuilder('tx')
          .select('SUM(tx.solAmount)', 'total')
          .where('tx.playerUuid = :uuid', { uuid: player.uuid })
          .andWhere('tx.solAmount IS NOT NULL')
          .getRawOne();

        const solVolume = volumeResult?.total ? parseFloat(volumeResult.total) : 0;

        let referredByUsername = null;
        if (player.referredBy) {
          const referrer = await this.playerRepository.findOne({
            where: { uuid: player.referredBy },
            select: ['username'],
          });
          referredByUsername = referrer?.username || null;
        }

        return {
          uuid: player.uuid,
          username: player.username,
          solanaAddress: player.solanaAddress,
          mineBalance: player.mineBalance,
          solBalance: player.solBalance,
          totalClaims,
          solVolume,
          referredBy: referredByUsername,
          role: player.role,
          totalReferred: player.totalReferred,
        };
      }),
    );

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(uuid: string) {
    const player = await this.playerRepository.findOne({ where: { uuid } });

    if (!player) {
      return null;
    }

    const totalClaims = await this.transactionLogRepository.count({
      where: {
        playerUuid: uuid,
        method: 'MINING',
      },
    });

    let referredByUsername = null;
    if (player.referredBy) {
      const referrer = await this.playerRepository.findOne({
        where: { uuid: player.referredBy },
        select: ['username'],
      });
      referredByUsername = referrer?.username || null;
    }

    const volumeResult = await this.transactionLogRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.solAmount)', 'total')
      .where('tx.playerUuid = :uuid', { uuid })
      .andWhere('tx.solAmount IS NOT NULL')
      .getRawOne();

    const solVolume = volumeResult?.total ? parseFloat(volumeResult.total) : 0;

    const mineToEarn = await this.mineToEarnRepository.findOne({
      where: { playerUuid: uuid },
    });

    const transactions = await this.transactionLogRepository.find({
      where: { playerUuid: uuid },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const referralTree = await this.buildReferralTree(uuid);

    return {
      uuid: player.uuid,
      username: player.username,
      solanaAddress: player.solanaAddress,
      mineBalance: player.mineBalance,
      solBalance: player.solBalance,
      role: player.role,
      lastLogin: player.lastLogin,
      totalClaims,
      solVolume,
      referredBy: referredByUsername,
      upgradeStatus: mineToEarn
        ? {
            speedUpgrade: mineToEarn.upgradeSpeed,
            inventoryUpgrade: mineToEarn.upgradeInventory,
            passiveIncome: mineToEarn.upgradePassiveIncome,
            resetCooldown: mineToEarn.upgradeResetCooldown,
            miningArea: mineToEarn.upgradeMiningArea,
          }
        : null,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        date: tx.createdAt,
        type: tx.transactionType,
        method: tx.method,
        amount: tx.amount,
        solAmount: tx.solAmount,
        status: tx.status,
        transactionHash: tx.transactionHash,
      })),
      referralTree,
    };
  }

  private async buildReferralTree(referrerUuid: string) {
    const referrals = await this.playerRepository.find({
      where: { referredBy: referrerUuid },
    });

    return referrals.map((ref) => ({
      uuid: ref.uuid,
      username: ref.username,
      wallet: ref.solanaAddress,
      level: 'F1',
      mineBalance: ref.mineBalance,
      totalReferred: ref.totalReferred,
    }));
  }
}
