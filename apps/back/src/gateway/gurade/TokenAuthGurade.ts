import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import {
  ApiResponse,
  Layer,
  Protocol,
  State,
  userAction,
} from '../../utils/response';

@Injectable()
export class TokenAuthGurade implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwt?: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToWs();
    const client = ctx.getClient() as Socket;
    const handshake = context.getArgs()[0].handshake;
    const token =
      handshake.headers?.authorization?.split?.('') ??
      handshake.query.token ??
      handshake.auth.token;
    const tid = handshake.auth.tid ?? handshake.query.tid;
    const res = new ApiResponse(Protocol.WS, Layer.USER, userAction.AUTH);
    if (!token) {
      res.fail(State.FAIL_BAD_REQUEST);
    }
    try {
      const verifyInfo = this.jwt.verify(token);
      if (verifyInfo.tid === Number(tid)) {
        client.emit('system', res.getResponse());
        return true;
      }
      throw new Error('Token Error');
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        res.fail(State.FAIL_TOKEN_EXPIRED);
      }
      if (e.name === 'JsonWebTokenError') {
        res.fail(State.FAIL_BAD_REQUEST);
      }
      if (e.message === 'Token Error') {
        res.fail(State.FAIL_BAD_REQUEST);
      }
      throw new WsException(res.getResponse());
    }
  }
}
