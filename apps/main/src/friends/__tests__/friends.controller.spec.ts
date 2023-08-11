import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from '../friends.controller';
import { FriendsService } from '../friends.service';
import { mockFactory } from '@app/mock';
import { AuthGuard } from '@app/jwt/jwt.guard';
import { CanActivate } from '@nestjs/common';

describe('FriendsController', () => {
	let controller: FriendsController;

	beforeEach(async () => {
		const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FriendsController],
			providers: [
				{
					provide: FriendsService,
					useValue: mockFactory(FriendsService),
				},
			],
		})
			.overrideGuard(AuthGuard)
			.useValue(mockGuard)
			.compile();

		controller = module.get<FriendsController>(FriendsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
	it('Add friend', () => {
		expect(
			controller.addFriend('1', { tid: '2', msg: '' }),
		).resolves.not.toThrow();
	});
	it('Remove Friend', () => {
		expect(controller.deleteFriend('1', '2')).resolves.not.toThrow();
	});
	it('Update Tag', () => {
		expect(
			controller.updateTag('1', { tid: '2', tag: 'tag-2' }),
		).resolves.not.toThrow();
	});
	it('Get friend', () => {
		expect(controller.getFriend('1', 1)).resolves.not.toThrow();
	});

	it('block', () => {
		expect(controller.block('1', '2')).resolves.not.toThrow();
	});
	it('unblock', () => {
		expect(controller.unblock('1', '2')).resolves.not.toThrow();
	});
});
