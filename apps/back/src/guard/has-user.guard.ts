import { userModel } from '@common/schema/user';
import {
  ApiResponse,
  friendAction,
  Layer,
  Protocol,
  State,
} from '@common/utils/response';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';
import { AddFriendDto } from '../friends/dto/add-friend';

@Injectable()
export class HasUser implements CanActivate {
  constructor(@InjectModel('user') private user: Model<userModel>) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.getArgByIndex(0);
    const payload: AddFriendDto = body;
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ADD_FRIEND,
    );
    const { tid } = payload;
    const profile = await this.user.findOne({ tid });
    if (isEmpty(profile)) {
      res.fail(State.FAIL_NOT_USER);
      throw new HttpException(res.getResponse(), 422);
    }
    return true;
  }
}
