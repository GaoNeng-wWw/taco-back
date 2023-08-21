import { ConfigService } from '@app/config';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import {
	ChangePasswordDto,
	CheckAnswerDto,
	ForgetPasswordDto,
	GetQuestionResponseData,
	LoginDto,
	RegisterDto,
	RegisterResponseData,
} from '@app/interface';
import { JwtService } from '@app/jwt';
import { Questions, QuestionsDocument } from '@app/schemas/querstions.schema';
import { Users, UsersDocument } from '@app/schemas/user.schema';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';
import ms from 'ms';
import { Questions, QuestionsDocument } from '@app/schemas/querstions.schema';
import { ConfigService } from '@app/config';
@Injectable()
export class AccountService {
	private ACCOUNT_POOL_NAMESPACE = () => 'ACCOUNT:POOL';
	private TOKEN_NAMESPACE = (tid: string) => `TOKEN:${tid}`;
	private REFRESH_TOKEN_NS = (tid: string) => `TOKEN:REFRESH:${tid}`;
	constructor(
		@InjectModel(Users.name)
		private readonly userModel: Model<UsersDocument>,
		@InjectModel(Questions.name)
		private readonly questions: Model<QuestionsDocument>,
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
		@InjectRedis() private readonly redis: Redis,
	) {}
	private async createToken(tid: string) {
		const access_token = await this.createAccessToken(tid);
		return {
			access_token,
			refresh_token: this.createRefreshToken(access_token, tid),
		};
	}
	private async createRefreshToken(access_token: string, tid: string) {
		const refreshTokenNs = this.REFRESH_TOKEN_NS(tid);
		const refresh_token_expire = ms(
			this.config.get<string>(
				'system.account.token.expire.refresh_token',
			) ?? '30d',
		);
		const refresh_token = await this.jwt.signObject(
			{ access_token },
			this.config.get('system.account.token.expire.refresh_token'),
		);
		await this.redis.set(refreshTokenNs, refresh_token);
		await this.redis.setnx(refreshTokenNs, refresh_token_expire);
		return refresh_token;
	}

	private async createAccessToken(tid: string) {
		const ns = this.TOKEN_NAMESPACE(tid);
		const access_token_expire = ms(
			this.config.get<string>(
				'system.account.token.expire.access_token',
			) ?? '7d',
		);
		const access_token = await this.jwt.signObject(
			tid,
			this.config.get('system.account.token.expire.access_token'),
		);
		await this.redis.set(ns, access_token);
		await this.redis.setnx(ns, access_token_expire);
		return access_token;
	}

