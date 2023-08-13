import { Module } from '@nestjs/common';
import { BlackListService } from './black-list.service';
import { BlackListController } from './black-list.controller';
import { MqModule } from '@app/mq';
import { ModelDefinitionModule } from '@app/model-definition';

@Module({
	imports: [MqModule, ModelDefinitionModule],
	controllers: [BlackListController],
	providers: [BlackListService],
})
export class BlackListModule {}
