import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schema/user';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'user',
        schema: UserSchema,
        collection: 'user',
      },
    ]),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
