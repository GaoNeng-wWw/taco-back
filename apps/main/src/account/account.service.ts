import { JwtService } from '@app/jwt';
import { Users, UsersDocument } from '@app/schemas/user.schema';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	RegisterDto,
	LoginDto,
	RegisterResponseData,
	GetQuestionResponseData,
	CheckAnswerDto,
	ChangePasswordDto,
	ForgetPasswordDto,
	Profile,
} from '@app/interface';
import { createHash } from 'crypto';
import { isEmpty } from 'lodash';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Questions, QuestionsDocument } from '@app/schemas/querstions.schema';

@Injectable()
export class AccountService {
	private ACCOUNT_POOL_NAMESPACE = () => 'ACCOUNT:POOL';
	private TOKEN_NAMESPACE = (tid: string) => `TOKEN:${tid}`;
	constructor(
		@InjectModel(Users.name)
		private readonly userModel: Model<UsersDocument>,
		@InjectModel(Questions.name)
		private readonly questions: Model<QuestionsDocument>,
		private readonly jwt: JwtService,
		@InjectRedis() private readonly redis: Redis,
	) {}
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
				tid: tid.toString(),
				...createUserDto,
			},
		]);
		const question = new this.questions();
		question.question = createUserDto.question;
		question.uid = tid.toString();
		await question.save();
		await this.redis.incrby(this.ACCOUNT_POOL_NAMESPACE(), 1);
		return { tid: tid.toString() };
	}
	async login(dto: LoginDto) {
		dto['password'] = createHash('sha256')
			.update(dto['password'])
			.digest('hex');
		const { tid, password } = dto;
		const info = await this.userModel
			.findOne<Profile>(
				{
					tid: tid,
					password: password,
				},
				{
					friends: 0,
				},
			)
			.lean()
			.exec();
		if (isEmpty(info)) {
			throw new ServiceError(serviceErrorEnum.TID_OR_PASSWORD_ERROR);
		}
		return this.jwt.signObject(info);
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
	async checkAnswer(tid: string, question_id: string, dto: CheckAnswerDto) {
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
		console.log(dto);
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
			throw new ServiceError(serviceErrorEnum.ANSWER_ERROR);
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
