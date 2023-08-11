import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterDto } from '@app/interface';
import { HttpExceptionFilter } from '@app/common';
import { AppModule } from '../apps/main/src/app.module';
import { NestFactory } from '@nestjs/core';
import { AddFriendDto } from '@app/interface/models/request/AddFriendDto';
import { Request } from '@app/factory';

describe('main', () => {
	let app: INestApplication;
	let server: any;
	const token = [];
	beforeAll(async () => {
		app = await NestFactory.create(AppModule);
		app.useGlobalFilters(new HttpExceptionFilter());
		await app.listen(3000);
		server = app.getHttpServer();
	});
	afterAll((done) => {
		app.close().then(() => {
			done();
		});
	});
	it('user register', async () => {
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
		for (let i = 0; i < 10; i++) {
			await request(server)
				.post('/account/register')
				.send({
					...dto,
					name: `Tester-${i}`,
					email: `tester-${i}@no-reply.com`,
				})
				.expect(201);
		}
		return Promise.resolve(true);
	});
	it('user login', async () => {
		const req = await request(server).get('/account/login').send({
			tid: '1',
			password: '123456789Sd!',
		});
		token.push(req.body.token);
		for (let i = 2; i <= 10; i++) {
			const req = await request(server).get('/account/login').send({
				tid: i.toString(),
				password: '123456789Sd!',
			});
			token.push(req.body.token);
		}
		expect(token).not.toBe('');
		return expect(req.status).toBe(HttpStatus.OK);
	});
	it('forget password', async () => {
		await request(server)
			.patch('/account/forget')
			.send({
				tid: '1',
				answer: {
					q1: 'a2',
				},
				new_pwd: '123456789Sd',
			})
			.expect(HttpStatus.BAD_REQUEST);
		await request(server)
			.patch('/account/forget')
			.send({
				tid: '1',
				answer: {
					q1: 'a1',
				},
				new_pwd: '123456789Sd',
			})
			.expect(HttpStatus.OK);
		return request(server)
			.get('/account/login')
			.send({
				tid: '1',
				password: '123456789Sd!',
			})
			.expect(HttpStatus.BAD_REQUEST);
	});
	it('get user profile', async () => {
		await request(server)
			.get('/users/profile')
			.set('Authorization', `Bearer ${token[0]}`)
			.query({ tid: '-1' })
			.expect(HttpStatus.BAD_REQUEST);
		return request(server)
			.get('/users/profile')
			.set('Authorization', `Bearer ${token[0]}`)
			.query({ tid: '1' })
			.expect(200);
	});
	it('update profile', async () => {
		await request(server)
			.patch('/users/profile')
			.set('Authorization', `Bearer ${token[0]}`)
			.send({
				description: 'update',
			})
			.expect(HttpStatus.OK);
		const { body } = await request(server)
			.get('/users/profile')
			.set('Authorization', `Bearer ${token[0]}`)
			.query({ tid: '1' });
		return expect(body.description).toBe('update');
	});
	it.todo('report user');
	it('add friend', async () => {
		const add: AddFriendDto = {
			tid: '2',
			msg: 'test',
		};
		await request(server)
			.get('/friends')
			.set('Authorization', `Bearer ${token[0]}`)
			.query({
				page: 1,
			})
			.expect(HttpStatus.OK)
			.expect([]);
		await request(server)
			.put('/friends')
			.set('Authorization', `Bearer ${token[0]}`)
			.send(add)
			.expect(HttpStatus.OK);
		const { body, statusCode } = await request(server)
			.get('/request')
			.set('Authorization', `Bearer ${token[1]}`)
			.query({
				page: 1,
			});
		expect(statusCode).toBeLessThan(299);
		expect(body).not.toStrictEqual([]);

		for (const req of body as Request<any, any>[]) {
			const { rid } = req;
			const { statusCode } = await request(server)
				.put('/request/accept')
				.set('Authorization', `Bearer ${token[1]}`)
				.query({
					rid,
				});
			expect(statusCode).toBeLessThan(299);
		}
		const { body: friends } = await request(server)
			.get('/friends')
			.set('Authorization', `Bearer ${token[0]}`)
			.query({
				page: 1,
			});
		expect(statusCode).toBeLessThan(299);
		expect(friends).not.toStrictEqual([]);
	});
});
