import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MicroServiceModule } from './micro-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MicroServiceModule,
    {
      transport: Transport.TCP,
    },
  );
  app.listen();
}
bootstrap();
