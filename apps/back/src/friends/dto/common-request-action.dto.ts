import { IsNotEmpty, IsString } from 'class-validator';

export class CommonRequestActionDto {
  @IsString()
  @IsNotEmpty()
  rid: string;
}
