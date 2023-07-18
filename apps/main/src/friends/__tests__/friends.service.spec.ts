import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from '../friends.service';
import { Users, UsersDocument, UsersSchema } from '@app/schemas/user.schema';
import {
	closeInMongodConnection,
	rootMongooseTestModule,
} from '@app/mock/memory-mongo';
import mongoose, { Model } from 'mongoose';
import {
	Friend,
	FriendDocument,
	FriendSchema,
} from '@app/schemas/friend-ship.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BlackList, BlackListSchema } from '@app/schemas/black-list.schema';
import { ConfigService } from '@app/config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createMock } from '@golevelup/nestjs-testing';
import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { Counter, CounterSchema } from '@app/schemas/counter.schema';
import { Groups, GroupsSchema } from '@app/schemas/group.schema';
import { Questions, QuestionsSchema } from '@app/schemas/querstions.schema';
import { BlackListCacheService } from '@app/redis-utils/black-list/black-list.service';
import { AccountCacheService } from '@app/redis-utils/account/account.service';
import { createRequest } from '@app/factory';
import { FriendAction } from '@app/interface';
import { ServiceError } from '@app/errors';

describe('FriendsService', () => {
	let service: FriendsService;
	let friendModel: Model<FriendDocument>;
	let userModel: Model<UsersDocument>;
	const createFakeUser = (tid: string) => {
		return {
			nick: `test-${tid}`,
			tid: tid,
			password: '',
			sex: '',
			email: '',
			description: '',
		} as Users;
	};
	const _ids = [];
	let inBlackList = true;
	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FriendsService,
				{
					provide: AmqpConnection,
					useValue: {
						publish: async () => true,
						request: async () => true,
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: (key: string) => {
							if (
								key === 'system.request.expire' ||
								key === 'global.expire'
							) {
								return Infinity;
							}
							if (
								key === 'system.friends.size' ||
								key === 'system.size'
							) {
								return 10;
							}
						},
					},
				},
				{
					provide: getRedisToken('default'),
					useValue: {
						sismember: () => inBlackList,
						sadd: () => true,
					},
				},
				{
					provide: BlackListCacheService,
					useValue: {
						inBlackList: () => Promise.resolve(inBlackList),
						addBlackList: () => void 0,
						removeTarget: () => void 0,
					},
				},
				{
					provide: AccountCacheService,
					useValue: {
						getId: () => void 0,
					},
				},
			],
			imports: [
				await rootMongooseTestModule(),
				MongooseModule.forFeature([
					{
						name: Friend.name,
						collection: 'friend',
						schema: FriendSchema,
					},
					{
						name: BlackList.name,
						collection: 'black-list',
						schema: BlackListSchema,
					},
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

		service = module.get<FriendsService>(FriendsService);
		const instance = mongoose.connections[1];
		friendModel = instance.models[Friend.name];
		userModel = instance.models[Users.name];
		for (let i = 1; i <= 100; i++) {
			_ids.push(
				(await userModel.insertMany(createFakeUser(i.toString())))[0]
					.tid,
			);
		}
		for (let i = 2; i < _ids.length; i++) {
			await friendModel.insertMany({
				source: '1',
				target: _ids[i],
				tag: 'test',
			});
		}
	}, 60 * 1000);
	afterAll(async () => {
		await closeInMongodConnection();
	});
	it(
		'hasFriend',
		() => {
			return expect(service.hasFriend('1', '2')).resolves.not.toThrow();
		},
		60 * 1000,
	);
	describe('Add friend', () => {
		it('no nick', () => {
			service.hasFriend = () => Promise.resolve(false);
			expect(
				service.add('1', { tid: '2', msg: '' }),
			).resolves.not.toThrow();
		});
		it('has nick', () => {
			service.hasFriend = () => Promise.resolve(false);
			expect(
				service.add('1', { tid: '3', msg: '' }),
			).resolves.not.toThrow();
		});
		it('is friend', async () => {
			service.hasFriend = () => Promise.resolve(true);
			expect(service.add('1', { tid: '-1', msg: '' })).rejects.toThrow();
		});
	});
	describe('Remove Friend', () => {
		it('success', () => {
			service.hasFriend = () => Promise.resolve(true);
			return expect(service.remove('1', '2')).resolves.not.toThrow();
		});
		it('is not friend', () => {
			service.hasFriend = () => Promise.resolve(false);
			return expect(service.remove('1', '2')).rejects.toThrow();
		});
	});
	describe('Change Tag', () => {
		it('fail', () => {
			service.hasFriend = () => Promise.resolve(false);
			return expect(
				service.updateTag('1', { tid: '2', tag: 'test-2' }),
			).rejects.toThrow();
		});
		it('success', () => {
			service.hasFriend = () => Promise.resolve(true);
			return expect(
				service.updateTag('1', { tid: '2', tag: 'test-2' }),
			).resolves.toBeTruthy();
		});
	});
	describe('accept', () => {
		it(
			'accept success',
			() => {
				const req = createRequest(
					FriendAction.ADD,
					'2',
					'FRIEND',
					new Date().getTime() + 10e9,
					'3',
					{},
				);
				return expect(service.accept(req)).resolves.not.toThrow();
			},
			30 * 1000,
		);
		it(
			'accept failed because the request has expired',
			() => {
				const req = createRequest(
					FriendAction.ADD,
					'2',
					'FRIEND',
					new Date().getTime() - 10e9,
					'3',
					{},
					false,
				);
				return expect(service.accept(req)).rejects.toThrow(
					ServiceError,
				);
			},
			30 * 1000,
		);
	});
	it('get friend', async () => {
		return expect((await service.get('1')).length).toBe(10);
	});
	it('block', () => {
		inBlackList = true;
		expect(service.block('1', '2')).rejects.toThrow();
		inBlackList = false;
		return expect(service.block('1', '2')).resolves.not.toThrow();
	});
	it('unblock', () => {
		inBlackList = true;
		expect(service.unblock('1', '2')).resolves.not.toThrow();
		inBlackList = false;
		return expect(service.unblock('1', '2')).rejects.toThrow();
	});
});
