import { Module } from '@nestjs/common';
import { RequestPusherModule } from './request-pusher/request-pusher.module';

@Module({
	imports: [RequestPusherModule],
	controllers: [],
	providers: [],
})
export class PusherModule {}
