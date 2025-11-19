import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLog } from '../../database/entities/transaction-log.entity';
import { Player } from '../../database/entities/player.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLog, Player])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}

