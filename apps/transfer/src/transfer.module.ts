import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MessagePusherModule } from './message-pusher/message-pusher.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import configuration from '@common/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): MongooseModuleFactoryOptions => {
        const { host, port, db, auth_db, user, password } = configService.get<{
          host: string;
          port: number;
          db: string;
          auth_db: string;
          user: string;
          password: string;
        }>('db');
        return {
          uri: `mongodb://${user}:${password}@${host}:${port}/${db}${auth_db}`,
        } as MongooseModuleFactoryOptions;
      },
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          config: [
            {
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              db: configService.get('redis.db'),
              password: configService.get('redis.password'),
            },
            {
              namespace: 'sub',
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              db: configService.get('redis.db'),
              password: configService.get('redis.password'),
            },
            {
              namespace: 'pub',
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              db: configService.get('redis.db'),
              password: configService.get('redis.password'),
            },
          ],
        };
      },
    }),
    MessagePusherModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        issuer: process.env.JWT_ISSUER,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
  ],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
