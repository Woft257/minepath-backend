import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BdTeamModule } from './bd-team/bd-team.module';
import { TransactionsModule } from './transactions/transactions.module';


@Module({
  imports: [
    UsersModule,
    DashboardModule,
    BdTeamModule,
    TransactionsModule,
    // We will add other modules like KolsModule, TransactionsModule here later
  ],
})
export class AdminModule {}

