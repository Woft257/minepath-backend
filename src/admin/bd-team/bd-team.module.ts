import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../../database/entities/player.entity';
import { TransactionLog } from '../../database/entities/transaction-log.entity';
import { BdTeamController } from './bd-team.controller';
import { BdTeamService } from './bd-team.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player, TransactionLog])],
  controllers: [BdTeamController],
  providers: [BdTeamService],
})
export class BdTeamModule {}

