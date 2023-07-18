import { Test, TestingModule } from '@nestjs/testing';
import { NoticeService } from '../notice.service';
import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { Random } from 'mockjs';
import { createNotice } from '@app/factory';
import { Notice, SenderType } from '@app/interface';
import { ConfigModule, ConfigService } from '@app/config';

describe('NoticeService', () => {
	let service: NoticeService;
	const randomNotice: string[] = [];
	const senderType = [SenderType.FRIEND, SenderType.GROUP, SenderType.SYSTEM];
	for (let i = 0; i < 100; i++) {
		const t = senderType[Random.integer(0, senderType.length - 1)];
		const notice = createNotice(i.toString(), t, {
			avatar: Random.image(),
		});
		randomNotice.push(JSON.stringify(notice));
	}
	const diff = (a: any[], b: any[]) => {
		a = a.map((v) => JSON.stringify(v));
		b = b.map((v) => JSON.stringify(v));
		return new Set([...a].filter((item) => !b.includes(item)));
	};
	const inter = (a: any[], b: any[]) =>
		new Set([...a].filter((x) => b.includes(x)));
	let count = 2;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NoticeService,
				{
					provide: ConfigService,
					useValue: {
						get: (path: string) => {
							if (
								path === 'system.notice.size' &&
								count++ % 3 !== 0
							) {
								return 10;
							} else {
								if (path === 'system.size') {
									return 10;
								}
								return undefined;
							}
						},
					},
				},
				{
					provide: getRedisToken('default'),
					useValue: {
						zremrangebyrank: jest.fn(),
						zrange: async (
							key: string,
							start: number,
							end: number,
						) => {
							return randomNotice.slice(start, end);
						},
						zadd: (key: string, notice: string) => {
							randomNotice.push(notice);
							return 1;
						},
					},
				},
			],
			imports: [ConfigModule.forRoot('config.toml')],
		}).compile();

		service = module.get<NoticeService>(NoticeService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	describe('get notice', () => {
		it('should get notices', async () => {
			expect(service.getNotice('', 1)).resolves.not.toStrictEqual([]);
			expect(service.getNotice('', 2)).resolves.not.toStrictEqual([]);
			expect(service.getNotice('', 10)).resolves.not.toStrictEqual([]);
		});
		it('intersection shoule be empty set', async () => {
			/**
			 * If is empty then it mean two scenarios.
			 * The first. The beginning and end of a collection calc has some wrong
			 * Second, 'ioredis' lib has some wrong
			 */
			const first = await service.getNotice('', 1);
			const second = await service.getNotice('', 2);
			const last = await service.getNotice('', 10);
			const secondLast = await service.getNotice('', 9);
			expect(inter(first, second).size).toBe(0);
			expect(inter(secondLast, last).size).toBe(0);
		});
		it('diff should be not empty set', async () => {
			/**
			 * If is not empty set then it mean.
			 * There is an intersection between set A and set B
			 */
			const first = await service.getNotice('', 1);
			const second = await service.getNotice('', 2);
			const last = await service.getNotice('', 10);
			const secondLast = await service.getNotice('', 9);
			expect(diff(first, second).size).not.toBe(0);
			expect(diff(secondLast, last).size).not.toBe(0);
		});
	});
	describe('setNotice', () => {
		it('set success', () => {
			const t = senderType[Random.integer(0, senderType.length - 1)];
			const notice = createNotice('1', t, {
				avatar: Random.image(),
			});
			expect(service.setNotice('', notice)).resolves.toBe(1);
		});
	});
});
