import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

describe('HistoryController', () => {
	let historyController: HistoryController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [HistoryController],
			providers: [HistoryService],
		}).compile();

		historyController = app.get<HistoryController>(HistoryController);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(historyController.getHello()).toBe('Hello World!');
		});
	});
});
