import { Test, TestingModule } from '@nestjs/testing';
import { RequestController } from '../request.controller';
import { RequestService } from '../request.service';
import { mockFactory } from '@app/mock';

describe('RequestController', () => {
	let controller: RequestController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RequestController],
			providers: [
				{
					provide: RequestService,
					useValue: mockFactory(RequestService, true),
				},
			],
		}).compile();

		controller = module.get<RequestController>(RequestController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('get all request', () => {
		it('invalidate page', () => {
			expect(controller.getRequests(-1, '')).rejects.toThrow();
		});
		it('legal page', () => {
			expect(controller.getRequests(0, '')).resolves.not.toThrow();
		});
	});

	it('accept', () => {
		expect(controller.acceptRequest('', '')).resolves.not.toThrow();
	});
	it('refuse', () => {
		expect(controller.refuseRequest('', '')).resolves.not.toThrow();
	});
});
