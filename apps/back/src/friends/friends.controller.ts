import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { Token } from '@common/decorators/token';
import { AddFriendDto } from './dto/add-friend';
import { IsFriend } from '../guard/is-friend.guard';
import { CommonRequestActionDto } from './dto/common-request-action.dto';
import { HasRequest } from '../guard/has-request.guard';
import { HasUser } from '../guard/has-user.guard';
import { IsNotFriend } from '../guard/is-not-friend.guard';
import { RemoveFriend } from './dto/remove-friend';
@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly service: FriendsService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getFirends(@Token() token: string, @Query('hash') hash: string) {
    return await this.service.friendList(token, hash);
  }
  @UseGuards(AuthGuard('jwt'), HasUser, IsNotFriend)
  @Put('/')
  async addFriend(@Body() body: AddFriendDto, @Token() token: string) {
    return await this.service.addFriendReqeust(body, token);
  }
  @UseGuards(AuthGuard('jwt'), IsFriend)
  @Delete('/')
  async removeFriend(@Body() body: RemoveFriend, @Token() token: string) {
    return this.service.deleteFriendRequest(body, token);
  }
  @UseGuards(AuthGuard('jwt'), HasRequest)
  @Post('/accept')
  async acceptAddRequest(
    @Body() body: CommonRequestActionDto,
    @Token() token: string,
  ) {
    return await this.service.accept(body.rid, token);
  }
  @UseGuards(AuthGuard('jwt'), HasRequest, IsFriend)
  @Post('/refuse')
  async refuseRequest(
    @Body() body: CommonRequestActionDto,
    @Token() token: string,
  ) {
    return await this.service.refuse(body.rid, token);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('/request')
  async getFriendRequest(@Token() token: string) {
    return await this.service.getFriendRequest(token);
  }
}
