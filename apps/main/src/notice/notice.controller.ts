import { Controller, Get, Query } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { Tid } from '@app/common';

@Controller('notices')
export class NoticeController {
	constructor(private readonly noticeService: NoticeService) {}
	@Get()
	async getNotice(@Tid() tid: string, @Query('page') page: number) {
		return this.noticeService.getNotice(tid, page);
	}
}
