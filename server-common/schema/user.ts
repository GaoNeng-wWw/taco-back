import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { INotice } from '@common/interface/notice.interface';
import { RequestPayload } from '@common/interface/request.interface';

@Schema()
export class User extends Document {
  @Prop()
  tid: string;
  @Prop({ required: true })
  nick: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  description: string;
  @Prop({ required: true })
  birthday: string;
  @Prop()
  join_date: number;
  @Prop()
  phone: string;
  @Prop({
    type: Object as any as Record<string, INotice<any, any>>,
  })
  notices: object;
  @Prop({
    ref: 'groups',
    type: Types.ObjectId,
  })
  groups: string[];
  @Prop({
    ref: 'user',
    type: 'string',
  })
  black_list: Array<User>;
  @Prop({
    type: Object as any as Record<string, RequestPayload<any>>,
  })
  request: object;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type userModel = User & Document;
