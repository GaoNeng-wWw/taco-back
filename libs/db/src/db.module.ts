import { Global, Module } from '@nestjs/common';
import { DbService } from './db.service';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@app/config';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

@Global()
@Module({
	providers: [DbService],
	exports: [DbModule],
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule.forRoot('config.toml')],
			inject: [ConfigService],
			useFactory: async (
				service: ConfigService,
			): Promise<MongooseModuleFactoryOptions> => {
				if (process.env.NODE_ENV === 'test') {
					const mongod = await MongoMemoryReplSet.create({
						replSet: {
							count: 2,
						},
					});
					return {
						uri: mongod.getUri(),
					};
				}
				return {
					uri: service.get<string>('global.db.uri'),
				} as MongooseModuleFactoryOptions;
			},
		}),
	],
})
export class DbModule {}
