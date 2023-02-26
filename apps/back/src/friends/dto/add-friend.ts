import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
export class AddFriendDto {
  @IsNotEmpty()
  @IsString()
  tid: string;
  @IsString()
  @ValidateIf((o, v) => typeof v === 'string')
  message: string;
}
