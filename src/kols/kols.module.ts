import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KolsController } from './kols.controller';
import { KolsService } from './kols.service';
import { Player } from '../database/entities/player.entity';
import { CommissionLog } from '../database/entities/commission-log.entity';
import { TransactionLog } from '../database/entities/transaction-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, CommissionLog, TransactionLog])],
  controllers: [KolsController],
  providers: [KolsService],
})
export class KolsModule {}

