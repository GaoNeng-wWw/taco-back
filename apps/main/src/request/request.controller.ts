import {
	Controller,
	Delete,
	Get,
	HttpStatus,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { Tid } from '@app/common';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import { AuthGuard } from '@app/jwt/jwt.guard';

@UseGuards(AuthGuard)
@Controller('request')
export class RequestController {
	constructor(private readonly requestService: RequestService) {}
	@Get('')
	async getRequests(@Query('page') page: number, @Tid() tid: string) {
		if (page < 0) {
			throw new ServiceError(
				serviceErrorEnum.INVALIDATE_PAGE,
				HttpStatus.BAD_REQUEST,
			);
		}
		return this.requestService.getAllRequest(tid, page);
	}
	@Put('accept')
	async acceptRequest(@Query('rid') rid: string, @Tid() tid: string) {
		return this.requestService.call(tid, rid, 'accept');
	}
	@Delete('refuse')
	async refuseRequest(@Query('rid') rid: string, @Tid() tid: string) {
		return this.requestService.call(tid, rid, 'refuse');
	}
}
