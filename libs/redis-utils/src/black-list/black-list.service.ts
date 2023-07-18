import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { useNameSpace } from '../namespaces';

@Injectable()
export class BlackListCacheService {
	constructor(
		@Inject('BLACK_LIST_CACHE') private ns: string,
		@InjectRedis() private redis: Redis,
	) {}
	/**
	 * when target in source black list, will return true
	 */
	async inBlackList(source: string, target: string) {
		const key = useNameSpace(this.ns, source);
		return Boolean(this.redis.sismember(key, target));
	}
	async addBlackList(source: string, target: string) {
		const key = useNameSpace(this.ns, source);
		return this.redis.sadd(key, target);
	}
	/**
	 * remove target member from source blacklist
	 */
	async removeTarget(source: string, target: string) {
		const key = useNameSpace(this.ns, source);
		return this.redis.srem(key, target);
	}
}
