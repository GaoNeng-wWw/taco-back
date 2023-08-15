import { Test, TestingModule } from '@nestjs/testing';
import { PusherController } from './pusher.controller';
import { PusherService } from './pusher.service';

describe('PusherController', () => {
  let pusherController: PusherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PusherController],
      providers: [PusherService],
    }).compile();

    pusherController = app.get<PusherController>(PusherController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pusherController.getHello()).toBe('Hello World!');
    });
  });
});
