import { Module } from '@nestjs/common';
import { MessagePusherService } from './message-pusher.service';
import { MessagePusherGateway } from './message-pusher.gateway';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@common/schema/user';
import { NoticePushController } from './notice-pusher.controller';
import { RequestPusherController } from './request-pusher.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'user',
        schema: UserSchema,
        collection: 'user',
      },
    ]),
  ],
  providers: [JwtService, MessagePusherGateway, MessagePusherService],
  controllers: [NoticePushController, RequestPusherController],
})
export class MessagePusherModule {}
