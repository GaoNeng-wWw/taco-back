import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { useNameSpace } from '../namespaces';

@Injectable()
export class AccountCacheService {
	constructor(
		@Inject('ACCOUNT_CACHE') private ns: string,
		@InjectRedis() private redis: Redis,
	) {}
	async getId(tid: string) {
		const key = useNameSpace(this.ns, 'ids');
		return this.redis.hget(key, tid);
	}
	async writeToken(tid: string, token: string, expire: number) {
		const key = useNameSpace(this.ns, 'token', tid);
		await this.redis.set(key, token);
		await this.redis.setnx(key, expire);
	}
	async deleteToken(tid: string) {
		const key = useNameSpace(this.ns, 'token', tid);
		await this.redis.del(key);
	}
	async getToken(tid: string) {
		return this.redis.get(useNameSpace(this.ns, 'token', tid));
	}
}
