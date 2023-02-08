import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private readonly config: ConfigService) {}

	@Get('')
	async index(){
		console.log(this.config.get('PUBLIC'));
	}
  @Post('upload')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file) {
		console.log(file);
    const res = this.appService.uploadAvatar(file);
    return res;
  }
  @Get('upload/:type')
  async getAvatar(@Param() req) {
    //
  }
}
