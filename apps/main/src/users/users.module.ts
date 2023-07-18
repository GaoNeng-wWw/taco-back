import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DbModule } from '@app/db';
// import { Counter, CounterSchema } from '@app/schemas/counter.schema';
// import { Groups, GroupsSchema } from '@app/schemas/group.schema';
// import { Users, UsersSchema } from '@app/schemas/user.schema';
// import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@app/jwt';
import { ModelDefinitionModule } from '@app/model-definition';

@Module({
	imports: [
		JwtModule,
		DbModule,
		ModelDefinitionModule,
		// MongooseModule.forFeature([
		// 	{
		// 		name: Users.name,
		// 		collection: 'users',
		// 		schema: UsersSchema,
		// 	},
		// 	{
		// 		name: Groups.name,
		// 		collection: 'groups',
		// 		schema: GroupsSchema,
		// 	},
		// 	{
		// 		name: Counter.name,
		// 		collection: 'counter',
		// 		schema: CounterSchema,
		// 	},
		// ]),
	],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
