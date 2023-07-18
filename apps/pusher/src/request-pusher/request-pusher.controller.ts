import { Controller } from '@nestjs/common';
import { RequestPusherService } from './request-pusher.service';

@Controller('request-pusher')
export class RequestPusherController {
	constructor(private readonly requestPusherService: RequestPusherService) {}
}
