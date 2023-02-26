import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { groupMessageStructure } from '@common/interface/strcutre/group';
import { p2pMessageStructure } from '@common/interface/strcutre/p2p';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class beforeSendGurade implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwt?: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const [socket, message]: [
      Socket,
      p2pMessageStructure | groupMessageStructure,
    ] = context.getArgs();
    const token = socket.handshake.query.token ?? socket.handshake.auth.token;
    const sender = message.sender;
    try {
      const tokenTid = this.jwt.decode(token) as {
        tid: number;
        password: string;
      };
      if (tokenTid.tid !== sender) {
        return false;
      }
    } catch {}
    return true;
  }
}
