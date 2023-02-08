import { Controller, Get } from '@nestjs/common';
import { MicroServiceService } from './micro-service.service';

@Controller()
export class MicroServiceController {
  constructor(private readonly microServiceService: MicroServiceService) {}

  @Get()
  getHello(): string {
    return this.microServiceService.getHello();
  }
}
