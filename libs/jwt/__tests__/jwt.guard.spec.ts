import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { AuthGuard } from '../src/jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '../src/jwt.service';
import { DbModule } from '@app/db';
import { mockFactory } from '@app/mock';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Random } from 'mockjs';
import { Controller, ExecutionContext, UseGuards } from '@nestjs/common';
@Controller()
class FakeController {
	@UseGuards(AuthGuard)
	fn() {
		return true;
	}
}
describe('jwt guard', () => {
	let service: JwtService;
	let guard: AuthGuard;
	let token: string;
	const fakeData = {
		uid: '123',
		password: Random.paragraph(0, 8),
		nick: Random.name(false),
		description: Random.paragraph(0, 8),
		email: Random.email(),
		sex: 'female',
		question: {
			Q1: 'A1',
		},
	};
	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [FakeController],
			imports: [
				JwtModule.register({
					global: true,
					secret: 'xBuYxme6eYaAi7ayBB8R',
				}),
			],
			providers: [
				JwtService,
				{
					provide: DbModule,
					useValue: mockFactory(DbModule),
				},
				{
					provide: MongooseModule,
					useValue: mockFactory(MongooseModule),
				},
				{
					provide: getModelToken('Users'),
					useValue: {
						new: jest.fn().mockResolvedValue({}),
						constructor: jest.fn().mockRejectedValue({}),
						findOne: jest.fn().mockReturnValue({
							lean: jest.fn().mockReturnValue({
								exec: jest.fn().mockReturnValue(fakeData),
							}),
						}),
					},
				},
			],
		}).compile();
		service = module.get<JwtService>(JwtService);
		guard = new AuthGuard(service);
		token = await service.sign('1', '123');
	});
	it('should be defined', () => {
		expect(guard).toBeDefined();
	});
	it('should be success', () => {
		const contextMock = createMock<ExecutionContext>();
		contextMock.switchToHttp().getRequest.mockReturnValue({
			headers: {
				authorization: token,
			},
		});
		expect(guard.canActivate(contextMock)).resolves.toBeTruthy();
	});
	it('shoule be fail', () => {
		const contextMock = createMock<ExecutionContext>();
		contextMock.switchToHttp().getRequest.mockReturnValue({
			headers: {
				authorization: 'fakeToken',
			},
		});
		expect(guard.canActivate(contextMock)).resolves.toBeFalsy();
		contextMock.switchToHttp().getRequest.mockReturnValue({
			headers: {
				authorization: '',
			},
		});
		expect(guard.canActivate(contextMock)).resolves.toBeFalsy();
	});
});
