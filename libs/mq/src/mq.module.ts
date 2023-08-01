import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@app/config';

@Module({
	imports: [
		RabbitMQModule.forRootAsync(RabbitMQModule, {
			imports: [ConfigModule.forRoot('config.toml')],
			inject: [ConfigService],
			useFactory: (service: ConfigService) => ({
				uri: service.get('global.rabbitmq.uri'),
				exchanges: [
					{
						name: 'system.call',
						type: 'direct',
						createExchangeIfNotExists: true,
					},
				],
			}),
		}),
	],
	exports: [RabbitMQModule],
})
export class MqModule {}
