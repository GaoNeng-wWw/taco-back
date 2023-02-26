import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtConstants } from '@common/constants';
import { JwtService } from '@nestjs/jwt';
import { tokenPayload } from '@common/interface/strcutre/token';
import { AddFriendDto } from '../friends/dto/add-friend';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { friendsModel } from '@common/schema/friends';
import {
  ApiResponse,
  friendAction,
  Layer,
  Protocol,
  State,
} from '@common/utils/response';

@Injectable()
export class IsFriend implements CanActivate {
  constructor(
    @InjectModel('user') private readonly friendsModel: Model<friendsModel>,
    private readonly jwt: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.getArgByIndex(0);
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = req.headers.authorization.split(' ')[1];
    const vertifyInfo: tokenPayload = this.jwt.verify(token, jwtConstants);
    const payload: AddFriendDto = body;
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.REFUSE_REQ,
    );
    const profile =
      (
        await this.friendsModel.find(
          {
            tid: vertifyInfo.tid,
          },
          {
            tid: 1,
            friends: 1,
          },
        )
      )[0].friends ?? [];
    if (profile.includes?.(payload.tid)) {
      res.fail(State.FAIL_NOT_FRIEND);
      throw new HttpException(res.getResponse(), 422);
    }
    return true;
  }
}
