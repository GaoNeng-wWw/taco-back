import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user';

export class Member {
  [tid: string]: string;
}

@Schema()
class Group extends Document {
  @Prop()
  gid: string;
  @Prop()
  description: string;
  @Prop()
  avatar: string;
  @Prop()
  limit: number;
  @Prop({
    ref: 'user',
    type: Types.ObjectId,
  })
  master: Member;
  @Prop({
    ref: 'user',
    type: Types.ObjectId,
  })
  manager: Member[];
  @Prop({
    ref: 'user',
    type: Types.ObjectId,
  })
  member: Member[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
export type groupModel = Group & Document;
