import { Notice, createNotice } from '@app/factory';
import { SenderType } from '@app/interface';

describe('Notice', () => {
	it('shoule be defined', () => {
		expect(new Notice('', SenderType.FRIEND, {})).toBeDefined();
		expect(createNotice('', SenderType.FRIEND, {})).toBeDefined();
	});
	it('not same object', () => {
		expect(new Notice('', SenderType.FRIEND, {})).not.toBe(
			createNotice('', SenderType.FRIEND, {}),
		);
	});
});
