import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

class Member {
  nick: string;
  role: 'master' | 'manager' | 'member';
}

export class CreateGroupDto {
  @IsNotEmpty()
  avatar: string;
  @IsNotEmpty()
  member: {
    [tid: string]: Member;
  };
}
export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
export class AppendManager {
  @IsNotEmpty()
  manager: string;
}
export class TickMember {
  @IsNotEmpty()
  tid: string;
  @IsNotEmpty()
  toBlackList: boolean;
}
export class TransMaster {
  @IsNotEmpty()
  tid: string;
}
export class DissolutionGroup {
  @IsNotEmpty()
  gid: string;
}
