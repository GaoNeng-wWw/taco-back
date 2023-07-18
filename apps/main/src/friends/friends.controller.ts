import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Put,
	Query,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Tid } from '@app/common';
import { ChangeFriendTag } from '@app/interface';
import { AddFriendDto } from '@app/interface/models/request/AddFriendDto';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}
	@Get('')
	async getFriend(@Query('tid') tid: string, @Query('page') page: number) {
		return this.friendsService.get(tid, page);
	}
	@Patch('tag')
	async updateTag(@Tid() source: string, @Body() body: ChangeFriendTag) {
		return this.friendsService.updateTag(source, body);
	}
	@Put('')
	async addFriend(@Tid() source: string, @Body() body: AddFriendDto) {
		return this.friendsService.add(source, body);
	}
	@Delete('')
	async deleteFriend(@Tid() source: string, @Query('tid') target: string) {
		return this.friendsService.remove(source, target);
	}
	@Put('block')
	async block(@Tid() source: string, @Query('tid') target: string) {
		return this.friendsService.block(source, target);
	}
	@Delete('block')
	async unblock(@Tid() source: string, @Query('tid') target: string) {
		return this.friendsService.unblock(source, target);
	}
}
