import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Player } from '../../database/entities/player.entity';
import { AddBdMemberDto } from './dto/add-bd-member.dto';
import { TransactionLog } from '../../database/entities/transaction-log.entity';

@Injectable()
export class BdTeamService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async findAll() {
    const bds = await this.playerRepository.find({
      where: { role: 'BD' },
    });

    const bdData = await Promise.all(
      bds.map(async (bd) => {
        const kols = await this.playerRepository.find({
          where: { managedBy: { uuid: bd.uuid } },
        });

        const kolsManaged = kols.length;
        let totalVolumeGenerated = 0;

        if (kols.length > 0) {
          const kolUuids = kols.map((kol) => kol.uuid);
          const result = await this.transactionLogRepository
            .createQueryBuilder('log')
            .select('SUM(log.amount)', 'total')
            .where('log.player_uuid IN (:...kolUuids)', { kolUuids })
            .andWhere("log.type = 'SOL_REVENUE'")
            .getRawOne();
          totalVolumeGenerated = result && result.total ? parseFloat(result.total) : 0;
        }

        return {
          uuid: bd.uuid,
          bdName: bd.username,
          kolsManaged,
          totalVolumeGenerated,
        };
      }),
    );

    return bdData;
  }

  async addBdMember(addBdMemberDto: AddBdMemberDto) {
    if (!addBdMemberDto.username && !addBdMemberDto.refCode) {
      throw new BadRequestException('Either username or refCode must be provided.');
    }

    const findCondition = addBdMemberDto.username
      ? { username: addBdMemberDto.username }
      : { refCode: addBdMemberDto.refCode };

    const user = await this.playerRepository.findOne({ where: findCondition });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'BD') {
      throw new BadRequestException('User is already a BD');
    }

    user.role = 'BD';

    if (addBdMemberDto.commissionRate !== undefined) {
      user.commissionRate = addBdMemberDto.commissionRate;
    }

    if (addBdMemberDto.solFeeShare !== undefined) {
      user.solFeeShare = addBdMemberDto.solFeeShare;
    }

    await this.playerRepository.save(user);
    return { message: 'BD member added successfully', bd: user };
  }

  async removeBdMember(uuid: string) {
    const bd = await this.playerRepository.findOneBy({ uuid, role: 'BD' });
    if (!bd) {
      throw new NotFoundException('BD member not found');
    }

    // Unassign all KOLs managed by this BD
    await this.playerRepository.update({ managedBy: { uuid: bd.uuid } }, { managedBy: null });

    bd.role = 'USER';
    bd.commissionRate = 0.3; // Reset to default USER rate
    bd.solFeeShare = 0; // Reset SOL fee share

    await this.playerRepository.save(bd);

    return { message: 'BD member removed successfully' };
  }
}