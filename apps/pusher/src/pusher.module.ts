import { Module } from '@nestjs/common';
import { PusherController } from './pusher.controller';
import { PusherService } from './pusher.service';

@Module({
  imports: [],
  controllers: [PusherController],
  providers: [PusherService],
})
export class PusherModule {}
