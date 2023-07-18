import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { mockFactory } from '@app/mock';
import { AuthGuard } from '@app/jwt/jwt.guard';
import { AccountService } from '../../account/account.service';

describe('UsersController', () => {
	let controller: UsersController;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockFactory(UsersService, true),
				},
			],
		})
			.overrideGuard(AuthGuard)
			.useValue(true)
			.compile();

		controller = module.get<UsersController>(UsersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
	it('get profile', () => {
		expect(controller.getProfile('1')).resolves.not.toThrow();
	});
	it('update profile', () => {
		expect(
			controller.patchProfile(
				{
					nick: 'nick',
					email: 'email',
					description: 'description',
					birthday: 'birthday',
				},
				'1',
			),
		).resolves.not.toThrow();
	});
});
