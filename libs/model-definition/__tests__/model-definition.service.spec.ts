import { Test, TestingModule } from '@nestjs/testing';
import { ModelDefinitionService } from '../src/model-definition.service';

describe('ModelDefinitionService', () => {
	let service: ModelDefinitionService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ModelDefinitionService],
		}).compile();

		service = module.get<ModelDefinitionService>(ModelDefinitionService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
