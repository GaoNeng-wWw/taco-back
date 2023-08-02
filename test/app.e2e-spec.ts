import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountModule } from '../apps/main/src/account/account.module';
import { RegisterDto } from '@app/interface';
import {
	rootMongooseTestModule,
	rootRedisTestModle,
} from '@app/mock/memory-mongo';
import { HttpResponseInterceptor } from '@app/common';
describe('main', () => {
	let app: INestApplication;
	let server: any;
	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				rootRedisTestModle(),
				rootMongooseTestModule(),
				AccountModule,
			],
		})
			.overrideInterceptor(HttpResponseInterceptor.name)
			.useClass(HttpResponseInterceptor)
			.compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		server = app.getHttpServer();
	});
	describe('Account (e2e)', () => {
		let questionId = '';
		const dto: RegisterDto = {
			name: 'Tester-1',
			sex: 'other',
			password: '123456789Sd!',
			question: {
				q1: 'a1',
			},
			description: 'descrption',
			birthday: new Date().getTime().toString(),
			email: 'tester@no-reply.com',
		};
		it('POST (/account/register)', () => {
			return request(server)
				.post('/account/register')
				.send(dto)
				.expect(201);
		});
		it('GET (/account/login)', () => {
			return request(server)
				.get('/account/login')
				.send({
					tid: '1',
					password: '123456789Sd!',
				})
				.expect(200);
		});
		it('GET (/account/question)', async () => {
			const req = await request(server).get('/account/question').send({
				tid: '1',
			});
			questionId = req.body.id;
			return expect(req.statusCode).toBe(200);
		});
		it('GET (/account/check/answer)', () => {
			return request(server)
				.get('/account/check/answer')
				.query({
					tid: '1',
					question_id: questionId,
				})
				.send({
					question: {
						q1: 'a1',
					},
				})
				.expect(200);
		});
		it('PATCH (/account/password)', () => {
			return request(server)
				.patch('/account/password')
				.send({
					tid: '1',
					old_pwd: '123456789Sd!',
					new_pwd: '123456789',
				})
				.expect(200);
		});
		describe('PATCH (/account/forget)', () => {
			it('answer error', () => {
				return request(server)
					.patch('/account/forget')
					.send({
						tid: '1',
						answer: {
							q1: 'a2',
						},
						new_pwd: '123456789Sd',
					})
					.expect(500);
			});
			it('answer success', () => {
				return request(server)
					.patch('/account/forget')
					.send({
						tid: '1',
						answer: {
							q1: 'a1',
						},
						new_pwd: '123456789Sd',
					})
					.expect(200);
			});
			it('raw password should not be login', () => {
				return request(server)
					.get('/account/login')
					.send({
						tid: '1',
						password: '123456789Sd!',
					})
					.expect(500);
			});
		});
	});
});
