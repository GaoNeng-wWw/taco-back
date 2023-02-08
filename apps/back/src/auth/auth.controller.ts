import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginDTO, UserRegisterDTO } from '../dto/user.dto';
import { AuthService } from './auth.service';
import { ApiResponse as AResponse, userAction } from '../utils/response';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('/')
  @ApiResponse({
    type: AResponse<userAction>,
  })
  async Login(@Body() body: UserLoginDTO) {
    return await this.service.login(body);
  }
  @Put('/')
  async register(@Body() body: UserRegisterDTO) {
    return await this.service.register(body);
  }
}
