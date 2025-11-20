import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../database/entities/player.entity';
import { CommissionLog } from '../database/entities/commission-log.entity';
import { RefLog } from '../database/entities/ref-log.entity';
import { TransactionLog } from '../database/entities/transaction-log.entity';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class KolDashboardService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(CommissionLog)
    private readonly commissionLogRepository: Repository<CommissionLog>,
    @InjectRepository(RefLog)
    private readonly refLogRepository: Repository<RefLog>,
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async getStats(playerUuid: string) {
    const player = await this.playerRepository.findOne({ where: { uuid: playerUuid } });

    if (!player) {
      throw new Error('Player not found');
    }

    // Commission logs table doesn't exist yet, use player fields instead
    const f1MineEarned = 0; // TODO: Will be calculated from commission_logs when table is created

    const readyToWithdrawSol = (player.totalSolShare || 0) - (player.totalPayout || 0);

    return {
      yourReferralCode: player.refCode,
      totalReferrals: player.allReferred || 0,
      f1Referrals: player.totalReferred || 0,
      f1SolEarned: player.totalSolShare || 0,
      f1MineEarned: f1MineEarned,
      readyToWithdraw: {
        sol: readyToWithdrawSol,
      },
    };
  }

  async getReferralGrowth(playerUuid: string) {
    const player = await this.playerRepository.findOne({ where: { uuid: playerUuid } });
    if (!player) {
      throw new Error('Player not found');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyReferrals = await this.refLogRepository
      .createQueryBuilder('refLog')
      .select("DATE(refLog.createdAt) as date")
      .addSelect("COUNT(refLog.id)", "count")
      .where('refLog.referrerUuid = :playerUuid', { playerUuid })
      .andWhere('refLog.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(refLog.createdAt)')
      .getRawMany();

    const dailyCounts = new Map<string, number>();
    dailyReferrals.forEach(r => {
      const dateString = new Date(r.date).toISOString().split('T')[0];
      dailyCounts.set(dateString, parseInt(r.count, 10));
    });

    // Build cumulative data from oldest to newest (7 days ago -> today)
    const growthData = [];
    let cumulativeReferrals = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];

      // Add daily count to cumulative total
      cumulativeReferrals += (dailyCounts.get(dateString) || 0);

      growthData.push({
        date: dateString,
        totalReferrals: cumulativeReferrals,
      });
    }

    return growthData;
  }

  async getCommissionBreakdown(playerUuid: string) {
    const player = await this.playerRepository.findOne({ where: { uuid: playerUuid } });
    if (!player) {
      throw new Error('Player not found');
    }

    // Commission logs table doesn't exist yet, use player fields instead
    const f1MineEarned = 0; // TODO: Will be calculated from commission_logs when table is created
    const f1SolEarned = player.totalSolShare || 0;

    return {
      mineEarned: f1MineEarned,
      solEarned: f1SolEarned,
    };
  }

  async getTopReferrals(playerUuid: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    // Get referred players with their transaction stats
    const query = this.refLogRepository
      .createQueryBuilder('refLog')
      .select('player.uuid', 'uuid')
      .addSelect('player.solanaAddress', 'playerWallet')
      .addSelect('MIN(refLog.createdAt)', 'joinedDate')
      .addSelect('COALESCE(SUM(tx.solAmount), 0)::float', 'total_sol_spent')
      .innerJoin(Player, 'player', 'player.uuid = refLog.referredUuid')
      .leftJoin(
        TransactionLog,
        'tx',
        'tx.playerUuid = player.uuid AND tx.method = :method',
        { method: 'MINING' }
      )
      .where('refLog.referrerUuid = :playerUuid', { playerUuid })
      .groupBy('player.uuid, player.solanaAddress')
      .orderBy('total_sol_spent', 'DESC')
      .offset(offset)
      .limit(limit);

    const results = await query.getRawMany();

    // Get total count for pagination
    const totalCount = await this.refLogRepository.count({
      where: { referrerUuid: playerUuid },
    });

    return {
      data: results,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getCommissionHistory(playerUuid: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    // Get commission logs for the KOL
    const [commissionLogs, totalCount] = await this.commissionLogRepository.findAndCount({
      where: { kolUuid: playerUuid },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    // Transform to DTO
    const data = commissionLogs.map(log => ({
      id: log.id,
      amount: log.amount.toString(), // Preserve precision
      asset: log.asset,
      method: log.method,
      txHash: log.txHash,
      paidBy: log.paidBy,
      note: log.note,
      status: log.status,
      createdAt: log.createdAt,
    }));

    return {
      data,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}