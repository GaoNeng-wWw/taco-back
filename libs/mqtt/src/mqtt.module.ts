import { DynamicModule, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { PROVIDE } from './constant';
import { MqttModuleAsyncOptions } from './mqtt.interface';
import {
	createLoggerProvider,
	createOptionProviders,
} from './options.provider';
import { createClientProvider } from './client.provider';
export interface MqttProvider {
	username: string;
	password: string;
}
@Module({
	exports: [MqttService],
})
export class MqttModule {
	static forRootAsync(options: MqttModuleAsyncOptions): DynamicModule {
		return {
			module: MqttModule,
			providers: [
				...createOptionProviders(options),
				createLoggerProvider(options),
				createClientProvider(),
				MqttService,
			],
			global: true,
		};
	}
}
