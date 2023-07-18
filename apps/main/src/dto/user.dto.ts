import { ChangeUserProfileDto } from "@app/interface";
import { IsNotEmpty, IsString } from "class-validator";

export class UserProfileDto implements ChangeUserProfileDto{
	@IsString()
	nick?: string;
	@IsString()
	description?: string;
	@IsString()
	birthday?: string;
	@IsString()
	email?: string;
}