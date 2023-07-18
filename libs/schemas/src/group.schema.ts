import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { UsersSchema, UsersDocument, Users } from './user.schema';
import { GroupMember } from '@app/interface';

@Schema()
export class Groups{
	@Prop({required: true})
	gid: string;
	@Prop({required: true})
	name: string;
	@Prop()
	description: string;
	@Prop({ type: UsersSchema, ref: Users.name, refPath: '-password -friends'})
	master: GroupMember
	@Prop({ type: UsersSchema, ref: Users.name, refPath: '-password -friends'})
	manager: GroupMember[]
	@Prop({ type: UsersSchema, ref: Users.name, refPath: '-password -friends'})
	members: GroupMember[]
}
export type GroupsDocument = Groups & Document;
export const GroupsSchema = SchemaFactory.createForClass(Groups);