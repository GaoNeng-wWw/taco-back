import {LoginDto, RegisterDto} from '@app/interface';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class LoginDTO implements LoginDto {
	@IsNotEmpty()
	@IsString()
	tid: string;
	@IsNotEmpty()
	@IsString()
	password: string;
}

export class RegisterDTO implements RegisterDto{
	@IsNotEmpty()
	@IsString()
	name: string;
	@IsNotEmpty()
	@IsString()
	description: string;
	@IsNotEmpty()
	@IsString()
	email: string;
	@IsNotEmpty()
	@IsString()
	password: string;
	@IsNotEmpty()
	@IsString()
	sex: string;
	@IsNotEmpty()
	@IsObject()
	question: {
		[x:string]: string
	};
	@IsNotEmpty()
	@IsObject()
	birthday: string
}