import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BdTeamModule } from './bd-team/bd-team.module';
import { TransactionsModule } from './transactions/transactions.module';
import { KolsModule } from './kols/kols.module';


@Module({
  imports: [
    UsersModule,
    DashboardModule,
    BdTeamModule,
    KolsModule,
    TransactionsModule,
  ],
})
export class AdminModule {}

