import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../../database/entities/player.entity';
import { TransactionLog } from '../../database/entities/transaction-log.entity';
import { RefLog } from '../../database/entities/ref-log.entity';
import { MineToEarn } from '../../database/entities/mine-to-earn.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, TransactionLog, RefLog, MineToEarn]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

