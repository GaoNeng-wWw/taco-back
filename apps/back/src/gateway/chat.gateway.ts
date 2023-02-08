import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { p2pMessageStructure } from '../interface/strcutre/p2p';
import Redis from 'ioredis';
import {
  ApiResponse,
  chatKind,
  Layer,
  Protocol,
  State,
  userAction,
} from '../utils/response';
import { P2PAuthGurade } from './gurade/P2PGurade';
import { WsExceptionFilter } from '../ws-exception.filter';
import { TokenAuthGurade } from './gurade/TokenAuthGurade';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
@WebSocketGateway(3001, {
  cors: {
    allowedHeaders: '*',
  },
})
@UseGuards(TokenAuthGurade)
@UseFilters(WsExceptionFilter)
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  private socket_cache: Map<string, { instance: Socket; token: string }> =
    new Map();
  private service: ChatService;
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRedis('pub') private readonly pub: Redis,
    @InjectRedis('sub') private readonly sub: Redis,
    private jwt: JwtService,
  ) {
    this.service = new ChatService(this.redis, this.pub, this.sub, this.jwt);
    this.sub.subscribe(
      'group-channel',
      'p2p-channel',
      'system-channel',
      'urgent',
    );
    this.sub.on('message', (channel, res) => {
      console.log('emit');
      console.log(channel, res);
    });
  }
  // @UseGuards(P2PAuthGurade)
  @SubscribeMessage('p2p')
  async handleMessage(client: Socket, payload: p2pMessageStructure) {
    await this.service.p2p(client, payload);
    return;
  }
  @UseGuards(TokenAuthGurade)
  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.service.connect(client);
    // const {
    //   handshake: { auth },
    // } = client;
    // const res = new ApiResponse(Protocol.WS, Layer.USER, userAction.LOGIN);
    // const token = auth.token ?? client.handshake.query.token ?? '';
    // const tid = auth.tid ?? client.handshake.query.tid ?? '';
    // if (!token || !tid) {
    //   const state = !token ? State.FAIL_BAD_REQUEST : State.FAIL_BAD_REQUEST;
    //   res.fail(state);
    //   client.emit('system', res.getResponse());
    //   client.disconnect(true);
    // }
    // const tokenVerifyInfo = await this.jwt.verifyAsync(token);
    // if (tokenVerifyInfo.tid !== Number(tid)) {
    //   res.fail(State.FAIL);
    //   client.emit('system', res.getResponse());
    //   client.disconnect(true);
    // }
    // this.socket_cache.set(tid, { instance: client, token });
    // const nearHistory = await this.redis.lrange(
    //   `history:${tid}`,
    //   0,
    //   await this.redis.llen(`history:${tid}`),
    // );
    // this.redis.set(`token:${token}`, tid);
    // this.redis.set(`tid:${tid}`, token);
    // res.setData({ nearHistory });
    // res.getResponse();
    // for (let i = 0; i < nearHistory.length; i++) {
    //   client.emit('p2p', nearHistory[i]);
    // }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const { handshake } = client;
    const tid = handshake.auth.tid ?? handshake.query.tid;
    const token = handshake.auth.token ?? handshake.query.token;
    this.socket_cache.delete(tid);
    this.redis.del(`token:${token}`);
    this.redis.del(`tid:${tid}`);
    client.disconnect(true);
  }
}
