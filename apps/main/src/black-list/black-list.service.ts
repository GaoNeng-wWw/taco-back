import { Tid } from '@app/common';
import { ConfigService } from '@app/config';
import { Profile } from '@app/interface';
import { BlackList, BlackListDocument } from '@app/schemas/black-list.schema';
import { Users } from '@app/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlackListService {
	constructor(
		@InjectModel(BlackList.name)
		private blackList: Model<BlackListDocument>,
	) {}
	getBlockList(tid: string) {
		return this.blackList
			.aggregate<Profile>([
				{
					$match: { source: tid },
				},
				{
					$lookup: {
						from: Users.name.toLowerCase(),
						localField: 'target',
						foreignField: 'tid',
						as: 'result	',
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
					},
				},
			])
			.exec();
	}
	async block(source: string, target: string) {
		const blackList = new this.blackList();
		blackList.source = source;
		blackList.target = target;
		await blackList.save();
		return true;
	}
	async unblock(source: string, target: string) {
		await this.blackList.findOneAndDelete({ source, target }).exec();
		return true;
	}
	async _inBlackList(source: string, target: string) {
		return (
			(await this.blackList.findOne({ source, target }).exec()) !== null
		);
	}
}
