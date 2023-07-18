import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../src/config.service';
import { ConfigModule } from '../src/config.module';

describe('ConfigService', () => {
	let service: ConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot('config.toml')],
			providers: [],
		}).compile();

		service = module.get<ConfigService>(ConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	it('get', () => {
		expect(service.get<'http.port'>('http.port')).toBe(3000);
	});
});
