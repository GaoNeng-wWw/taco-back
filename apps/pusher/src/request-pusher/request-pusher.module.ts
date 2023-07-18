import { Module } from '@nestjs/common';
import { RequestPusherService } from './request-pusher.service';
import { RequestPusherController } from './request-pusher.controller';

@Module({
	controllers: [RequestPusherController],
	providers: [RequestPusherService],
})
export class RequestPusherModule {}
