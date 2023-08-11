import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from '../request.service';
import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { Request, createRequest } from '@app/factory';
import { FriendAction } from '@app/interface';
import { ConfigService } from '@app/config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createMock } from '@golevelup/nestjs-testing';
import { serviceErrorEnum } from '@app/errors';

describe('RequestService', () => {
	let service: RequestService;
	const hash = {};
	const rids = [];
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RequestService,
				{
					provide: ConfigService,
					useValue: {
						get: (key: string) => {
							if (key === 'global.expire') {
								return 1;
							}
							if (
								key === 'system.request.size' ||
								key === 'system.size'
							) {
								return 10;
							}
						},
					},
				},
				{
					provide: AmqpConnection,
					useValue: createMock<AmqpConnection>(),
				},
				{
					provide: getRedisToken('default'),
					useValue: {
						hset: async (key: string, obj: object) => {
							const rid = Object.keys(obj)[0];
							rids.push(rid);
							Reflect.set(hash, rid, JSON.stringify(obj[rid]));
						},
						hsetnx: async (ns, field, time) => void 0,
						hdel: async (ns, rid) => {
							hash[rid] = undefined;
							const idx = rids.indexOf(rid);
							rids.splice(idx, 1);
						},
						hget: async (ns, rid) => {
							return typeof hash[rid] === 'string'
								? JSON.parse(hash[rid])
								: hash[rid];
						},
						hgetall: async (ns) => {
							return hash;
						},
						zadd: () => true,
						zrange: (ns, start, end) => {
							return rids.slice(start, end);
						},
					},
				},
			],
		}).compile();

		service = module.get<RequestService>(RequestService);
	});

	const expireRequest = createRequest(
		FriendAction.ADD,
		'',
		'FRIEND',
		1000 * 10000 * -1,
		'',
		{},
	);
	const neverExpireRequest = createRequest(
		FriendAction.ADD,
		'',
		'FRIEND',
		1e4,
		'',
		{},
	);
	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	it('add request', () => {
		const expireRequest = {
			action: '',
			meta: {},
			module: '',
			rid: '',
			sender: '',
			expire: 0,
			sign: '',
			recive: '',
		} as Request<any, any>;
		const neverExpireRequest = {
			action: '',
			meta: {},
			module: '',
			rid: '',
			sender: '',
			expire: Number.MAX_SAFE_INTEGER,
			sign: '',
			recive: '',
		} as Request<any, any>;
		expect(service.addRequest(expireRequest)).resolves.not.toBe('');
		expect(service.addRequest(neverExpireRequest)).resolves.not.toBe('');
	});
	describe('get all request', () => {
		it('all', () => {
			expect(service.getAllRequest('')).resolves.not.toStrictEqual({});
		});
		it('get page 1', () => {
			expect(service.getAllRequest('', 1)).resolves.not.toStrictEqual({});
		});
	});
	it('get request', () => {
		expect(service.getReuqest('', rids[0])).resolves.not.toThrow();
	});
	describe('call', () => {
		it('not find request', () => {
			expect(service.call('', 'undefined', 'accept')).rejects.toThrow();
			expect(service.call('', 'undefined', 'refuse')).rejects.toThrow();
		});
		it('expire', () => {
			expect(service.call('', rids[0], 'accept')).rejects.toThrowError(
				serviceErrorEnum.REQUEST_EXPIRED,
			);
			expect(service.call('', rids[0], 'refuse')).rejects.toThrowError(
				serviceErrorEnum.REQUEST_EXPIRED,
			);
		});
		it('noraml', () => {
			expect(service.call('', rids[1], 'accept')).resolves.not.toThrow(
				serviceErrorEnum.NOT_FIND_REQUEST,
			);
			expect(service.call('', rids[1], 'refuse')).resolves.not.toThrow(
				serviceErrorEnum.REQUEST_EXPIRED,
			);
		});
	});
	it('remove request', () => {
		expect(service.removeRequest('', rids[0])).resolves.not.toThrow();
		expect(rids.length).not.toBe(0);
	});
});
