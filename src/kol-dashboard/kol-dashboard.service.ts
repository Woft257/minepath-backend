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

    const f1MineEarnedResult = await this.commissionLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.amount)', 'total')
      .where('log.playerUuid = :playerUuid', { playerUuid })
      .andWhere("log.currency = 'MINE'")
      .getRawOne();

    const f1MineEarned = parseFloat(f1MineEarnedResult.total) || 0;

    const readyToWithdrawSol = player.totalSolShare - player.totalPayout;

    return {
      yourReferralCode: player.refCode,
      totalReferrals: player.allReferred,
      f1Referrals: player.totalReferred,
      f1SolEarned: player.totalSolShare,
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
      .where('refLog.referredBy = :playerUuid', { playerUuid })
      .andWhere('refLog.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(refLog.createdAt)')
      .getRawMany();

    const dailyCounts = new Map<string, number>();
    dailyReferrals.forEach(r => {
      const dateString = new Date(r.date).toISOString().split('T')[0];
      dailyCounts.set(dateString, parseInt(r.count, 10));
    });

    const totalReferralsToday = player.allReferred;
    let cumulativeReferrals = totalReferralsToday - (dailyCounts.get(new Date().toISOString().split('T')[0]) || 0);

    const growthData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];

      if (i > 0) {
        const previousDate = new Date();
        previousDate.setDate(previousDate.getDate() - (i - 1));
        const previousDateString = previousDate.toISOString().split('T')[0];
        cumulativeReferrals -= (dailyCounts.get(previousDateString) || 0);
      }

      growthData.push({
        date: dateString,
        totalReferrals: cumulativeReferrals + (dailyCounts.get(dateString) || 0),
      });
    }

    return growthData.reverse();
  }

  async getCommissionBreakdown(playerUuid: string) {
    const player = await this.playerRepository.findOne({ where: { uuid: playerUuid } });
    if (!player) {
      throw new Error('Player not found');
    }

    const f1MineEarnedResult = await this.commissionLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.amount)', 'total')
      .where('log.playerUuid = :playerUuid', { playerUuid })
      .andWhere("log.currency = 'MINE'")
      .getRawOne();

    const f1MineEarned = parseFloat(f1MineEarnedResult.total) || 0;
    const f1SolEarned = player.totalSolShare;

    return {
      mineEarned: f1MineEarned,
      solEarned: f1SolEarned,
    };
  }

  async getTopReferrals(playerUuid: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    // Subquery to calculate total SOL spent for each player from transactions
    const totalSpentSubQuery = this.transactionLogRepository
      .createQueryBuilder('tx')
      .select('tx.playerUuid', 'playerUuid')
      .addSelect('SUM(tx.solAmount)', 'totalSolSpent')
      .where("tx.transactionType = 'DEPOSIT'") // Assuming 'DEPOSIT' means spending SOL
      .groupBy('tx.playerUuid');

    // Main query to get the referred players and their stats
    const query = this.refLogRepository
      .createQueryBuilder('refLog')
      .select([
        'player.solanaAddress as "playerWallet"',
        'refLog.createdAt as "joinedDate"',
        'COALESCE(spent.totalSolSpent, 0)::float as "totalSolSpent"',
      ])
      .innerJoin(Player, 'player', 'player.uuid = refLog.referredUuid')
      .leftJoin(
        `(${totalSpentSubQuery.getQuery()})`,
        'spent',
        'spent.playerUuid = refLog.referredUuid',
      )
      .where('refLog.referrerUuid = :playerUuid', { playerUuid })
      .orderBy('"totalSolSpent"', 'DESC')
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
}