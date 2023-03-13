import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtConstants } from '@common/constants';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '@common/interface/strcutre/token';
import { AddFriendDto } from '../friends/dto/add-friend';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { Friends, friendsModel } from '@common/schema/friends';
import {
  ApiResponse,
  friendAction,
  Layer,
  Protocol,
  State,
} from '@common/utils/response';

@Injectable()
export class IsNotFriend implements CanActivate {
  constructor(
    @InjectModel('friends') private readonly friendsModel: Model<friendsModel>,
    private readonly jwt: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.getArgByIndex(0);
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = req.headers.authorization.split(' ')[1];
    const vertifyInfo: TokenPayload = this.jwt.verify(token, jwtConstants);
    const payload: AddFriendDto = body;
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ADD_FRIEND,
    );
    let friendPayload: Friends &
      Document<any, any, any> & { _id: Types.ObjectId };
    try {
      friendPayload = await this.friendsModel.findOne(
        {
          tid: vertifyInfo.tid,
        },
        {
          friends: 1,
        },
      );
    } catch (e) {
      res.fail(State.FAIL_SERVER_ERROR);
      throw new HttpException(res.getResponse(), 500);
    }
    if ((friendPayload.friends ?? []).includes(payload.tid)) {
      res.fail(State.FAIL_IS_FRIEND);
      throw new HttpException(res.getResponse(), 422);
    }
    return true;
  }
}
