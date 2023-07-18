import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { DbModule } from '@app/db';
import { mockFactory } from '@app/mock';
import { JwtService } from '@app/jwt';
import { Profile } from '@app/interface';

describe('UsersService', () => {
	let service: UsersService;
	const regData = {
		nick: 'test',
		birthday: new Date().getTime().toString(),
		password: 'pwd',
		email: 'example@no-reply.com',
		sex: 'male',
	};
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: DbModule,
					useValue: mockFactory(DbModule),
				},
				{
					provide: MongooseModule,
					useValue: mockFactory(MongooseModule),
				},
				{
					provide: getModelToken('Users'),
					useValue: {
						new: jest.fn().mockResolvedValue({}),
						constructor: jest.fn().mockRejectedValue({}),
						findOneAndUpdate: (tid: string, newData: Profile) => {
							return {
								lean: () => {
									return {
										exec: () => {
											if (tid === '-1') {
												return {};
											}
											return {
												toObject: <T>() => newData,
											};
											// return newData;
										},
									};
								},
							};
						},
						findOne: ({
							tid,
							password,
						}: {
							tid: string;
							password: string;
						}) => {
							return {
								lean: () => {
									return {
										exec: () => {
											if (
												password === '123456' ||
												tid === '-1'
											) {
												return {};
											}
											return regData;
										},
									};
								},
							};
						},
						insertMany: jest.fn().mockReturnValue({
							lean: jest.fn().mockReturnValue({
								exec: jest
									.fn()
									.mockReturnValue(
										Number.parseInt(
											(Math.random() * 100).toString(),
										),
									),
							}),
						}),
						lean: jest.fn(),
					},
				},
				{
					provide: getModelToken('Counter'),
					useValue: {
						new: jest.fn().mockResolvedValue({}),
						constructor: jest.fn().mockRejectedValue({}),
						findOneAndUpdate: jest.fn().mockReturnValue({
							lean: jest.fn().mockReturnValue({
								exec: jest
									.fn()
									.mockReturnValue(
										Number.parseInt(
											(Math.random() * 100).toString(),
										),
									),
							}),
						}),
						insertMany: jest.fn().mockReturnValue({
							lean: jest.fn().mockReturnValue({
								exec: jest.fn(),
							}),
						}),
						lean: jest.fn(),
					},
				},
				{
					provide: JwtService,
					useValue: {
						signObject: jest.fn().mockReturnValue(''),
						decode: jest.fn().mockReturnValue(''),
					},
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
	});
	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	describe('profile', () => {
		describe('get', () => {
			it('success', () => {
				expect(service.profile('1')).resolves.not.toThrow();
			});
			it('fail', () => {
				expect(service.profile('-1')).rejects.toThrow();
			});
		});
		describe('update', () => {
			it('success', () => {
				expect(
					service.updateProfile('1', {
						nick: 'other',
					}),
				).resolves.not.toThrow();
			});
		});
	});
});
