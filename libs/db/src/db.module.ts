import { Global, Module } from '@nestjs/common';
import { DbService } from './db.service';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@app/config';

@Global()
@Module({
	providers: [DbService],
	exports: [DbModule],
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule.forRoot('config.toml')],
			inject: [ConfigService],
			useFactory: (
				service: ConfigService,
			): MongooseModuleFactoryOptions => {
				return {
					uri: service.get<string>('global.db.uri'),
				} as MongooseModuleFactoryOptions;
			},
		}),
	],
})
export class DbModule {}
