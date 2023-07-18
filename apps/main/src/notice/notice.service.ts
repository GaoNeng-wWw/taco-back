import { ConfigService } from '@app/config';
import { Notice } from '@app/interface';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class NoticeService {
	private NOTICE_NAMESPACE = (tid: string) => `NOTICE:${tid}`;
	constructor(
		@InjectRedis() private readonly redis: Redis,
		private readonly config: ConfigService,
	) {}
	async getNotice(tid: string, page: number): Promise<Notice[]> {
		const size =
			this.config.get<number>('system.notice.size') ??
			this.config.get<number>('system.size');
		const start = (page - 1) * size;
		const end = page * size;
		const key = this.NOTICE_NAMESPACE(tid);
		const res = (await this.redis.zrange(key, start, end)).map<Notice>(
			(v) => JSON.parse(v),
		);
		await this.redis.zremrangebyrank(key, start, end);
		return res;
	}
	@RabbitRPC({
		exchange: 'system.call',
		queue: 'system.notice',
		routingKey: 'system.call.notice.setNotice',
		createQueueIfNotExists: true,
	})
	async setNotice(tid: string, notice: Notice) {
		const key = this.NOTICE_NAMESPACE(tid);
		return await this.redis.zadd(key, JSON.stringify(notice));
	}
}
