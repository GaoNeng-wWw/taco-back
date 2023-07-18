import { mockFactory } from '@app/mock';
import { NoticeController } from '../notice.controller';
import { NoticeService } from '../notice.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('Notice controller', () => {
	let controller: NoticeController;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [NoticeController],
			providers: [
				{
					provide: NoticeService,
					useValue: mockFactory(NoticeService, true),
				},
			],
		}).compile();

		controller = module.get<NoticeController>(NoticeController);
	});
	it('shoule be defined', () => {
		expect(controller).toBeDefined();
	});
	it('get notice', () => {
		expect(controller.getNotice('1', 1)).resolves.not.toThrow();
	});
});
