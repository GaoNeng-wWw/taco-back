import { Logger, Provider } from '@nestjs/common';
import {
	CLIENT_PROVIDER,
	MQTT_CLIENT_INSTANCE,
	MQTT_LOGGER_PROVIDER,
	MQTT_OPTION_PROVIDER,
} from './constant';
import { connect } from 'mqtt';
import { MqttModuleOptions } from './mqtt.interface';

export function createClientProvider(): Provider {
	return {
		provide: MQTT_CLIENT_INSTANCE,
		useFactory(option: MqttModuleOptions, logger: Logger) {
			//
			const client = connect(option.uri, {
				...option,
			});
			client.on('connect', () => {
				logger.log('MQTT connect success');
			});
			client.on('offline', () => {
				logger.log('MQTT offline');
			});
			client.on('disconnect', () => {
				logger.log('MQTT disconnected');
			});

			client.on('error', (error) => {
				logger.error(error.message, error.stack);
			});

			client.on('reconnect', () => {
				logger.log('MQTT reconnecting');
			});

			client.on('close', () => {
				logger.log('MQTT close');
			});
		},
		inject: [MQTT_OPTION_PROVIDER, MQTT_LOGGER_PROVIDER],
	};
}
