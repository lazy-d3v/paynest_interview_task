import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { AuctionModule } from './auction/auction.module';
import { BidModule } from './bid/bid.module';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        const useSSL = configService.get<string>('DB_SSL', 'true') === 'true';

        let host: string, port: number, username: string, password: string, database: string;

        if (dbUrl) {
          const cleanUrl = dbUrl.replace(/^['"]|['"]$/g, '');
          const url = new URL(cleanUrl);
          host = url.hostname;
          port = parseInt(url.port || '5432', 10);
          username = decodeURIComponent(url.username);
          password = decodeURIComponent(url.password);
          database = url.pathname.replace('/', '');
        } else {
          host = configService.get<string>('DB_HOST')!;
          port = configService.get<number>('DB_PORT')!;
          username = configService.get<string>('DB_USERNAME')!;
          password = configService.get<string>('DB_PASSWORD')!;
          database = configService.get<string>('DB_DATABASE')!;
        }

        console.log(`Connecting to database: ${host}:${port}/${database} (SSL: ${useSSL})`);

        // Build SSL config conditionally
        const dialectOptions: any = {};
        if (useSSL) {
          dialectOptions.ssl = {
            rejectUnauthorized: false
          };
        }

        return {
          dialect: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          autoLoadModels: true,
          synchronize: true, // Dev only
          sync: { alter: true }, // Automatically synchronize model schema changes (e.g. added columns)
          dialectOptions,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          retry: {
            max: 5,
          },
          logging: false,
        };
      },
    }),

    ScheduleModule.forRoot(),

    // Feature modules
    GatewayModule,
    UserModule,
    AuthModule,
    AuctionModule,
    BidModule,

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
