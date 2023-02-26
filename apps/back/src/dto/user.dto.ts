import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UserLoginDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  tid: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}

export class UserRegisterDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nick: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  birthday: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone: string;
}
