import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRegisterDTO } from '../dto/user.dto';
import { encrypt } from '@common/utils/dataProtection';
import {
  ApiResponse,
  Layer,
  Protocol,
  userAction,
  State,
} from '@common/utils/response';
import { userModel } from '@common/schema/user';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../../../server-common/constants';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { friendsModel } from '@common/schema/friends';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private userModel: Model<userModel>,
    @InjectModel('friends') private friendModel: Model<friendsModel>,
    @InjectRedis() private redis: Redis,
    private jwt: JwtService,
  ) {}
  certificate(body: { tid: string; password: string }) {
    return this.jwt.sign(body, jwtConstants);
  }
  verify(token: string) {
    return this.jwt.verify(token, jwtConstants);
  }
  getToken(dto: { tid: string; password: string }) {
    const { tid, password } = dto;
    const beforeCryptoPassword = encrypt(password);
    const res = new ApiResponse(Protocol.HTTP, Layer.USER, userAction.LOGIN);
    return this.userModel
      .find({
        tid,
        password: beforeCryptoPassword,
      })
      .exec()
      .then((userInfo) => {
        if (userInfo.length) {
          const token = this.certificate(dto);
          res.setData({ token });
          return res.getResponse();
        } else {
          res.fail(State.FAIL_BAD_REQUEST);
          throw new HttpException(res.getResponse(), 410);
        }
      });
  }
  async login(body: { tid: string; password: string }) {
    const tokenPayload = await this.getToken(body);
    this.redis.hmset(`token:white-list`, {
      [`${tokenPayload.data.token}`]: 1,
    });
    return tokenPayload;
  }
  async canRegister(phone: string) {
    return !(await this.userModel.findOne({ phone }).lean().exec());
  }
  @RabbitRPC({
    exchange: 'system.db',
    queue: 'db.user.register',
    routingKey: 'user.register',
    createQueueIfNotExists: true,
  })
  async register(body: UserRegisterDTO) {
    const { nick, password } = body;
    const beforeCryptoPassword = encrypt(password);
    const res = new ApiResponse(Protocol.HTTP, Layer.USER, userAction.REGISTER);
    if (!(await this.canRegister(body.phone))) {
      return false;
    }
    const currentTimeStamp = new Date().getTime();
    const cursor = await this.userModel
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .lean()
      .exec();
    const tid = BigInt(cursor?.[0]?.tid ?? 1000);
    const user = new this.userModel({
      nick,
      password: beforeCryptoPassword,
      birthday: body.birthday,
      description: '',
      friends: [],
      join_date: currentTimeStamp,
      tid: (tid + BigInt(1)).toString() ?? '1000',
      phone: body.phone,
      groups: [],
      request: {},
      notices: {},
    });
    const friend = new this.friendModel({
      tid: user.tid,
      friends: [],
    });
    const userInfo = await user.save();
    await friend.save();
    const profile = {
      nick: userInfo.nick,
      birthday: userInfo.birthday,
      friends: [],
      groups: [],
      tid: userInfo.tid,
      join_date: userInfo.join_date,
    };
    res.setData(profile);
    return res.getResponse();
  }
}
