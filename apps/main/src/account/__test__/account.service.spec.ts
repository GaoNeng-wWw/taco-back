import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@app/jwt';
import { CacheModule } from '@app/cache';
import {
	RedisModule,
	RedisModuleOptions,
	getRedisToken,
} from '@liaoliaots/nestjs-redis';
import {
	rootMongooseTestModule,
	rootRedisTestConfig,
	rootRedisTestModle,
} from '@app/mock/memory-mongo';
import { Counter, CounterSchema } from '@app/schemas/counter.schema';
import { Groups, GroupsSchema } from '@app/schemas/group.schema';
import { Users, UsersSchema } from '@app/schemas/user.schema';
import { Questions, QuestionsSchema } from '@app/schemas/querstions.schema';
import { RegisterDto } from '@app/interface';
import { ConfigService } from '@app/config';
import { ServiceError } from '@app/errors';

describe('AccountService', () => {
	let service: AccountService;
	let module: TestingModule;
	let v = -1;
	const fakeRegisteData: RegisterDto = {
		name: 'Test',
		password: '123456789Sd!',
		email: 'test@no-reply.com',
		description: '',
		sex: 'Other',
		question: {
			Q1: 'A1',
		},
		birthday: new Date().getTime().toString(),
	};
	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				AccountService,
				{
					provide: JwtService,
					useValue: {
						signObject: jest.fn().mockReturnValue(''),
						decode: jest.fn().mockResolvedValue(''),
						verify: async () => {
							if (v == -1) {
								throw new Error('fail');
							}
							if (v == -2) {
								throw { name: 'TokenExpireError' };
							}
							return '';
						},
					},
				},
				{
					provide: getRedisToken('default'),
					useValue: {
						incrby: jest.fn().mockResolvedValue(1),
						get: jest.fn().mockResolvedValue(1),
						del: jest.fn(),
						set: jest.fn(),
						setnx: jest.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn(),
					},
				},
			],
			imports: [
				await rootMongooseTestModule(),
				MongooseModule.forFeature([
					{
						name: Users.name,
						collection: 'users',
						schema: UsersSchema,
					},
					{
						name: Groups.name,
						collection: 'groups',
						schema: GroupsSchema,
					},
					{
						name: Counter.name,
						collection: 'counter',
						schema: CounterSchema,
					},
					{
						name: Questions.name,
						collection: 'questions',
						schema: QuestionsSchema,
					},
				]),
			],
		}).compile();

		service = module.get<AccountService>(AccountService);
		await service.registe(fakeRegisteData);
	});
	// afterAll(async () => {
	// 	await closeInMongodConnection();
	// });

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	const loginData = {
		tid: 2,
		password: '123456789Sd!',
	};
	const failLoginData = {
		tid: -1,
		password: '123456789Sd!',
	};
	describe('register', () => {
		it('success', () => {
			expect(
				service.registe({
					...fakeRegisteData,
					email: 'test2@no-reply.com',
				}),
			).resolves.toBeDefined();
		});
		it('fail', () => {
			expect(service.registe(fakeRegisteData)).rejects.toThrow();
		});
	});
	describe('login', () => {
		it('success', () => {
			expect(service.login(loginData)).resolves.not.toThrow();
		});
		it('fail', () => {
			expect(service.login(failLoginData)).rejects.toThrow();
		});
	});
	describe('change password', () => {
		it('success', () => {
			expect(
				service.changePassWord({
					tid: loginData.tid,
					old_pwd: loginData.password,
					new_pwd: '123456789Sd',
				}),
			).resolves.not.toThrow();
		});
	});
	describe('question', () => {
		let id: string;
		it('get question', async () => {
			id = (await service.getQuestion(loginData.tid)).id;
			expect(id).not.toBeFalsy();
		});
		it('check answer success', async () => {
			return await expect(
				service.checkAnswer(loginData.tid, id, fakeRegisteData),
			).resolves.toBeTruthy();
		});
		it('check answer fail', async () => {
			return await expect(
				service.checkAnswer(loginData.tid, id, {
					question: {
						Q1: 'fake answer',
					},
				}),
			).rejects.toThrow();
		});
	});
	describe('forget password', () => {
		it('success', async () => {
			return await expect(
				service.forgetPassword({
					tid: loginData.tid,
					answer: fakeRegisteData.question,
					new_pwd: 'newpwd',
				}),
			).resolves.toBeTruthy();
		});
		it('fail', async () => {
			await expect(
				service.forgetPassword({
					tid: loginData.tid,
					answer: {
						Q1: 'A2',
					},
					new_pwd: 'newpwd',
				}),
			).rejects.toThrow();
			await expect(
				service.forgetPassword({
					tid: loginData.tid,
					answer: {
						Q2: 'A2',
					},
					new_pwd: 'newpwd',
				}),
			).rejects.toThrow();
			return await expect(
				service.forgetPassword({
					tid: -1,
					answer: null,
					new_pwd: 'newpwd',
				}),
			).rejects.toThrow();
		});
	});
	it('alive', () => {
		return expect(service.alive({ tid: '1' })).resolves.not.toThrow();
	});
	it('refresh token', async () => {
		try {
			await service.refresh({ refresh_token: '' });
		} catch (e) {
			expect(e).toBeDefined();
		}
		v = -2;
		try {
			await service.refresh({ refresh_token: '' });
		} catch (e) {
			expect(e).toBeDefined();
		}
		v = 1;
		return expect(
			service.refresh({ refresh_token: '' }),
		).resolves.not.toThrow();
	});
});
