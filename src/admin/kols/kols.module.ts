import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KolsController } from './kols.controller';
import { KolsService } from './kols.service';
import { Player } from '../../database/entities/player.entity';
import { CommissionLog } from '../../database/entities/commission-log.entity';
import { TransactionLog } from '../../database/entities/transaction-log.entity';
import { RefLog } from '../../database/entities/ref-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, CommissionLog, TransactionLog, RefLog])],
  controllers: [KolsController],
  providers: [KolsService],
})
export class KolsModule {}

