import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpResponseInterceptor } from '@app/common/http-response.interceptor';
import { HttpExceptionFilter } from '@app/common/http-exception.filter';
import 'reflect-metadata';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// app.useGlobalPipes(new ValidationPipe());
	// app.useGlobalInterceptors(new HttpResponseInterceptor());
	// app.useGlobalFilters(new HttpExceptionFilter());
	await app.listen(3000);
}
bootstrap();
