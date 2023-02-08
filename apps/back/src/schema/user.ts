import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Notice } from '../interface/Model/notice';

@Schema()
class User extends Document {
  @Prop()
  tid: number;
  @Prop({ required: true })
  nick: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  description: string;
  @Prop()
  friends: Array<string>;
  @Prop({ required: true })
  birthday: string;
  @Prop()
  join_date: number;
  @Prop()
  phone: string;
  @Prop()
  notices: Notice[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type userModel = User & Document;
