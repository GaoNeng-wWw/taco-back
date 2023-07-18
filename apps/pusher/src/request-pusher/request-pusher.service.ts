import { ConfigService } from '@app/config';
import { Request } from '@app/interface';
import { Inject, Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SessionManagerService } from '../session-manager/session-manager.service';
import { requestEvent } from '@app/pusher-event';
import { createHash } from 'crypto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RequestPusherService {
	private REQUEST_NAMESPACE = (tid: string) => `request:${tid}`;
	private REQUEST_HASH_KEY_NAMESPACE = (tid: string) =>
		`request:split:${tid}`;
	constructor(
		@Inject() private sessionManager: SessionManagerService,
		@InjectRedis() private readonly redis: Redis,
		private readonly config: ConfigService,
	) {}
	@MessagePattern(process.env.RequestPusherQueue ?? 'pusher.request.push')
	async pushRequest(@Payload() payload: Request<any, any>) {
		const { recive } = payload;
		const client = this.sessionManager.get(recive);
		if (client) {
			client.emit(requestEvent, payload);
			return true;
		}
		return false;
	}
	@MessagePattern(
		process.env.RequestPersistence ?? 'pusher.request.persistence',
	)
	async persistenceRequest(@Payload() request: Request<any, any>) {
		//
		const { sender, recive } = request;
		const req = JSON.stringify(request);
		const namespace = this.REQUEST_NAMESPACE(recive);
		const splitNameSpace = this.REQUEST_HASH_KEY_NAMESPACE(recive);
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
	// async destoryRequest(){

	// }
}
