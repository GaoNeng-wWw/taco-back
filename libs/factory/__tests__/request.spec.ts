import { Request, createRequest, getAction, getModule } from '@app/factory';
import { GroupAction, Module } from '@app/interface';

describe('Request', () => {
	const expireTime = new Date().getTime() + 604800000;
	it('shoule be define', () => {
		expect(
			new Request(GroupAction.JOIN, '', Module.GROUP, expireTime, '', {}),
		).toBeDefined();
		expect(
			createRequest(
				GroupAction.JOIN,
				'',
				Module.GROUP,
				expireTime,
				'',
				{},
			),
		).toBeDefined();
	});
	it('not same object', () => {
		expect(
			new Request(GroupAction.JOIN, '', Module.GROUP, expireTime, '', {}),
		).not.toBe(
			createRequest(
				GroupAction.JOIN,
				'',
				Module.GROUP,
				expireTime,
				'',
				{},
			),
		);
	});
	const groupRequest = new Request(
		GroupAction.JOIN,
		'',
		Module.GROUP,
		expireTime,
		'',
		{},
	);
	it('get module', () => {
		expect(getModule(groupRequest)).toBe(Module.GROUP);
	});
	it('get action', () => {
		expect(getAction(groupRequest)).toBe(GroupAction.JOIN);
	});
});
