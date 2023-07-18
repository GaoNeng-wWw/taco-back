import { CacheModule } from '@app/cache';
import { DynamicModule, Module } from '@nestjs/common';
import { AccountCacheService } from './account.service';

@Module({
	imports: [CacheModule],
	providers: [],
	exports: [],
})
export class AccountCacheModule {
	static use(ns?: string): DynamicModule {
		return {
			imports: [CacheModule],
			module: AccountCacheModule,
			providers: [
				{
					provide: 'ACCOUNT_CACHE',
					useValue: ns ?? 'ACCOUNT_CACHE',
				},
				AccountCacheService,
			],
			exports: [AccountCacheModule, AccountCacheService],
		};
	}
}
