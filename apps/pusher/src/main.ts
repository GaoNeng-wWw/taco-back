import { NestFactory } from '@nestjs/core';
import { PusherModule } from './pusher.module';

async function bootstrap() {
	const app = await NestFactory.create(PusherModule);
	await app.listen(3000);
}
bootstrap();
