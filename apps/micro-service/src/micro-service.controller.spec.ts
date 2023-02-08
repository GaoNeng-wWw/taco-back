import { Test, TestingModule } from '@nestjs/testing';
import { MicroServiceController } from './micro-service.controller';
import { MicroServiceService } from './micro-service.service';

describe('MicroServiceController', () => {
  let microServiceController: MicroServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MicroServiceController],
      providers: [MicroServiceService],
    }).compile();

    microServiceController = app.get<MicroServiceController>(MicroServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(microServiceController.getHello()).toBe('Hello World!');
    });
  });
});