	@RabbitRPC({
		exchange: 'system.call',
		queue: 'system.call.account',
		routingKey: 'account.alive',
		createQueueIfNotExists: true,
	})
	async alive({ tid }: { tid: string }) {
		const ns = this.TOKEN_NAMESPACE(tid);
		return Boolean(await this.redis.get(ns));
	}
	@RabbitRPC({
		exchange: 'system.call',
		queue: 'system.call.account',
		routingKey: 'account.refresh',
		createQueueIfNotExists: true,
	})
	async refresh({
		refresh_token,
		renew_refresh_token,
	}: {
		refresh_token: string;
		renew_refresh_token?: boolean;
	}) {
		const { access_token } = await this.jwt.decode<{
			access_token: string;
		}>(refresh_token);
		const oldToken = await this.jwt
			.verify<{ tid: string }>(access_token)
			.then(() => access_token)
			.catch(
				(reason: {
					name: 'JsonWebTokenError' | 'TokenExpiredError';
					message: string;
				}) => {
					if (reason.name !== 'TokenExpiredError') {
						throw new ServiceError(
							serviceErrorEnum.FAIL_TOKEN_INVALIDATE,
							HttpStatus.BAD_REQUEST,
						);
					}
					return access_token;
				},
			);
		const { tid } = await this.jwt.decode<{ tid: string }>(oldToken);
		const token = await this.createAccessToken(tid);
		if (!renew_refresh_token) {
			return {
				access_token: token,
				refresh_token,
			};
		}
		return {
			access_token: token,
			refresh_token: await this.createRefreshToken(token, tid),
		};
	}
	async registe(createUserDto: RegisterDto): Promise<RegisterResponseData> {
		const tid =
			Number(await this.redis.get(this.ACCOUNT_POOL_NAMESPACE())) + 1;
		const hash = createHash('sha256');
		createUserDto['password'] = hash
			.update(createUserDto['password'])
			.digest('hex');
		const info = await this.userModel
			.findOne({
				email: createUserDto.email,
			})
			.lean()
			.exec();
		if (!isEmpty(info)) {
			throw new ServiceError(
				serviceErrorEnum.HAS_SAME_USER,
				HttpStatus.BAD_REQUEST,
			);
		}
		await this.userModel.insertMany([
			{
				tid: tid,
				...createUserDto,
			},
		]);
		const question = new this.questions();
		question.question = createUserDto.question;
		question.uid = tid;
		await question.save();
		await this.redis.incrby(this.ACCOUNT_POOL_NAMESPACE(), 1);
		return { tid: tid };
	}
	async login(dto: LoginDto) {
		dto['password'] = createHash('sha256')
			.update(dto['password'])
			.digest('hex');
		const { tid, password } = dto;
		const info = await this.userModel
			.findOne(
				{
					tid: tid,
					password: password,
				},
				{
					tid: 1,
				},
			)
			.lean<{ tid: string }>()
			.exec();
		if (isEmpty(info)) {
			throw new ServiceError(
				serviceErrorEnum.TID_OR_PASSWORD_ERROR,
				HttpStatus.BAD_REQUEST,
			);
		}
		return this.createToken(dto.tid);
	}

	async getQuestion(tid: string): Promise<GetQuestionResponseData> {
		const rawData = await this.questions
			.findOne({ uid: tid })
			.lean()
			.exec();
		return {
			id: rawData['_id'],
			question: Object.keys(rawData['question'])[0],
		};
	}
	async checkAnswer(tid: number, question_id: string, dto: CheckAnswerDto) {
		const { question } = await this.questions
			.findOne(
				{
					uid: tid,
					_id: question_id,
				},
				{
					question: 1,
				},
			)
			.lean()
			.exec();
		if (JSON.stringify(question) !== JSON.stringify(dto.question)) {
			throw new ServiceError(
				serviceErrorEnum.ANSWER_ERROR,
				HttpStatus.BAD_REQUEST,
			);
		}
		return true;
	}
	async changePassWord(dto: ChangePasswordDto) {
		const { tid, old_pwd, new_pwd } = dto;
		await this.userModel
			.findOneAndUpdate(
				{
					tid: tid,
					password: old_pwd,
				},
				{
					$set: {
						password: createHash('sha256')
							.update(new_pwd)
							.digest('hex'),
					},
				},
				{
					new: true,
				},
			)
			.exec();
		const tokenNameSpace = this.TOKEN_NAMESPACE(tid);
		await this.redis.del(tokenNameSpace);
		return true;
	}
	async forgetPassword(dto: ForgetPasswordDto) {
		const { tid, answer, new_pwd } = dto;
		const info = await this.questions
			.findOne({
				uid: tid,
			})
			.lean()
			.exec();
		const questionStr = JSON.stringify(info?.question ?? '{}');
		if (questionStr !== JSON.stringify(answer)) {
			throw new ServiceError(
				serviceErrorEnum.ANSWER_ERROR,
				HttpStatus.BAD_REQUEST,
			);
		}
		await this.userModel
			.findOneAndUpdate(
				{
					tid: tid,
				},
				{
					$set: {
						password: createHash('sha256')
							.update(new_pwd)
							.digest('hex'),
					},
				},
			)
			.exec();
		await this.redis.del(this.TOKEN_NAMESPACE(tid));
		return true;
	}
}
