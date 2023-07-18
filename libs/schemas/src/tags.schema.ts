import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { Users } from "./user.schema";

@Schema({
	autoCreate: true
})
export class Tags {
	@Prop()
	name: string;
	@Prop({ref: Users.name})
	creator: string;
}

export type TagsDocument = Tags & Document;
export const TagsSchema = SchemaFactory.createForClass(Tags);