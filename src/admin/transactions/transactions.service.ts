import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { TransactionLog } from '../../database/entities/transaction-log.entity';
import { Player } from '../../database/entities/player.entity';
import { FindTransactionsDto } from './dto/find-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async getStats() {
    const totalVolumeSol = await this.transactionLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.sol_amount)', 'total')
      .getRawOne();

    const mineStats = await this.transactionLogRepository
      .createQueryBuilder('log')
      .select(
        `SUM(CASE WHEN log.transaction_type = 'IN' THEN log.amount ELSE 0 END)`,
        'minted',
      )
      .addSelect(
        `SUM(CASE WHEN log.transaction_type = 'OUT' THEN log.amount ELSE 0 END)`,
        'burned',
      )
      .getRawOne();

    const totalMineMinted = parseFloat(mineStats.minted) || 0;
    const totalMineBurned = parseFloat(mineStats.burned) || 0;
    const currentMineSupply = totalMineMinted - totalMineBurned;

    return {
      totalVolumeSol: parseFloat(totalVolumeSol.total) || 0,
      totalMineMinted,
      currentMineSupply,
      totalMineBurned,
    };
  }


    async findAll(query: FindTransactionsDto) {
    const { page = 1, limit = 10, search, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.player', 'player')
      .orderBy('log.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('player.solanaAddress ILIKE :search', { search: `%${search}%` })
            .orWhere('log.transactionHash ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (type) {
      // Support comma-separated types for grouped filtering (e.g., upgrade group)
      const types = type.split(',').map(t => t.trim());
      if (types.length === 1) {
        queryBuilder.andWhere('log.method = :type', { type: types[0] });
      } else {
        queryBuilder.andWhere('log.method IN (:...types)', { types });
      }
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();
    const result = await queryBuilder.skip(skip).take(limit).getMany();

    const data = result.map(log => ({
      id: log.id,
      createdAt: log.createdAt,
      type: log.method,
      amount: log.amount,
      solAmount: log.solAmount,
      txnHash: log.transactionHash,
      status: log.status,
      userWallet: log.player ? log.player.solanaAddress : null,
    }));

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }
}

