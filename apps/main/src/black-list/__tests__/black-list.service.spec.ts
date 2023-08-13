import { Test, TestingModule } from '@nestjs/testing';
import { BlackListService } from '../black-list.service';
import { DbModule } from '@app/db';
import { ModelDefinitionModule } from '@app/model-definition';

describe('BlackListService', () => {
	let service: BlackListService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DbModule, ModelDefinitionModule],
			providers: [BlackListService],
		}).compile();

		service = module.get<BlackListService>(BlackListService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	it('get black list', () => {
		expect(service.getBlockList('1')).resolves.toStrictEqual([]);
		return expect(service._inBlackList('1', '2')).resolves.toBe(false);
	});
	it('block user', async () => {
		expect(await service.block('1', '2')).toBe(true);
		return expect(await service._inBlackList('1', '2')).toBe(true);
	});
	it('unblock user', async () => {
		expect(service.unblock('1', '2')).resolves.toBe(true);
		return expect(service._inBlackList('1', '2')).resolves.toBe(false);
	});
});
