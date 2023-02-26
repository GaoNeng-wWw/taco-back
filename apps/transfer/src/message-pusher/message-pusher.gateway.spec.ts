import { Test, TestingModule } from '@nestjs/testing';
import { MessagePusherGateway } from './message-pusher.gateway';
import { MessagePusherService } from './message-pusher.service';

describe('MessagePusherGateway', () => {
  let gateway: MessagePusherGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagePusherGateway, MessagePusherService],
    }).compile();

    gateway = module.get<MessagePusherGateway>(MessagePusherGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
