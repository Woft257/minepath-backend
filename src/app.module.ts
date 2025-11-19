import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { KolsModule } from './kols/kols.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the config module available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        // Accept both DB_USERNAME or DB_USER
        username: configService.get<string>('DB_USERNAME') || configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        // Accept both DB_DATABASE or DB_NAME
        database: configService.get<string>('DB_DATABASE') || configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity.js'],
        synchronize: false, // Do not auto-create tables
        ssl: {
          rejectUnauthorized: false, // Necessary for connecting to some cloud databases from local machine
        },
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    KolsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

