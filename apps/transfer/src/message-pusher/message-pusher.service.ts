import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { userModel } from '@common/schema/user';
import { Socket } from 'socket.io';
import { Notice } from '@common/utils/notice';
import {
  ApiResponse,
  chatKind,
  Layer,
  Protocol,
  State,
  userAction,
} from 'server-common/utils/response';
import GroupMessageDTO from './dto/group.dto';
import { p2pMessageDTO } from './dto/p2p.dto';
import { jwtConstants } from '@common/constants';
import { ConfigService } from '@nestjs/config';
import { INoticePayload } from '@common/interface/notice.interface';
import { RequestPayload } from '@common/interface/request.interface';
import { TokenPayload } from '@common/interface/strcutre/token';

@Injectable()
export class MessagePusherService {
  private p2pSocketInstanceRecord: Map<
    string,
    { instance: Socket; token: string }
  > = new Map();
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRedis('pub') private readonly pub: Redis,
    @InjectRedis('sub') private readonly sub: Redis,
    @InjectModel('user') private userModel: Model<userModel>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async group(client: Socket, payload: GroupMessageDTO) {
    const res = new ApiResponse(Protocol.WS, Layer.CHAT, chatKind.GROUP);
    const token = client.handshake.query.token ?? client.handshake.auth.token;
    const decode = this.jwt.decode(token, { json: true }) as TokenPayload;
    const sender = decode.tid;
    payload['sender'] = sender;
    client.broadcast.to(payload.gid).emit('group', payload);
    payload.timestamp = new Date().getTime().toString();
    const { gid } = payload;
    const historyNumber = await this.redis.scard(`history:group:${gid}`);
    if (historyNumber < 1000) {
      await this.redis.rpush(`history:group:${gid}`, JSON.stringify(payload));
      res.updateMessage('SEND_SUCCESS');
    } else {
      const historyItem = await this.redis.lpop(`history:group:${gid}`);
    }
  }
  async p2p(client: Socket, payload: p2pMessageDTO) {
    const { reciver } = payload;
    const reciverIsOnline = await this.redis.get(`tid:${reciver}`);
    const res = new ApiResponse(Protocol.WS, Layer.CHAT, chatKind.P2P);
    if (!reciverIsOnline) {
      await this.redis.rpush(`history:${reciver}`, JSON.stringify(payload));
      res.updateMessage('SEND_SUCCESS');
      client.emit('p2p', res.getResponse());
      return;
    }
    const reciverInstance = this.p2pSocketInstanceRecord.get(
      reciver.toString(),
    )?.instance;
    if (reciverInstance) {
      reciverInstance.emit('p2p', payload);
      res.updateMessage('SEND_SUCCESS');
      client.emit('p2p', res.getResponse());
      return;
    } else {
      this.pub.emit('p2p-channel', payload);
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
    const tokenVerifyInfo = await this.jwt.verifyAsync(token, jwtConstants);
    if (tokenVerifyInfo.tid !== Number(tid)) {
      res.fail(State.FAIL);
      client.emit('system', res.getResponse());
      client.disconnect(true);
    }
    let groups = await this.redis.smembers(`group-record:${tid}`);
    if (!groups.length) {
      const [{ groups: dbGroup }] = await this.userModel
        .find({ tid }, 'groups -_id')
        .lean()
        .exec();
      groups = dbGroup;
      groups.forEach((group) => {
        this.redis.sadd(`group-record:${tid}`, group);
        client.join(group);
      });
    }
    this.p2pSocketInstanceRecord.set(tid, { instance: client, token });
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
  async disconnect(client: Socket) {
    const { handshake } = client;
    const tid = handshake.auth.tid ?? handshake.query.tid;
    const token = handshake.auth.token ?? handshake.query.token;
    this.p2pSocketInstanceRecord.delete(tid);

    this.redis.del(`token:${token}`);
    this.redis.del(`tid:${tid}`);
    let groups = await this.redis.smembers(`group-record:${tid}`);
    if (!groups.length) {
      const [{ groups: dbGroup }] = await this.userModel
        .find({ tid }, 'groups -_id')
        .lean()
        .exec();
      groups = dbGroup;
      groups.forEach((group) => {
        this.redis.sadd(`group-record:${tid}`, group);
        client.leave(group);
      });
    }
    client.disconnect(true);
  }
  async noticePush(payload: INoticePayload<any, any>) {
    const { target, nid } = payload;
    if (this.p2pSocketInstanceRecord.has(target)) {
      this.p2pSocketInstanceRecord.get(target).instance.emit('notice', payload);
      return true;
    } else {
      try {
        await this.userModel.updateOne(
          {
            tid: target,
          },
          {
            $set: {
              [`notices.${nid}`]: payload,
            },
          },
        );
        await this.redis.hset(`notices:${target}`, {
          [nid]: JSON.stringify(payload),
        });
        await this.redis.expire(
          `notices:${target}`,
          this.config.get('redis.expired'),
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
  async requestPush(payload: RequestPayload<any>) {
    const { reciver, rid } = payload;
    if (this.p2pSocketInstanceRecord.has(reciver)) {
      this.p2pSocketInstanceRecord
        .get(reciver)
        .instance.emit('request', payload);
    } else {
      let isAck = true;
      try {
        await this.userModel.updateOne(
          {
            tid: reciver,
          },
          {
            $set: {
              [`request.${rid}`]: payload,
            },
          },
        );
        await this.redis.hset(`request:${reciver}`, {
          [rid]: JSON.stringify(payload),
        });
        await this.redis.expire(
          `requests:${reciver}`,
          this.config.get('redis.expired'),
        );
      } catch (e) {
        isAck = false;
      }
      return isAck;
    }
  }
}
