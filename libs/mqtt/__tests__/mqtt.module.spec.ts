import { ConfigModule, ConfigService } from '@app/config';
import { MqttModule, MqttService } from '@app/mqtt';
import { Test, TestingModule } from '@nestjs/testing';

describe.skip('MQTT Module', () => {
	let module: TestingModule;
	let service: MqttService;
	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [
				MqttModule.forRootAsync({
					useFactory() {
						return {
							uri: '',
							host: 'localhost',
						};
					},
				}),
			],
		}).compile();
		service = module.get<MqttService>(MqttService);
	});
	it('module shoule be define', () => {
		expect(module).toBeDefined();
	});
	it('should not to throw', () => {
		expect(service.client).toBeDefined();
		// expect(service.publish('test-topic', 'message')).resolves.not.toThrow();
	});
});
