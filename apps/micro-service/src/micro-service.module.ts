import { Module } from '@nestjs/common';
import { MicroServiceController } from './micro-service.controller';
import { MicroServiceService } from './micro-service.service';

@Module({
  imports: [],
  controllers: [MicroServiceController],
  providers: [MicroServiceService],
})
export class MicroServiceModule {}
