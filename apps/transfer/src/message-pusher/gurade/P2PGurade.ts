import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { p2pMessageStructure } from '@common/interface/strcutre/p2p';
import {
  ApiResponse,
  chatKind,
  Layer,
  Protocol,
  State,
} from '@common/utils/response';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '@common/interface/strcutre/token';

@Injectable()
export class P2PAuthGurade implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwt?: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToWs();
    const handshake = context.getArgs()[0].handshake;
    const data: p2pMessageStructure = ctx.getData();
    const res = new ApiResponse(Protocol.WS, Layer.CHAT, chatKind.P2P);
    const token = handshake.query.token ?? handshake.auth.token;
    const { tid } = this.jwt.decode(token, { json: true }) as TokenPayload;
    const { reciver } = data;
    const hasFriend = await this.redis.sismember(`${tid}:friend-list`, reciver);
    if (hasFriend) {
      return true;
    } else {
      res.fail(State.FAIL_NOT_FRIEND);
      throw new WsException(res.getResponse());
    }
  }
}
