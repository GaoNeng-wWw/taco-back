import { IsNotEmpty } from 'class-validator';

export class p2pMessageDTO {
  @IsNotEmpty()
  reciver: string;
  @IsNotEmpty()
  timestamp: string;
  messages: string[];
}
