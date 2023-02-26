import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TransferModule } from './transfer.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TransferModule,
    {
      transport: Transport.TCP,
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  app.listen();
}
bootstrap();
