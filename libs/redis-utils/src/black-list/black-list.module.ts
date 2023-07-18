import { CacheModule } from '@app/cache';
import { DynamicModule, Module } from '@nestjs/common';
import { BlackListCacheService } from './black-list.service';

@Module({
	imports: [CacheModule],
	providers: [],
	exports: [],
})
export class BlackListCacheModule {
	static use(ns?: string): DynamicModule {
		return {
			imports: [CacheModule],
			module: BlackListCacheModule,
			providers: [
				{
					provide: 'BLACK_LIST_CACHE',
					useValue: ns ?? 'BLACK_LIST_CACHE',
				},
				BlackListCacheService,
			],
			exports: [BlackListCacheModule, BlackListCacheService],
		};
	}
}
