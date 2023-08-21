import { Friend, PublicProfile } from '@app/interface';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
@Schema({
	autoCreate: true,
})
export class Users {
	@Prop({default: 0, required: true, index: true, type: ()=>BigInt})
	tid: number;
	@Prop()
	nick: string;
	@Prop()
	description: string;
	@Prop()
	password: string;
	@Prop()
	email: string;
	@Prop()
	sex: string;
}
export type UsersDocument = HydratedDocument<Users>;
export const UsersSchema = SchemaFactory.createForClass(Users);