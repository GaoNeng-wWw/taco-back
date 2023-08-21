import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '../account.controller';
import { AccountService } from '../account.service';
import { mockFactory } from '@app/mock';
import { RegisterDto } from '@app/interface';

describe('AccountController', () => {
	let controller: AccountController;
	const regData: RegisterDto = {
		name: 'test',
		birthday: new Date().getTime().toString(),
		password: 'pwd',
		email: 'example@no-reply.com',
		sex: 'male',
		description: '',
		question: {
			Q1: 'A1',
		},
	};
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccountController],
			providers: [
				{
					provide: AccountService,
					useValue: mockFactory(AccountService, true),
				},
			],
		}).compile();

		controller = module.get<AccountController>(AccountController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
	it('register', () => {
		expect(controller.resgiter(regData)).resolves.toBe(undefined);
	});
	it('login', () => {
		expect(controller.login({ tid: 123, password: '123' })).resolves.toBe(
			undefined,
		);
	});
	it('get question', () => {
		expect(
			controller.getQuestion({
				tid: 1,
			}),
		).resolves.toBe(undefined);
	});
	it('check question', () => {
		expect(
			controller.checkAnswer(1, '123', {
				question: {
					answer: 'fake',
				},
			}),
		).resolves.toBe(undefined);
	});
	it('change password', () => {
		expect(
			controller.changePassword({
				tid: 1,
				old_pwd: 'old',
				new_pwd: 'new',
			}),
		).resolves.toBe(undefined);
	});
	it('forget password', () => {
		expect(
			controller.forgetPassword({
				tid: 1,
				answer: {
					...regData['question'],
				},
				new_pwd: '123',
			}),
		).resolves.not.toThrow();
	});
});
