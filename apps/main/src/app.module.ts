import {
	Logger,
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { DbModule } from '@app/db';
// import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ModelDefinitionModule } from '@app/model-definition';
import { AccountModule } from './account/account.module';
import { ConfigModule, ConfigService } from '@app/config';
import { NoticeModule } from './notice/notice.module';
import { TokenValidityCheckMiddleware } from '@app/middleware';
import { RequestModule } from './request/request.module';
import { FriendsModule } from './friends/friends.module';
import { JwtModule } from '@app/jwt';
import { CacheModule } from '@app/cache';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { BlackListModule } from './black-list/black-list.module';
@Module({
	imports: [
		ConfigModule.forRoot('config.toml'),
		RabbitMQModule.forRootAsync(RabbitMQModule, {
			imports: [ConfigModule.forRoot('config.toml')],
			inject: [ConfigService],
			useFactory: (service: ConfigService) => ({
				uri: service.get('global.rabbitmq.uri'),
				connectionInitOptions: {
					wait: true,
				},
			}),
		}),
		DbModule,
		ModelDefinitionModule,
		JwtModule,
		CacheModule,
		UsersModule,
		AccountModule,
		NoticeModule,
		RequestModule,
		FriendsModule,
		BlackListModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	constructor() {
		this.setup();
	}
	configure(consumer: MiddlewareConsumer) {
		console.log('success');
		// consumer.apply(TokenValidityCheckMiddleware).forRoutes({
		// 	method: RequestMethod.ALL,
		// 	path: '/account/[^password]',
		// });
		// throw new Error('Method not implemented.');
	}
	async setup() {
		Logger.log('Init User Model Success', 'AppModule');
	}
}
