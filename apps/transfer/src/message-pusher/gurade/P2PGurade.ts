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

@Injectable()
export class P2PAuthGurade implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToWs();
    const data: p2pMessageStructure = ctx.getData();
    const res = new ApiResponse(Protocol.WS, Layer.CHAT, chatKind.P2P);
    const { sender, reciver } = data;
    const hasFriend = await this.redis.sismember(String(sender), reciver);
    if (hasFriend) {
      return true;
    }
    res.fail(State.FAIL_NOT_FRIEND);
    throw new WsException(res.getResponse());
  }
}
