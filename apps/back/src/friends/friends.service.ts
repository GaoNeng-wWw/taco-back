import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notice } from '../interface/Model/notice';
import { tokenPayload } from '../interface/strcutre/token';
import {
  ApiResponse,
  friendAction,
  Layer,
  Protocol,
  State,
} from '../utils/response';
import { userModel, UserSchema } from '../schema/user';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel('user') private userModel: Model<userModel>,
    private cache: RedisService,
  ) {}
  async friendList(dto: tokenPayload) {
    const { tid } = dto;
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.GET_FRIENDS,
    );
    return this.userModel
      .find(
        {
          tid,
        },
        'friends -_id',
      )
      .lean()
      .exec()
      .then((friends) => {
        res.setData(friends[0] ?? []);
        return res.getResponse();
      })
      .catch(() => {
        res.fail();
        return res.getResponse();
      });
    //
  }
  async refuseFriend(dto: { target: number; source: number; reason?: string }) {
    const friendCache = this.cache.getClient('friend');
    const { target, source, reason } = dto;
    const refuseFriendRequest: string = JSON.stringify({
      type: 'friend-refuse',
      tid: source,
      reason,
    } as Notice);
    friendCache.sadd(target.toString(), refuseFriendRequest);
  }
  async acceptFriend(dto: { tid: number }) {
    const friendCache = this.cache.getClient('friend');
    const response = new ApiResponse(
      Protocol.HTTP,
      Layer.FRIEND,
      friendAction.ACCEPT_REQ,
    );
    return this.userModel
      .findOne({
        tid: dto.tid,
      })
      .exec()
      .then((ref) => {
        const { _id } = ref;
        ref.friends = undefined;
        ref.password = undefined;
        return this.userModel
          .updateOne(
            {
              tid: dto.tid,
            },
            {
              $push: {
                friends: _id,
              },
            },
          )
          .exec()
          .then(async () => {
            await friendCache.srem(dto.tid.toString(), _id);
            return response.getResponse();
          })
          .catch(() => {
            response.fail();
            return response.getResponse();
          });
      })
      .catch(() => {
        response.fail(State.FAIL_BAD_REQUEST);
        return response.getResponse();
      });
  }
}
