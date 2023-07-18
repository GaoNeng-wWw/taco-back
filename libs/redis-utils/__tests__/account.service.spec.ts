import { AccountCacheModule } from '@app/redis-utils';
import { AccountCacheService } from '@app/redis-utils/account/account.service';
import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { Test } from '@nestjs/testing';

describe('Account Cache Service', () => {
	let module;
	let service: AccountCacheService;
	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				{
					provide: getRedisToken('default'),
					useValue: {
						hget: () => void 0,
						set: () => void 0,
						setnx: () => void 0,
						del: () => void 0,
						get: () => void 0,
					},
				},
				{
					provide: 'ACCOUNT_CACHE',
					useValue: 'ACCOUNT_CACHE',
				},
				AccountCacheService,
			],
		}).compile();
		service = module.get(AccountCacheService);
	});
	it('should be define', () => {
		expect(service).toBeDefined();
	});

	it('getId', () => {
		expect(service.getId('')).resolves.not.toThrow();
	});
	it('write token', () => {
		expect(service.writeToken('', '', 0)).resolves.not.toThrow();
	});
	it('delete token', () => {
		expect(service.deleteToken('')).resolves.not.toThrow();
	});
	it('get token', () => {
		expect(service.getToken('')).resolves.not.toThrow();
	});
});
