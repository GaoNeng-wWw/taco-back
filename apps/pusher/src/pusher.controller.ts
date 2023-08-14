import { Controller, Get } from '@nestjs/common';
import { PusherService } from './pusher.service';

@Controller()
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @Get()
  getHello(): string {
    return this.pusherService.getHello();
  }
}
