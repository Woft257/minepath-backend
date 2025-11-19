import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KolDashboardService } from './kol-dashboard.service';
import { KolDashboardController } from './kol-dashboard.controller';
import { Player } from '../database/entities/player.entity';
import { CommissionLog } from '../database/entities/commission-log.entity';
import { RefLog } from '../database/entities/ref-log.entity';
import { TransactionLog } from '../database/entities/transaction-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, CommissionLog, RefLog, TransactionLog])],
  providers: [KolDashboardService],
  controllers: [KolDashboardController],
})
export class KolDashboardModule {}

