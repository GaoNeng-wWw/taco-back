import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from '@app/schemas/user.schema';
import { Groups, GroupsSchema } from '@app/schemas/group.schema';
import { Counter, CounterSchema } from '@app/schemas/counter.schema';
import { DbModule } from '@app/db';
import { Questions, QuestionsSchema } from '@app/schemas/querstions.schema';
import { Friend, FriendSchema } from '@app/schemas/friend-ship.schema';
import { BlackList, BlackListSchema } from '@app/schemas/black-list.schema';

@Module({
	imports: [
		DbModule,
		MongooseModule.forFeature([
			{
				name: Users.name,
				collection: 'users',
				schema: UsersSchema,
			},
			{
				name: Groups.name,
				collection: 'groups',
				schema: GroupsSchema,
			},
			{
				name: Counter.name,
				collection: 'counter',
				schema: CounterSchema,
			},
			{
				name: Questions.name,
				collection: 'questions',
				schema: QuestionsSchema,
			},
			{
				name: Friend.name,
				collection: 'friend',
				schema: FriendSchema,
			},
			{
				name: BlackList.name,
				collection: 'black-list',
				schema: BlackListSchema,
			},
		]),
	],
	exports: [ModelDefinitionModule, MongooseModule],
})
export class ModelDefinitionModule {}
