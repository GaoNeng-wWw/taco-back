import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer, MongoMemoryReplSet } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';

let mongod: MongoMemoryServer;
let uri: string;
let server: RedisMemoryServer;

export const rootRedisTestModle = async () => {
	server = new RedisMemoryServer({
		instance: {
			ip: '127.0.0.1',
			port: 6379,
		},
	});
	await server.start();
	return {
		host: await server.getIp(),
		port: await server.getPort(),
	};
};

export const rootMongooseTestModule = async (
	options: MongooseModuleOptions = {},
) => {
	const mongod = await MongoMemoryReplSet.create({
		replSet: {
			count: 2,
		},
	});
	uri = mongod.getUri();
	console.log(uri);
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
