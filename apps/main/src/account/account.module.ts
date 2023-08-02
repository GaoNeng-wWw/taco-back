import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { DbModule } from '@app/db';
import { JwtModule } from '@app/jwt';
import { ModelDefinitionModule } from '@app/model-definition';

import { CacheModule } from '@app/cache';

@Module({
	imports: [CacheModule, DbModule, JwtModule, ModelDefinitionModule],
	controllers: [AccountController],
	providers: [AccountService],
})
export class AccountModule {}
