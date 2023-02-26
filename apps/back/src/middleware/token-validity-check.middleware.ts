import { jwtConstants } from '@common/constants';
import {
  ApiResponse,
  Layer,
  middlewareAction,
  Protocol,
  State,
  userAction,
} from '@common/utils/response';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Redis } from 'ioredis';

@Injectable()
export class TokenValidityCheckMiddleware implements NestMiddleware {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private jwt: JwtService,
  ) {}
  async use(req: Request, res: any, next: () => void) {
    const token = req.header('authorization').split(' ')[1];
    const isExists = await this.redis.hexists(`token:white-list`, token);
    const response = new ApiResponse(
      Protocol.HTTP,
      Layer.MIDDLEWARE,
      middlewareAction.TOKEN_WHITELIST_VALIDATE,
    );
    if (isExists) {
      next();
      return;
    }
    response.fail(State.FAIL_TOKEN_INVALIDATE);
    throw new HttpException(response.getResponse(), 403);
  }
}
