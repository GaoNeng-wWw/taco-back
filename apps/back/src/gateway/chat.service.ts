import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { Socket } from 'socket.io';
import { p2pMessageStructure } from '../interface/strcutre/p2p';
import {
  ApiResponse,
  chatKind,
  Layer,
  Protocol,
  State,
  userAction,
} from '../utils/response';

@Injectable()
export class ChatService {
  private socket_cache: Map<string, { instance: Socket; token: string }> =
    new Map();
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRedis('pub') private readonly pub: Redis,
    @InjectRedis('sub') private readonly sub: Redis,
    private jwt: JwtService,
  ) {}
  async p2p(client: Socket, payload: p2pMessageStructure) {
    const { sender, reciver } = payload;
    const token = client.handshake.auth.token ?? client.handshake.query.token;
    const cacheTid = Number(await this.redis.get(`token:${token}`));
    const res = new ApiResponse(Protocol.WS, Layer.CHAT, chatKind.P2P);
    const reciverToken = await this.redis.get(`tid:${reciver}`);
    if (cacheTid !== sender) {
      res.fail(State.FAIL_BAD_REQUEST);
      res.updateMessage('TOKEN_INVALID');
      throw new WsException(res.getResponse());
    }
    res.setData(payload);
    const socket = this.socket_cache.get(String(reciver));
    if (socket?.instance) {
      socket.instance.emit('p2p', res.getResponse());
    } else {
      this.redis.rpush(`history:${reciver}`, JSON.stringify(payload));
    }
    if (cacheTid === sender) {
      client.emit('p2p', res.getResponse());
    } else {
      this.pub.publish('p2p-channel', JSON.stringify(payload));
    }
  }
  async connect(client: Socket) {
    const {
      handshake: { auth },
    } = client;
    const res = new ApiResponse(Protocol.WS, Layer.USER, userAction.LOGIN);
    const token = auth.token ?? client.handshake.query.token ?? '';
    const tid = auth.tid ?? client.handshake.query.tid ?? '';
    if (!token || !tid) {
      const state = !token ? State.FAIL_BAD_REQUEST : State.FAIL_BAD_REQUEST;
      res.fail(state);
      client.emit('system', res.getResponse());
      client.disconnect(true);
    }
    const tokenVerifyInfo = await this.jwt.verifyAsync(token);
    if (tokenVerifyInfo.tid !== Number(tid)) {
      res.fail(State.FAIL);
      client.emit('system', res.getResponse());
      client.disconnect(true);
    }
    this.socket_cache.set(tid, { instance: client, token });
    const nearHistory = await this.redis.lrange(
      `history:${tid}`,
      0,
      await this.redis.llen(`history:${tid}`),
    );
    this.redis.set(`token:${token}`, tid);
    this.redis.set(`tid:${tid}`, token);
    res.setData({ nearHistory });
    res.getResponse();
    for (let i = 0; i < nearHistory.length; i++) {
      client.emit('p2p', nearHistory[i]);
    }
  }
}
