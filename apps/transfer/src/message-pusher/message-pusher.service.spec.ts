import { Test, TestingModule } from '@nestjs/testing';
import { MessagePusherService } from './message-pusher.service';

describe('MessagePusherService', () => {
  let service: MessagePusherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagePusherService],
    }).compile();

    service = module.get<MessagePusherService>(MessagePusherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
