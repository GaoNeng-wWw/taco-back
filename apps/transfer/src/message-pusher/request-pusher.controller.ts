import { RequestPayload } from '@common/interface/request.interface';
import { Request } from '@common/utils/request';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePusherService } from './message-pusher.service';

@Controller()
export class RequestPusherController {
  constructor(private readonly service: MessagePusherService) {}
  @MessagePattern('pusher.request.write')
  async writeRequest(request: RequestPayload<any>) {
    await this.service.requestPush(request);
    return true;
  }
}
