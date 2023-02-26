import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tokenPayload } from '@common/interface/strcutre/token';
import {
  ApiResponse,
  friendAction,
  Layer,
  noticeAction,
  Protocol,
  State,
} from '@common/utils/response';
import { userModel } from '@common/schema/user';
import Redis from 'ioredis';
import { Notice } from '@common/utils/notice';
import { JwtService } from '@nestjs/jwt';
import { friendsModel } from '@common/schema/friends';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from '@common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { AddFriendDto } from './dto/add-friend';
import { RemoveFriend } from './dto/remove-friend';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { encrypt } from '@common/utils/dataProtection';
import { lastValueFrom } from 'rxjs';
import { isEmpty } from 'lodash';
import { INoticePayload } from '@common/interface/notice.interface';
import { Request } from '@common/utils/request';
import { RequestPayload } from '@common/interface/request.interface';
@Injectable()
export class FriendsService {
  constructor(
    @InjectModel('user') private userModel: Model<userModel>,
    @InjectModel('friends') private friendsModel: Model<friendsModel>,
    @InjectRedis() private readonly redis: Redis,
    @InjectRedis('pub') private readonly pub: Redis,
    private readonly channel: AmqpConnection,
    @Inject('Pusher') private readonly client: ClientProxy,
    private readonly config: ConfigService,
    private jwt: JwtService,
  ) {}
  private async getNoticeByNoticeId(
    nid: string,
    token: string,
  ): Promise<INoticePayload<any, any>> {
    const tokenPayload: tokenPayload = this.jwt.verify(token, jwtConstants);
    const { tid } = tokenPayload;
    const notice = await this.redis.hget(`notice:${tid}`, nid);
    return JSON.parse(notice);
  }
  private async getRequestByRid(
    rid: string,
    token: string,
  ): Promise<RequestPayload<any>> {
    const tokenPayload: tokenPayload = this.jwt.verify(token, jwtConstants);
    const { tid } = tokenPayload;
    let request: RequestPayload<any> = JSON.parse(
      await this.redis.hget(`request:${tid}`, rid),
    );
    if (isEmpty(request)) {
      request = (
        await this.userModel.findOne(
          {
            tid,
          },
          {
            [`request.${rid}`]: 1,
            _id: 0,
          },
        )
      )['request'][rid];
    }
    return request;
  }
  async friendList(token: string, hash: string) {
    const tokenPayload: tokenPayload = this.jwt.verify(token, jwtConstants);
    const { tid } = tokenPayload;
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.GET_FRIENDS,
    );
    const friendListCacheHash = await this.redis.get(
      `friends:list:hash:${tid}`,
    );
    if (friendListCacheHash === hash) {
      const cache = Object.entries(
        await this.redis.hgetall(`friends:list:${tid}`),
      ).map(([key, value]) => {
        return JSON.parse(value);
      });
      res.setData({ result: cache, hash });
      return res.getResponse();
    } else {
      return this.friendsModel
        .aggregate([
          {
            $lookup: {
              from: 'user',
              localField: 'friends',
              foreignField: 'tid',
              as: 'result',
            },
          },
          {
            $project: {
              _id: 0,
              'result.tid': 1,
              'result.nick': 1,
              'result.description': 1,
              'result.birthday': 1,
            },
          },
        ])
        .exec()
        .then((value) => {
          const {
            result,
          }: {
            result: {
              tid: number;
              nick: string;
              description: string;
              avatar: string;
              birthday: number;
            }[];
          } = value[0];
          const hash = encrypt(JSON.stringify(result));
          res.setData(
            {
              result: value[0].result,
              hash,
            } ?? {},
          );
          this.redis.set(`friends:list:hash:${tid}`, hash);
          result.forEach((res) => {
            this.redis.hset(
              `friends:list:${tid}`,
              res.tid,
              JSON.stringify(res),
            );
          });
          return res.getResponse();
        })
        .catch(() => {
          res.fail(State.FAIL_BAD_REQUEST);
          return res.getResponse();
        });
    }
  }
  async addFriendReqeust(dto: AddFriendDto, token: string) {
    const tokenPayload: tokenPayload = this.jwt.verify(token, jwtConstants);
    const { tid, message } = dto;
    const request = new Request()
      .setScope('friend')
      .setAction('add')
      .setSender(tokenPayload.tid)
      .setReciver(tid)
      .setMessage(message)
      .getPayload();
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ADD_FRIEND,
    );
    const { rid } = request;
    if (await this.redis.hget(`request:${tid}`, rid)) {
      res.fail(State.FAIL_HAS_REQUEST);
      throw new HttpException(res.getResponse(), 422);
    }
    const pushRequestSuccess = await lastValueFrom(
      this.client.send<boolean, RequestPayload<any>>(
        'pusher.request.write',
        request,
      ),
    );
    if (!pushRequestSuccess) {
      res.fail(State.FAIL);
      return res.getResponse();
    }
    res.setData({ rid: request.rid });
    return res.getResponse();
  }
  async deleteFriendRequest(dto: RemoveFriend, token: string) {
    const tokenPayload: tokenPayload = this.jwt.verify(token, jwtConstants);
    const { tid } = tokenPayload;
    const requests = new Request<'remove'>()
      .setScope('friend')
      .setAction('remove')
      .setSender(tokenPayload.tid)
      .setReciver(dto.tid)
      .getPayload();
    const removeSuccess = await this.channel.request<boolean>({
      exchange: 'system.db',
      routingKey: 'friends.remove',
      payload: requests,
    });
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ACCEPT_REQ,
    );
    if (!removeSuccess) {
      res.fail(State.FAIL_BAD_REQUEST);
      return res.getResponse();
    }
    if (dto.toBlackList) {
      const blackListNotice = new Notice<'friend', 'toBlackList'>()
        .setScope('friend')
        .setAction('toBlackList')
        .setSource(tid)
        .setTarget(dto.tid)
        .setReason(dto.message)
        .getPayload();
      const moveToBlackListSuccess = await this.channel.request<boolean>({
        exchange: 'system.db',
        routingKey: 'friend.black-list',
        payload: blackListNotice,
      });
      if (!moveToBlackListSuccess) {
        res.fail(State.FAIL_BAD_REQUEST);
        return res.getResponse();
      }
    }
    return res.getResponse();
  }
  async accept(rid: string, token: string) {
    const { tid } = this.jwt.verify(token, jwtConstants);
    const request = await this.getRequestByRid(rid, token);
    const acceptNotice = new Notice<'friend', 'accept'>()
      .setScope('friend')
      .setAction('accept')
      .setSource(request.sender)
      .setTarget(request.reciver)
      .getPayload();
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ACCEPT_REQ,
    );
    if (isEmpty(request)) {
      res.fail(State.FAIL_BAD_REQUEST);
      return res.getResponse();
    }
    try {
      const removeRequestSuccess = await this.channel.request<boolean>({
        exchange: 'system.db',
        routingKey: 'request.remove',
        payload: {
          type: 'request',
          id: rid,
          tid,
        },
      });
      if (!removeRequestSuccess) {
        res.fail(State.FAIL_BAD_REQUEST);
        return res.getResponse();
      }
    } catch (e) {
      res.fail(State.FAIL_BAD_REQUEST);
      return res.getResponse();
    }
    const isAck = await this.channel.request<boolean>({
      exchange: 'system.db',
      routingKey: 'friends.add',
      payload: request,
    });
    if (!isAck) {
      res.fail(State.FAIL_SERVER_ERROR);
      return res.getResponse();
    }
    this.client.send('pusher.notice.push', acceptNotice);
    return res.getResponse();
  }
  async refuse(rid: string, token: string) {
    const request = await this.getRequestByRid(rid, token);
    const notice = new Notice<'friend', 'refuse'>()
      .setScope('friend')
      .setAction('refuse')
      .setLevel('dot')
      .setSource(request.sender)
      .setTarget(request.reciver);
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ACCEPT_REQ,
    );
    this.client.send('pusher.notice.push', notice);
    this.channel.request({
      exchange: 'system.db',
      routingKey: 'request.remove',
      payload: {
        type: 'request',
        id: rid,
        tid: request.reciver,
      },
    });
    return res.getResponse();
  }
  async getFriendRequest(token: string) {
    const verifyInfo: tokenPayload = this.jwt.verify(token, jwtConstants);
    const { tid } = verifyInfo;
    let notices = await this.redis.hgetall(`request:${tid}`);
    if (isEmpty(notices)) {
      notices =
        (await this.userModel.find(
          {
            tid,
          },
          {
            _id: 0,
            request: 1,
          },
        )[0]?.request) ?? {};
    }
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.NOTICE,
      noticeAction.GET_NOTICE,
    );
    res.setData(Object.values(notices).map((v) => JSON.parse(v)));
    return res.getResponse();
  }
}
