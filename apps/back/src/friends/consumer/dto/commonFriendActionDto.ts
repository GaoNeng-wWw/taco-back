import { IsNotEmpty, IsString } from 'class-validator';

export class CommonFriendActionDto {
  @IsString()
  @IsNotEmpty()
  source: string;
  @IsString()
  @IsNotEmpty()
  target: string;
}
