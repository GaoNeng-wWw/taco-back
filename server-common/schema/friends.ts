import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema()
export class Friends extends Document {
  @Prop()
  tid: string;
  @Prop({
    ref: 'user',
    type: Types.ObjectId,
  })
  friends: Array<string>;
}

export const FriendsSchema = SchemaFactory.createForClass(Friends);
export type friendsModel = Friends & Document;
