import { IsBoolean, IsString, ValidateIf } from 'class-validator';
import { AddFriendDto } from './add-friend';
export class RemoveFriend extends AddFriendDto {
  @ValidateIf((obj, value) => value !== undefined)
  toBlackList: boolean | null;
}
