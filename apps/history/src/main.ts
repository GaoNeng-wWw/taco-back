import { NestFactory } from '@nestjs/core';
import { HistoryModule } from './history.module';

async function bootstrap() {
	const app = await NestFactory.create(HistoryModule);
	await app.listen(3000);
}
bootstrap();
