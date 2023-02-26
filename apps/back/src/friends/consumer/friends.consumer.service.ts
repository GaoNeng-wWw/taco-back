import { INoticePayload } from '@common/interface/notice.interface';
import { RequestPayload } from '@common/interface/request.interface';
import { Friends } from '@common/schema/friends';
import { User } from '@common/schema/user';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class FriendsConsumerService {
  constructor(
    @InjectModel('user') private userModel: Model<User>,
    @InjectModel('friends') private friendsModel: Model<Friends>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  @RabbitRPC({
    queue: 'db.frinds.black-list',
    exchange: 'system.db',
    routingKey: 'friends.black-list',
    createQueueIfNotExists: true,
  })
  async moveToBlackList(payload: INoticePayload<any>) {
    const session = await this.friendsModel.startSession();
    const { source, target } = payload;
    let ack = false;
    session.startTransaction();
    try {
      await this.friendsModel.updateOne(
        {
          tid: source,
        },
        {
          $push: {
            black_list: target,
          },
        },
      );
      await session.commitTransaction();
      ack = true;
    } catch (e) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
    return ack;
  }
  @RabbitRPC({
    exchange: 'system.db',
    queue: 'db.friends.remove',
    routingKey: 'friends.remove',
    createQueueIfNotExists: true,
  })
  async removeFriend(payload: RequestPayload<any>) {
    const session = await this.friendsModel.startSession();
    const { sender, reciver } = payload;
    let ack = false;
    try {
      session.startTransaction();
      await this.friendsModel.updateOne(
        {
          tid: sender,
        },
        {
          $pull: {
            friends: {
              $eq: reciver,
            },
          },
        },
      );
      await this.friendsModel.updateOne(
        {
          tid: reciver,
        },
        {
          $pull: {
            friends: {
              $eq: sender,
            },
          },
        },
      );
      ack = true;
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
    return ack;
  }
  @RabbitRPC({
    exchange: 'system.db',
    queue: 'db.friends.add',
    routingKey: 'friends.add',
    createQueueIfNotExists: true,
  })
  async addFriend(payload: RequestPayload<any>) {
    const session = await this.friendsModel.startSession();
    const { sender, reciver } = payload;
    let ack = false;
    try {
      session.startTransaction();
      await this.friendsModel.updateOne(
        {
          tid: sender,
        },
        {
          $push: {
            friends: reciver,
          },
        },
      );
      await this.friendsModel.updateOne(
        {
          tid: reciver,
        },
        {
          $push: {
            friends: sender,
          },
        },
      );
      await session.commitTransaction();
      ack = true;
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
    return ack;
  }
  @RabbitRPC({
    exchange: 'system.db',
    queue: 'db.request.remove',
    routingKey: 'request.remove',
    createQueueIfNotExists: true,
  })
  @RabbitRPC({
    exchange: 'system.db',
    queue: 'db.notice.remove',
    routingKey: 'notice.remove',
    createQueueIfNotExists: true,
  })
  async removeRequestOrNotice({
    type,
    id,
    tid,
  }: {
    type: 'request' | 'notice';
    id: string;
    tid: string;
  }) {
    const removeNotice = [
      this.userModel.updateOne(
        {
          tid,
        },
        {
          $unset: {
            [`${type}.${id}`]: '',
          },
        },
      ),
      this.redis.hdel(`request:${tid}`, id),
    ];
    return new Promise((resolve) => {
      Promise.all(removeNotice)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }
}
