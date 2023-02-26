import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Post, Put } from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from '../dto/user.dto';
import { AuthService } from './auth.service';
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly amqpConnection: AmqpConnection,
  ) {}
  @Post('/')
  async Login(@Body() body: UserLoginDTO) {
    return await this.service.login(body);
  }
  @Put('/')
  async register(@Body() body: UserRegisterDTO) {
    const profile = await this.amqpConnection.request({
      exchange: 'system.db',
      routingKey: 'user.register',
      payload: body,
    });
    return profile;
  }
}
