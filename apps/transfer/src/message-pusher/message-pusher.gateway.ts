import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagePusherService } from './message-pusher.service';
import { Server, Socket } from 'socket.io';
import { p2pMessageStructure } from '@common/interface/strcutre/p2p';
import { groupMessageStructure } from '@common/interface/strcutre/group';
import { UseGuards } from '@nestjs/common';
import { beforeSendGurade } from './gurade/beforeSendMessageGurade';
import { TokenAuthGurade } from './gurade/TokenAuthGurade';
import { p2pMessageDTO } from './dto/p2p.dto';
@WebSocketGateway(3001)
export class MessagePusherGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly messagePusherService: MessagePusherService) {}
  @UseGuards(TokenAuthGurade, beforeSendGurade)
  @UseGuards(beforeSendGurade)
  @SubscribeMessage('p2p')
  async p2p(client: Socket, payload: p2pMessageDTO) {
    await this.messagePusherService.p2p(client, payload);
  }
  // @SubscribeMessage('group')
  // async group(
  //   @ConnectedSocket() client: Socket,
  //   payload: groupMessageStructure,
  // ) {}
  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.messagePusherService.connect(client);
  }
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.messagePusherService.disconnect(client);
  }
}
