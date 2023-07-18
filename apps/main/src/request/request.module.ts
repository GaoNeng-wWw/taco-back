import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { CacheModule } from '@app/cache';
import { ConfigModule } from '@app/config';
import { MqModule } from '@app/mq';

@Module({
	controllers: [RequestController],
	providers: [RequestService],
	imports: [CacheModule, ConfigModule, RequestModule, MqModule],
})
export class RequestModule {}
