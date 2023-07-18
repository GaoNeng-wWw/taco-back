import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes } from 'mongoose';
import { Tags } from "./tags.schema";
import { Users } from "./user.schema";

@Schema({
	autoCreate: true,
})
export class Friend {
	@Prop()
	source: string
	@Prop({ ref: Users.name })
	target: string
	@Prop({ref: Tags.name, refPath: '-creator'})
	tag: string
	@Prop()
	nick: string
}

export type FriendDocument = Friend & Document;
export const FriendSchema = SchemaFactory.createForClass(Friend);