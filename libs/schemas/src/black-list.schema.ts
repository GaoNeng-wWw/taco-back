import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument, SchemaType, SchemaTypes } from 'mongoose';
@Schema()
export class BlackList {
	@Prop()
	source: string;
	@Prop()
	target: string;
}
export type BlackListDocument = HydratedDocument<BlackList>;
export const BlackListSchema = SchemaFactory.createForClass(BlackList);
