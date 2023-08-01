import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { DbModule } from '@app/db';
import { JwtModule } from '@app/jwt';
import { ModelDefinitionModule } from '@app/model-definition';
import { MqModule } from '@app/mq';
import { CacheModule } from '@app/cache';

@Module({
	imports: [
		CacheModule,
		DbModule,
		JwtModule,
		ModelDefinitionModule,
		MqModule,
	],
	controllers: [AccountController],
	providers: [AccountService],
})
export class AccountModule {}
