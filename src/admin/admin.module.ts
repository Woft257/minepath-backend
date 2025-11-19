import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    // We will add other modules like KolsModule, TransactionsModule here later
  ],
})
export class AdminModule {}

