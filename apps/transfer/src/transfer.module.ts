import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MessagePusherModule } from './message-pusher/message-pusher.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import configuration from '@common/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (): MongooseModuleFactoryOptions => {
        return {
          uri: `${process.env.MONGO_PATH}`,
        } as MongooseModuleFactoryOptions;
      },
    }),
    RedisModule.forRootAsync({
      useFactory: () => {
        return {
          config: [
            {
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              db: Number(process.env.REDIS_DB),
              password: process.env.REDIS_PASSWD,
            },
            {
              namespace: 'sub',
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              db: Number(process.env.REDIS_DB),
              password: process.env.REDIS_PASSWD,
            },
            {
              namespace: 'pub',
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              db: Number(process.env.REDIS_DB),
              password: process.env.REDIS_PASSWD,
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
