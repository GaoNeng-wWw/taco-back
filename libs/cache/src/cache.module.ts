import { Global, Module } from '@nestjs/common';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@app/config';
import { CacheService } from './cache.service';
import { rootRedisTestModle } from '@app/mock/memory-mongo';

@Global()
@Module({
	providers: [CacheService],
	exports: [CacheModule],
	imports: [
		RedisModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (
				config: ConfigService,
			): Promise<RedisModuleOptions> => {
				if (process.env.NODE_ENV === 'test') {
					return {
						config: {
							...(await rootRedisTestModle()),
						},
					};
				}
				return {
					readyLog: true,
					config: {
						host: config.get<string>('global.redis.host'),
						port: config.get<number>('global.redis.port'),
						db: config.get<number>('global.redis.db'),
						password: config.get<string>('global.redis.password'),
					},
				};
			},
		}),
	],
})
export class CacheModule {}
