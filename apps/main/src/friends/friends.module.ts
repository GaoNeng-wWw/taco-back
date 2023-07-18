import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { ModelDefinitionModule } from '@app/model-definition';
import { DbModule } from '@app/db';
import { ConfigModule } from '@app/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MqModule } from '@app/mq';
import { AccountCacheModule, BlackListCacheModule } from '@app/redis-utils';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	imports: [
		ModelDefinitionModule,
		MqModule,
		BlackListCacheModule,
		AccountCacheModule,
	],
})
export class FriendsModule {}
