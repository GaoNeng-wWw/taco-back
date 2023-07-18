import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer, MongoMemoryReplSet } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;
let uri: string;

export const rootMongooseTestModule = async (
	options: MongooseModuleOptions = {},
) => {
	const mongod = await MongoMemoryReplSet.create({
		replSet: {
			count: 2,
		},
	});
	uri = mongod.getUri();
	return MongooseModule.forRootAsync({
		useFactory: async () => {
			return {
				uri,
				...options,
				// useUnifiedTopology: true,
			};
		},
	});
};

export const closeInMongodConnection = async () => {
	if (mongod) await mongod.stop();
};

export const getMemoryMongodUri = () => uri;
