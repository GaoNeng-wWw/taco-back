import { Test, TestingModule } from '@nestjs/testing';
import { KeyPairService } from '../keypair.service';
import { OPTIONS, KeyOptions, KeyPairModule } from '../keypair.module';
import { Module } from '@nestjs/common';

describe('KeypairService', () => {
	let service: KeyPairService<'armored'>;
	let encryptMessage;
	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				KeyPairService,
				{
					provide: OPTIONS,
					useValue: {
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
					} as KeyOptions,
				},
			],
		}).compile();

		service = module.get<KeyPairService<'armored'>>(KeyPairService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	describe('generate key', () => {
		it('encrypt', () => {
			expect(service.encrypt('hello world')).resolves.not.toThrow();
		});
		it('decrypt', async () => {
			encryptMessage = await service.encrypt('hello world');
			expect(service.decrypt(encryptMessage)).resolves.not.toThrow();
			expect(service.decrypt(encryptMessage)).resolves.toMatchObject({
				msg: 'hello world',
			});
		});
	});
	it(
		'export keys',
		() => {
			expect(
				service.export({ format: 'pub pri', path: '.' }),
			).resolves.not.toThrow();
		},
		1 * 1000,
	);
	describe('read key', () => {
		beforeAll(async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					KeyPairService,
					{
						provide: OPTIONS,
						useValue: {
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
							option: {
								pub: 'key.pub',
								pri: 'key.pri',
								passphrase: '123',
							},
						} as KeyOptions,
					},
				],
			}).compile();
			service = module.get<KeyPairService<'armored'>>(KeyPairService);
		});
		it('should be defined', () => {
			expect(service).toBeDefined();
		});
		describe('generate key', () => {
			it('encrypt', () => {
				expect(service.encrypt('hello world')).resolves.not.toThrow();
			});
			it('decrypt', async () => {
				encryptMessage = await service.encrypt('hello world');
				expect(service.decrypt(encryptMessage)).resolves.not.toThrow();
				expect(service.decrypt(encryptMessage)).resolves.toMatchObject({
					msg: 'hello world',
				});
			});
		});
	});
	describe('Import Test', () => {
		@Module({
			imports: [
				KeyPairModule.forRoot({
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
				} as KeyOptions),
			],
			providers: [KeyPairService],
		})
		class TestClass {}
		it('should be defined', () => {
			expect(new TestClass()).toBeDefined();
		});
	});
});
