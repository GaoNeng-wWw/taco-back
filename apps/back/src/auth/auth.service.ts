import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRegisterDTO } from '../dto/user.dto';
import { encrypt } from '../utils/dataProtection';
import { isEmpty } from 'lodash';
import {
  ApiResponse,
  Layer,
  Protocol,
  userAction,
  State,
} from '../utils/response';
import { UserSchema, userModel } from '../schema/user';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private userModel: Model<userModel>,
    private jwt: JwtService,
  ) {}
  certificate(body: { tid: number; password: string }) {
    return this.jwt.sign(body, jwtConstants);
  }
  getToken(dto: { tid: number; password: string }) {
    const { tid, password } = dto;
    const beforeCryptoPassword = encrypt(password);
    const res = new ApiResponse(Protocol.HTTP, Layer.USER, userAction.LOGIN);
    return this.userModel
      .find({
        tid,
        password: beforeCryptoPassword,
      })
      .exec()
      .then(() => {
        const token = this.certificate(dto);
        res.setData({ token });
        return res.getResponse();
      })
      .catch((reason) => {
        console.log(reason);
        res.fail(State.FAIL_BAD_REQUEST);
        return res.getResponse();
      });
  }
  async login(body: { tid: number; password: string }) {
    return await this.getToken(body);
  }
  async register(body: UserRegisterDTO) {
    const { nick, password, phone } = body;
    const beforeCryptoPassword = encrypt(password);
    const res = new ApiResponse(Protocol.HTTP, Layer.USER, userAction.REGISTER);
    const currentTimeStamp = new Date().getTime();
    const hasSamePhone = !isEmpty(
      await this.userModel.findOne({ phone }).lean().exec(),
    );
    if (hasSamePhone) {
      res.fail(State.FAIL_BAD_REQUEST);
      return res.getResponse();
    }
    const cursor = await this.userModel
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .lean()
      .exec();
    const tid = cursor?.[0]?.tid ?? 1000;
    const user = new this.userModel({
      nick,
      password: beforeCryptoPassword,
      birthday: body.birthday,
      description: '',
      friends: [],
      join_date: currentTimeStamp,
      tid: tid + 1 ?? '1000',
      phone: body.phone,
    });
    return user
      .save()
      .then((val) => {
        val['_id'] = undefined;
        val['__v'] = undefined;
        res.setData(val);
        return res.getResponse();
      })
      .catch(() => {
        res.fail(State.FAIL_BAD_REQUEST);
        return res.getResponse();
      });
  }
}
