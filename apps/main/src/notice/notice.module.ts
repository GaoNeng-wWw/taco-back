import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { ConfigModule } from '@app/config';
import { CacheModule } from '@app/cache';
import { MqModule } from '@app/mq';

@Module({
	controllers: [NoticeController],
	providers: [NoticeService],
	imports: [CacheModule, ConfigModule, MqModule],
})
export class NoticeModule {}
