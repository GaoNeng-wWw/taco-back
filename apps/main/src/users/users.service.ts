import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserProfileDto } from '../dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from '@app/schemas/user.schema';
import { isEmpty } from 'lodash';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import { Profile } from '@app/interface';
import { JwtService } from '@app/jwt';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(Users.name)
		private readonly userModel: Model<UsersDocument>,
		private readonly jwt: JwtService,
	) {}
	async profile(tid: string) {
		const info = await this.userModel
			.findOne({ tid }, '-friends -password -groups')
			.lean<Profile>()
			.exec();
		if (isEmpty(info)) {
			throw new ServiceError(
				serviceErrorEnum.NOT_FIND_USER,
				HttpStatus.BAD_REQUEST,
			);
		}
		return info;
	}
	async updateProfile(
		tid: string,
		newProfile: UserProfileDto,
	): Promise<Profile> {
		const info = await this.userModel
			.findOneAndUpdate({ tid }, newProfile, {
				lean: true,
				new: true,
				projection: {
					tid: 1,
					nick: 1,
					description: 1,
					birthday: 1,
					email: 1,
				},
			})
			.lean<Profile>()
			.exec();
		return info;
	}
}
