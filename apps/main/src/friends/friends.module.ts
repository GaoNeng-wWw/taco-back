import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { ModelDefinitionModule } from '@app/model-definition';
import { MqModule } from '@app/mq';
import { AccountCacheModule, BlackListCacheModule } from '@app/redis-utils';
import { CacheModule } from '@app/cache';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	imports: [
		CacheModule,
		ModelDefinitionModule,
		MqModule,
		BlackListCacheModule.use(),
		AccountCacheModule.use(),
	],
})
export class FriendsModule {}
