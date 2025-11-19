import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Like } from 'typeorm';
import { Player } from '../../database/entities/player.entity';
import { TransactionLog } from '../../database/entities/transaction-log.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async getStats() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Total Claim Fee (SOL) - Sum of sol_amount for 'MINING' transactions
    const { totalClaimFee } = await this.transactionLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.solAmount)', 'totalClaimFee')
      .where("log.method = 'MINING'")
      .getRawOne();

    // 2. Total $MINE Minted
    const { totalMineMinted } = await this.transactionLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.amount)', 'totalMineMinted')
      .where("log.transactionType = 'IN'")
      .andWhere("log.method IN ('MINING', 'PASSIVE_INCOME', 'REFERRAL_REWARD')")
      .getRawOne();

    // 3. Total Claims - Count of 'MINING' transactions
    const totalClaims = await this.transactionLogRepository.count({ where: { method: 'MINING' } });

    // 4. Active Players (24h)
    const activePlayers = await this.playerRepository.count({ where: { lastLogin: MoreThan(twentyFourHoursAgo) } });

    // 5. Total KOLs - Count of players where role starts with 'KOL'
    const totalKols = await this.playerRepository.count({ where: { role: Like('KOL%') } });

    return {
      totalClaimFee: parseFloat(totalClaimFee) || 0,
      totalMineMinted: parseInt(totalMineMinted) || 0,
      totalClaims,
      activePlayers,
      totalKols,
    };
  }

  async getSolRevenueOverTime(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.transactionLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.createdAt) as date, SUM(log.solAmount) as revenue')
      .where("log.method = 'MINING'")
      .andWhere('log.createdAt >= :startDate', { startDate })
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC');

    return query.getRawMany();
  }

  async getRecentTransactions(limit: number = 5) {
    return this.transactionLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['playerUuid', 'method', 'solAmount', 'status', 'createdAt'], // Select specific columns for privacy and performance
    });
  }
}

