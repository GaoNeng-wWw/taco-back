import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve,join } from 'path';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useStaticAssets('public',{
		prefix:'/static/'
	});
	app.enableCors()
  await app.listen(3002);
}
bootstrap();
