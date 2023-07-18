import { AccountCacheModule } from '@app/redis-utils';
import { BlackListCacheService } from '@app/redis-utils/black-list/black-list.service';
import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { Test } from '@nestjs/testing';

describe('Account Cache Service', () => {
	let module;
	let service: BlackListCacheService;
	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				{
					provide: getRedisToken('default'),
					useValue: {
						sismember: () => void 0,
						sadd: () => void 0,
						srem: () => void 0,
					},
				},
				{
					provide: 'BLACK_LIST_CACHE',
					useValue: 'BLACK_LIST_CACHE',
				},
				BlackListCacheService,
			],
		}).compile();
		service = module.get(BlackListCacheService);
	});
	it('should be define', () => {
		expect(service).toBeDefined();
	});

	it('addBlackList', () => {
		expect(service.addBlackList('', '')).resolves.not.toThrow();
	});
	it('inBlackList', () => {
		expect(service.inBlackList('', '')).resolves.not.toThrow();
	});
	it('removeTarget', () => {
		expect(service.removeTarget('', '')).resolves.not.toThrow();
	});
});
