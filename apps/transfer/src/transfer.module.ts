import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MessagePusherModule } from './message-pusher/message-pusher.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import configuration from '@common/config';
import { DbModule } from '@app/db';
import { Redis } from '@app/redis';
import { JWTModule } from '@app/jwt';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DbModule,
    Redis,
    MessagePusherModule,
    JWTModule,
  ],
})
export class TransferModule {}
