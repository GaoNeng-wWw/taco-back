import { NestFactory } from '@nestjs/core';
import { PusherModule } from './pusher.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		PusherModule,
		{
			transport: Transport.RMQ,
			options: {
				urls: [process.env.RABBITMQ_PATH],
				queue: process.env.PUSHER_QUEUE,
				queueOptions: {
					durable: false,
				},
			},
		},
	);
	await app.listen();
}
bootstrap();
