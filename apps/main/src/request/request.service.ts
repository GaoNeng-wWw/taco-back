import { ConfigService } from '@app/config';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import { getAction, getModule, isExpired } from '@app/factory';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { FriendAction, GroupAction, ModuleKeys, Request } from '@app/interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Redis } from 'ioredis';
import { isEmpty } from 'lodash';

@Injectable()
export class RequestService {
	private REQUEST_NAMESPACE = (tid: string) => `request:${tid}`;
	private REQUEST_HASH_KEY_NAMESPACE = (tid: string) =>
		`request:split:${tid}`;
	constructor(
		@InjectRedis() private readonly redis: Redis,
		private readonly config: ConfigService,
		private readonly channel: AmqpConnection,
	) {}
	@RabbitRPC({
		exchange: 'system.call',
		queue: 'system.call.request',
		routingKey: 'request.add',
		createQueueIfNotExists: true,
	})
	async addRequest(tid: string, request: Request<any, any>) {
		const req = JSON.stringify(request);
		const namespace = this.REQUEST_NAMESPACE(tid);
		const splitNameSpace = this.REQUEST_HASH_KEY_NAMESPACE(tid);
		const rid = createHash('sha256').update(req).digest('hex').toString();
		await this.redis.hset(namespace, {
			[rid]: req,
		});
		const members = [
			{
				rid,
				scores: request.expire,
			},
		];
		await this.redis.hsetnx(namespace, rid, request.expire);
		await this.redis.zadd(
			splitNameSpace,
			...(members.map(({ rid, scores }) => [scores, rid]) as unknown as (
				| string
				| number
			)[]),
		);
		return rid;
	}
	@RabbitRPC({
		exchange: 'system.call',
		queue: 'system.call.request',
		routingKey: 'request.remove',
		createQueueIfNotExists: true,
	})
	async removeRequest(tid: string, rid: string) {
		const namespace = this.REQUEST_NAMESPACE(tid);
		await this.redis.hdel(namespace, rid);
		return true;
	}
	async getAllRequest(tid: string, page?: number) {
		const namespace = this.REQUEST_NAMESPACE(tid);
		const size =
			this.config.get<number>('system.request.size') ??
			this.config.get<number>('system.size');
		const splitNameSpace = this.REQUEST_HASH_KEY_NAMESPACE(tid);
		let keys: string[] = [];
		if (!page) {
			keys = await this.redis.zrange(
				splitNameSpace,
				0,
				Number.MAX_SAFE_INTEGER,
			);
		} else {
			keys = await this.redis.zrange(
				splitNameSpace,
				page - 1 * size,
				page * size,
			);
		}
		const requests: Request<any, any>[] = [];
		for (let i = 0; i < keys.length; i++) {
			requests.push(
				JSON.parse(await this.redis.hget(namespace, keys[i])),
			);
		}
		return requests
			.map((request) => {
				const rid = request.rid;
				return {
					[rid]: request,
				};
			})
			.reduce((pre, cur) => {
				return {
					...pre,
					...cur,
				};
			}, {});
	}
	async getReuqest(
		tid: string,
		rid: string,
	): Promise<Request<ModuleKeys, FriendAction | GroupAction>> {
		const namespace = this.REQUEST_NAMESPACE(tid);
		return JSON.parse((await this.redis.hget(namespace, rid)) ?? '{}');
	}
	/**
	 * For decoupling and reuse, rabbitmq is used here to call other services
	 * @example
	 * ```
	 * // 1. Function will get 'tid' request by 'rid'
	 * // 2. Get request module and action
	 * // 3. If is accpt will used `module.action.status` routing key send request to `system.call` exchange.
	 * // 4. The exchange will redirect to corresponding module
	 * call('tid','rid','accpt')
	 * ```
	 */
	async call<T>(tid: string, rid: string, status: 'accept' | 'refuse') {
		const request = await this.getReuqest(tid, rid);
		if (isEmpty(request)) {
			throw new ServiceError(
				serviceErrorEnum.NOT_FIND_REQUEST,
				HttpStatus.BAD_REQUEST,
			);
		}
		if (isExpired(request)) {
			throw new ServiceError(
				serviceErrorEnum.REQUEST_EXPIRED,
				HttpStatus.BAD_REQUEST,
			);
		}
		const module = getModule(request);
		const action = getAction(request);
		return await this.channel.request<T>({
			exchange: 'system.call',
			routingKey: `${module}.${action}.${status}`,
			payload: request,
		});
	}
}
