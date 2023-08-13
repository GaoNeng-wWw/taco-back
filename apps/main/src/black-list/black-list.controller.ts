import { Controller, Delete, Get, Put, Query, UseGuards } from '@nestjs/common';
import { BlackListService } from './black-list.service';
import { AuthGuard } from '@app/jwt/jwt.guard';
import { Tid } from '@app/common';

@UseGuards(AuthGuard)
@Controller('black-list')
export class BlackListController {
	constructor(private readonly blackListService: BlackListService) {}
	// @Get('')
	// async getBlockList() {
	// 	return this.blackListService.getBlockList();
	// }
	// @Put('')
	// async block(@Query('tid') target: string, @Tid() tid: string) {}
	// @Delete('')
	// async unBlock(@Query('tid') target: string, @Tid() tid: string) {}
}
