import { Injectable } from '@nestjs/common';

@Injectable()
export class MicroServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
