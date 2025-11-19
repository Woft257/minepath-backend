import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../database/entities/player.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search: string, status: string, volume: string) {
    const queryBuilder = this.playerRepository.createQueryBuilder('player');

    // Handle search by username or wallet address
    if (search) {
      queryBuilder.where('player.username ILIKE :search OR player.solanaAddress ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Handle status filter (assuming 'ACTIVE' and 'BANNED' are roles or some status field)
    // Note: The 'players' table has a 'role' column, but no 'status' column. We'll use 'role' for now.
    if (status && status.toLowerCase() !== 'all') {
        // Example: if status is 'ACTIVE', we might look for roles like 'USER' or 'KOL'
        // If status is 'BANNED', we might look for a specific 'BANNED' role.
        // This logic needs to be clarified based on the actual data.
        queryBuilder.andWhere('player.role = :status', { status: status.toUpperCase() });
    }

    // Handle sorting by volume (total_sol_share is a good candidate)
    if (volume) {
        const order = volume.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy('player.totalSolShare', order);
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(uuid: string) {
    // This needs to be expanded to fetch all details shown in the modal,
    // including transaction history and referral tree, likely involving joins with other tables.
    return this.playerRepository.findOne({ where: { uuid } });
  }
}

