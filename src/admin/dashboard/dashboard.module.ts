import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Player } from '../../database/entities/player.entity';
import { TransactionLog } from '../../database/entities/transaction-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, TransactionLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

