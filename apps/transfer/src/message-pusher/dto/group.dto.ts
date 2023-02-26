import { IsNotEmpty } from 'class-validator';
export default class GroupMessageDTO {
  @IsNotEmpty()
  gid: string;
  @IsNotEmpty()
  timestamp: string;
  messages: string[];
}
