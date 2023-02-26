import { jwtConstants } from '@common/constants';
import { tokenPayload } from '@common/interface/strcutre/token';
import { userModel } from '@common/schema/user';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { AddFriendDto } from '../friends/dto/add-friend';

@Injectable()
export class InBlackList implements CanActivate {
  constructor(
    @InjectModel('user') private readonly userModel: Model<userModel>,
    private readonly jwt?: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { body } = context.getArgByIndex(0);
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = req.headers.authorization.split(' ')?.[1];
    const vertifyInfo: tokenPayload = this.jwt.verify(token, jwtConstants);
    const payload: AddFriendDto = body;
    return new Promise((resolve) => {
      this.userModel
        .find({
          tid: vertifyInfo.tid,
          black_list: {
            $in: [payload.tid],
          },
        })
        .then((value) => {
          resolve(!value.length);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }
}
