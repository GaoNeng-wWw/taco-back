import { BlackListCacheModule } from '@app/redis-utils';

describe('Black List Module', () => {
	const m = BlackListCacheModule.use('BLACK_LIST');
	it('shoule be define', () => {
		expect(m).toBeDefined();
	});
	it('options', () => {
		expect(BlackListCacheModule.use().providers[0]['useValue']).toEqual(
			'BLACK_LIST_CACHE',
		);
		expect(m.providers[0]['useValue']).toEqual('BLACK_LIST');
		expect(m.exports.length).toBeGreaterThan(1);
		expect(m.global).toBeUndefined();
		expect(m.providers.length).toBeGreaterThan(1);
	});
});
