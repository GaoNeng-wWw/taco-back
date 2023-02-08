import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class UserLoginDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  tid: number;
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
