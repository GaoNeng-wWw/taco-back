import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Layer,
  Protocol,
  State,
  userAction,
} from '../../../../../server-common/utils/response';
import { jwtConstants } from '@common/constants';
import { TokenPayload } from '@common/interface/strcutre/token';

@Injectable()
export class TokenAuthGurade implements CanActivate {
  constructor(private readonly jwt?: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handshake = context.getArgs()[0].handshake;
    const token = handshake.query.token ?? handshake.auth.token;
    const tid = handshake.auth.tid ?? handshake.query.tid;
    const res = new ApiResponse(Protocol.WS, Layer.USER, userAction.AUTH);
    if (!token) {
      res.fail(State.FAIL_BAD_REQUEST);
    }
    try {
      this.jwt.verify(token, jwtConstants);
      return true;
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
