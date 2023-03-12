import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { jwtConstants } from '../../../server-common/constants';
import { JWTStreagy } from './auth/jwt.streagy';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ClientsModule, Transport } from '@nestjs/microservices';
import configuration from '@common/config';
import { TokenValidityCheckMiddleware } from './middleware/token-validity-check.middleware';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (): MongooseModuleFactoryOptions => {
        return {
          uri: `${process.env.MONGO_PATH}`,
        } as MongooseModuleFactoryOptions;
      },
    }),
    RedisModule.forRootAsync({
      useFactory: () => {
        return {
          config: [
            {
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              db: Number(process.env.REDIS_DB),
              password: process.env.REDIS_PASSWD,
            },
            {
              namespace: 'sub',
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              db: Number(process.env.REDIS_DB),
              password: process.env.REDIS_PASSWD,
            },
            {
              namespace: 'pub',
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              db: Number(process.env.REDIS_DB),
              password: process.env.REDIS_PASSWD,
            },
          ],
        };
      },
    }),
    AuthModule,
    FriendsModule,
    JwtModule.register(jwtConstants),
    ClientsModule.register([
      {
        name: 'Pusher',
        transport: Transport.TCP,
      },
    ]),
  ],
  controllers: [],
  providers: [JWTStreagy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenValidityCheckMiddleware)
      .exclude({ path: 'auth', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
