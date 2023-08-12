import { ConfigService } from '@app/config';
import {
	Request,
	createNotice,
	createRequest,
	createRid,
	isExpired,
} from '@app/factory';
import { RequestOption } from '@app/factory/request-options';
import { ChangeFriendTag, FriendAction, SenderType } from '@app/interface';
import { AddFriendDto } from '@app/interface/models/request/AddFriendDto';
import { Users, UsersDocument } from '@app/schemas/user.schema';
import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestService } from '../request/request.service';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { Friend, FriendDocument } from '@app/schemas/friend-ship.schema';
import { BlackList, BlackListDocument } from '@app/schemas/black-list.schema';
import { NoticeService } from '../notice/notice.service';
import { BlackListCacheService } from '@app/redis-utils/black-list/black-list.service';
import { AccountCacheService } from '@app/redis-utils/account/account.service';
import { createHash } from 'node:crypto';

@Injectable()
export class FriendsService {
	constructor(
		@InjectModel(Users.name)
		private readonly users: Model<UsersDocument>,
		@InjectModel(Friend.name)
		private readonly Friend: Model<FriendDocument>,
		@InjectModel(BlackList.name)
		private readonly blackList: Model<BlackListDocument>,
		private readonly configService: ConfigService,
		@InjectRedis() private readonly redis: Redis,
		private readonly channel: AmqpConnection,
		private readonly blackListCache: BlackListCacheService,
		private readonly accountCache: AccountCacheService,
	) {}
	async add(source: string, dto: AddFriendDto) {
		const { tid, msg } = dto;
		if (await this.hasFriend(source, tid)) {
			throw new ServiceError(
				serviceErrorEnum.HAS_FRIEND,
				HttpStatus.BAD_REQUEST,
			);
		}
		const expire = this.configService.get<number>('system.request.expire');
		const request = createRequest(
			FriendAction.ADD,
			source,
			'FRIEND',
			expire,
			dto.tid,
			{
				msg,
			},
		);
		request.rid = createRid(request);
		const { exchange, routingKey } = new RequestOption<
			'request',
			RequestService,
			typeof request
		>({
			system: 'request',
			configService: this.configService,
			payload: request,
			fn: 'addRequest',
		});
		await this.channel.request({
			exchange,
			routingKey,
			payload: request,
		});
		return true;
	}
	async remove(source: string, target: string) {
		if (!(await this.hasFriend(source, target))) {
			throw new ServiceError(
				serviceErrorEnum.NOT_HAS_FRIEND,
				HttpStatus.BAD_REQUEST,
			);
		}
		const { _id } = await this.users
			.findOne(
				{
					tid: target,
				},
				{ _id: 1 },
			)
			.lean()
			.exec();
		await this.Friend.deleteOne({
			source,
			target: _id,
		}).exec();
		const notice = createNotice(source, SenderType.FRIEND, {});
		const { exchange, routingKey } = new RequestOption<
			'notice',
			NoticeService
		>({
			system: 'notice',
			configService: this.configService,
			payload: notice,
			fn: 'setNotice',
		});
		await this.channel.publish(exchange, routingKey, notice);
		return true;
	}
	async updateTag(source: string, dto: ChangeFriendTag) {
		if (!(await this.hasFriend(source, dto.tid))) {
			throw new ServiceError(
				serviceErrorEnum.NOT_HAS_FRIEND,
				HttpStatus.BAD_REQUEST,
			);
		}
		await this.Friend.updateOne(
			{
				source,
				target: dto.tid,
			},
			{
				$set: {
					tag: dto.tag,
				},
			},
		).exec();
		return true;
	}
	async get(tid: string, page = 1) {
		const size =
			this.configService.get<number>('system.friends.size') ?? 10;
		const start = (page - 1) * size;
		return await this.Friend.aggregate<Users[]>([
			{ $limit: size },
			{ $skip: start },
			{ $match: { source: tid } },
			{
				$lookup: {
					from: Users.name.toLowerCase(),
					localField: 'target',
					foreignField: 'tid',
					as: 'result',
				},
			},
			{
				$unwind: {
					path: '$result',
				},
			},
			{
				$project: {
					tid: '$result.tid',
					nick: '$result.nick',
					description: '$result.description',
					email: '$result.email',
					sex: '$result.sex',
					tag: 1,
				},
			},
		]).exec();
	}
	async block(source: string, target: string) {
		if (!(await this.blackListCache.inBlackList(source, target))) {
			await this.blackListCache.addBlackList(source, target);
			return true;
		}
		throw new ServiceError(serviceErrorEnum.IN_BLACK_LIST);
	}
	async unblock(source: string, target: string) {
		if (!(await this.blackListCache.inBlackList(source, target))) {
			throw new ServiceError(serviceErrorEnum.NOT_IN_BLACK_LIST);
		}
		await this.blackListCache.removeTarget(source, target);
		return true;
	}
	async hasFriend(source: string, target: string) {
		const record = await this.Friend.findOne({
			source: source,
			target: target,
		}).exec();
		return record !== null;
	}
	@RabbitRPC({
		exchange: 'system.call',
		queue: 'system.call.friend',
		routingKey: 'friend.add.accept',
		createQueueIfNotExists: true,
	})
	async accept(dto: Request<'FRIEND', FriendAction>) {
		const { sender, recive } = dto;
		const session = await this.Friend.startSession();
		if (isExpired(dto)) {
			throw new ServiceError(
				serviceErrorEnum.REQUEST_EXPIRED,
				HttpStatus.BAD_REQUEST,
			);
		}
		session.startTransaction({
			writeConcern: {
				w: 'majority',
			},
		});
		try {
			const friends = [new this.Friend(), new this.Friend()];
			friends[0].source = sender;
			friends[0].target = recive;
			await friends[0].save({
				session,
			});
			friends[1].source = recive;
			friends[1].target = sender;
			await friends[1].save({
				session,
			});
			await this.channel.request({
				exchange: 'system.call',
				routingKey: 'request.remove',
				payload: {
					tid: recive,
					rid: dto.rid,
				},
			});
			await session.commitTransaction();
		} catch (e) {
			await session.abortTransaction();
			Logger.error(e);
			throw new ServiceError(
				serviceErrorEnum.UNKNOWN_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} finally {
			await session.endSession();
		}
	}
}
