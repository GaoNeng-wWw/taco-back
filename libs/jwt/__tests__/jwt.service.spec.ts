import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { DbModule } from '@app/db';
import { mockFactory } from '@app/mock';
import { JwtService } from '../src/jwt.service';
import { JwtService as JWTService } from '@nestjs/jwt';
import { Random } from 'mockjs';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@app/config';
import { KeyOptions, KeyPairModule, KeyPairService } from '@app/keypair';

const fakeData = {
	uid: '123',
	password: Random.paragraph(0, 8),
	nick: Random.name(false),
	description: Random.paragraph(0, 8),
	email: Random.email(),
	sex: 'female',
	question: {
		Q1: 'A1',
	},
};
describe('JwtService', () => {
	let service: JwtService;
	let jwt: JWTService;
	const keyPair = new KeyPairService({
		type: 'ecc',
		curve: 'ed25519',
		keyExpirationTime: 100000,
		format: 'armored',
		userIDs: [
			{
				name: 'Taco',
				email: 'no-reply@taco.org',
			},
		],
		passphrase: '123',
	} as KeyOptions);
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				JwtModule.registerAsync({
					imports: [ConfigModule.forRoot('config.toml')],
					inject: [ConfigService],
					async useFactory(
						config: ConfigService,
					): Promise<JwtModuleOptions> {
						const secret = config.get<string>('global.jwt.secret');
						jwt = new JWTService({
							secret,
							signOptions: {
								expiresIn: config
									.get('global.jwt.expire')
									.toString(),
							},
							publicKey: (await keyPair.pub).armor(),
							privateKey: (await keyPair.pri).armor(),
						});
						return {
							secret,
							signOptions: {
								expiresIn: config
									.get('global.jwt.expire')
									.toString(),
							},
							publicKey: (await keyPair.pub).armor(),
							privateKey: (await keyPair.pri).armor(),
						};
					},
				}),
			],
			providers: [
				JwtService,
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
						findOne({
							tid,
							password,
						}: {
							tid: string;
							password: string;
						}) {
							return {
								lean: jest.fn().mockReturnValue({
									exec: () => {
										if (tid !== '-1') {
											return fakeData;
										}
										return {};
									},
								}),
							};
						},
						// findOne: jest.fn().mockReturnValue({
						// 	lean: jest.fn().mockReturnValue({
						// 		exec: jest.fn().mockReturnValue(fakeData),
						// 	}),
						// }),
					},
				},
			],
		}).compile();
		service = module.get<JwtService>(JwtService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	it('sign success', async () => {
		const token = service.sign('123', '123');
		const fakeToken = jwt.sign(fakeData, {
			privateKey: (await keyPair.pri).armor(),
		});
		expect(token).resolves.toBe(fakeToken);
	});
	it('sign fail', () => {
		expect(service.sign('-1', '000')).resolves.toBeFalsy();
	});
	it('verify success', async () => {
		const token = service.sign('123', '123');
		const fakeToken = jwt.sign(fakeData, {
			privateKey: (await keyPair.pri).armor(),
		});
		expect(service.verify(await token)).resolves.toStrictEqual(
			jwt.verify(fakeToken),
		);
	});
	it('decode success', async () => {
		const token = service.sign('123', '123');
		const fakeToken = jwt.sign(fakeData, {
			privateKey: (await keyPair.pri).armor(),
		});
		expect(service.decode(await token)).resolves.toStrictEqual(
			jwt.decode(fakeToken),
		);
	});
	it('sign object success', () => {
		expect(service.signObject({ foo: 'bar' })).resolves.not.toBe('');
	});
});
