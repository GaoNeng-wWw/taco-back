import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeUserProfileDto, RegisterDto } from '@app/interface';
import { HttpExceptionFilter, HttpResponseInterceptor } from '@app/common';
import { AppModule } from '../apps/main/src/app.module';
import { NestFactory } from '@nestjs/core';
import { AddFriendDto } from '@app/interface/models/request/AddFriendDto';
describe('main', () => {
	let app: INestApplication;
	let server: any;
	let token: string;
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
		token = req.body.token;
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
			.set('Authorization', `Bearer ${token}`)
			.query({ tid: '-1' })
			.expect(HttpStatus.BAD_REQUEST);
		return request(server)
			.get('/users/profile')
			.set('Authorization', `Bearer ${token}`)
			.query({ tid: '1' })
			.expect(200);
	});
	it('update profile', async () => {
		await request(server)
			.patch('/users/profile')
			.set('Authorization', `Bearer ${token}`)
			.send({
				description: 'update',
			})
			.expect(HttpStatus.OK);
		const { body } = await request(server)
			.get('/users/profile')
			.set('Authorization', `Bearer ${token}`)
			.query({ tid: '1' });
		expect(body.description).toBe('update');
	});
});
