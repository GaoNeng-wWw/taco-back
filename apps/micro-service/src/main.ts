import { NestFactory } from '@nestjs/core';
import { MicroServiceModule } from './micro-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MicroServiceModule);
  await app.listen(3002);
  console.log('micro service load success');
}
bootstrap();
