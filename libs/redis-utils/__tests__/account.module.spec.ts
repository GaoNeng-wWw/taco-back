import { AccountCacheModule } from '@app/redis-utils';

describe('Account Module', () => {
	const m = AccountCacheModule.use('ACCOUNT_CACHE');
	it('shoule be define', () => {
		expect(m).toBeDefined();
	});
	it('options', () => {
		expect(AccountCacheModule.use().providers[0]['useValue']).toEqual(
			'ACCOUNT_CACHE',
		);
		expect(m.providers[0]['useValue']).toEqual('ACCOUNT_CACHE');
		expect(m.module).toEqual(AccountCacheModule);
		expect(m.exports.length).toBeGreaterThan(1);
		expect(m.global).toBeUndefined();
		expect(m.providers.length).toBeGreaterThan(1);
	});
});
