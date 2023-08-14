import { Injectable } from '@nestjs/common';

@Injectable()
export class PusherService {
  getHello(): string {
    return 'Hello World!';
  }
}
