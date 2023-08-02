import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeUserProfileDto, RegisterDto } from '@app/interface';
import { HttpExceptionFilter } from '@app/common';
import { AppModule } from '../apps/main/src/app.module';
import { NestFactory } from '@nestjs/core';
describe('main', () => {
	let app: INestApplication;
	let server: any;
	let token: string;
	beforeAll(async () => {
		app = await NestFactory.create(AppModule, {
			logger: false,
		});
		app.useGlobalFilters(new HttpExceptionFilter());
		await app.listen(3000);
		server = app.getHttpServer();
	});
	afterAll((done) => {
		app.close().then(() => {
			done();
		});
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
		it('GET (/account/login)', async () => {
			const req = await request(server).get('/account/login').send({
				tid: '1',
				password: '123456789Sd!',
			});
			token = req.body.token;
			return expect(req.status).toBe(200);
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
	describe('User (e2e)', () => {
		it('GET (/users/profile)', async () => {
			request(server)
				.get('/users/profile')
				.set('authorization', `Bearer ${token}`)
				.query({
					tid: '1',
				})
				.expect(200);
			return request(server)
				.get('/users/profile')
				.set('authorization', `Bearer ${token}`)
				.query({
					tid: '-11',
				})
				.expect(400);
		});
		it('PATCH (/users/profile)', async () => {
			const dto: ChangeUserProfileDto = {
				nick: 'new-nick',
			};
			await request(server)
				.patch('/users/profile')
				.set('authorization', `Bearer ${token}`)
				.send(dto)
				.expect(200);
			return request(server)
				.get('/users/profile')
				.set('authorization', `Bearer ${token}`)
				.query({
					tid: '1',
				})
				.expect(200)
				.then(({ body }) => {
					return expect(body.nick).toBe(dto.nick);
				});
		});
	});
});
