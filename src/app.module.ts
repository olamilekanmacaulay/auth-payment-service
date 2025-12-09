import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { PaystackModule } from './paystack/paystack.module';
import { User } from './users/entities/user.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { Transaction } from './wallet/entities/transaction.entity';
import { ApiKey } from './api-keys/entities/api-key.entity';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Wallet, Transaction, ApiKey],
        synchronize: true,
        ssl: configService.get('NODE_ENV') === 'production',
        extra: configService.get('NODE_ENV') === 'production' ? {
          ssl: {
            rejectUnauthorized: false,
          },
        } : undefined,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    WalletModule,
    ApiKeysModule,
    PaystackModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'wallet/paystack/webhook', method: RequestMethod.POST });
  }
}
