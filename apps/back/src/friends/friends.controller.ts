import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { tokenPayload } from '../interface/strcutre/token';
import { FriendsService } from './friends.service';

@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly service: FriendsService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getFirends(@Request() req) {
    return await this.service.friendList(req.user as tokenPayload);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('/accept')
  async accept(@Request() req, @Body() body: { tid: number }) {
    console.log(req, body);
  }
}
