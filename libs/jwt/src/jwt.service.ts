import { Users, UsersDocument } from '@app/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService as JWTService } from '@nestjs/jwt';
import { isEmpty } from 'lodash';

@Injectable()
export class JwtService {
	constructor(
		@InjectModel(Users.name)
		private readonly userModel: Model<UsersDocument>,
		private readonly jwt: JWTService,
	) {}
	async verify(token: string) {
		return this.jwt.verify(token);
	}
	async decode<T extends { [key: string]: any } | string>(
		token: string,
	): Promise<T> {
		return this.jwt.decode(token) as T;
	}
	async sign(tid: string, password: string) {
		const res = await this.userModel
			.findOne(
				{
					tid: tid,
					password: password,
				},
				{
					_id: -1,
					friends: -1,
				},
			)
			.lean()
			.exec();
		if (isEmpty(res)) {
			return null;
		}
		return this.jwt.sign(res);
	}
	async signObject<T extends string | object | Buffer>(
		data: T,
	): Promise<string> {
		return this.jwt.sign(data);
	}
	// async renewal(token: string) {
	// 	const { expire } = this.jwt.decode(token);
	// }
}
