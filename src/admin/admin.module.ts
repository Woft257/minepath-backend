import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    UsersModule,
    DashboardModule,
    // We will add other modules like KolsModule, TransactionsModule here later
  ],
})
export class AdminModule {}

