import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
	autoCreate: true
})
export class Counter{
	@Prop()
	name: string
	@Prop({ required: true})
	count: number
}
export type CounterDocument = Counter & Document;
export const CounterSchema = SchemaFactory.createForClass(Counter);
