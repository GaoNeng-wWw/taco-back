import { INoticePayload } from '@common/interface/notice.interface';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePusherService } from './message-pusher.service';

@Controller()
export class NoticePushController {
  constructor(private readonly service: MessagePusherService) {}
  @MessagePattern('pusher.notice.push')
  async writeNotice(notice: INoticePayload<any, any>) {
    return await this.service.noticePush(notice);
  }
}
