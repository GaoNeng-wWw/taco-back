import { Controller, Body, Get, Put, Post, Query, Patch } from '@nestjs/common';
import { AccountService } from './account.service';
import { LoginDTO, RegisterDTO } from '../dto/account.dto';
import {
	ChangePasswordDto,
	CheckAnswerDto,
	ForgetPasswordDto,
	GetQuestionDto,
} from '@app/interface';

@Controller('account')
export class AccountController {
	constructor(private readonly accountService: AccountService) {}
	@Get('login')
	async login(@Body() dto: LoginDTO) {
		return await this.accountService.login(dto);
	}
	@Post('register')
	resgiter(@Body() dto: RegisterDTO) {
		return this.accountService.registe(dto);
	}
	@Get('question')
	async getQuestion(@Body() dto: GetQuestionDto) {
		return this.accountService.getQuestion(dto.tid);
	}
	@Get('check/answer')
	async checkAnswer(
		@Query('tid') tid: number,
		@Query('question_id') question_id,
		@Body() dto: CheckAnswerDto,
	) {
		return this.accountService.checkAnswer(tid, question_id, dto);
	}
	@Patch('password')
	async changePassword(@Body() dto: ChangePasswordDto) {
		return this.accountService.changePassWord(dto);
	}
	@Patch('forget')
	async forgetPassword(@Body() dto: ForgetPasswordDto) {
		return this.accountService.forgetPassword(dto);
	}
}
