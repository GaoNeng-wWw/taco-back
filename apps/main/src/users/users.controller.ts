import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangeUserProfileDto } from '@app/interface';
import { AuthGuard } from '@app/jwt/jwt.guard';
import { Token } from '@app/common/token.decorator';
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}
	@Get('profile')
	async getProfile(@Query('tid') tid: string) {
		return this.usersService.profile(tid);
	}
	@Patch('profile')
	async patchProfile(
		@Body() dto: ChangeUserProfileDto,
		@Token() token: string,
	) {
		return this.usersService.updateProfile(token, dto);
	}
}
