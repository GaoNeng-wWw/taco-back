import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema({
	autoCreate: true,
	autoIndex: true,
})
export class Questions {
	@Prop({type: ()=>BigInt})
	uid: number;
	@Prop({
		type: Object
	})
	question: {
		[x:string]: string
	}
}

export type QuestionsDocument = Questions & Document;
export const QuestionsSchema = SchemaFactory.createForClass(Questions)