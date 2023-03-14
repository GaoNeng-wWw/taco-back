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
import { DbModule } from '@app/db';
import { Redis } from '@app/redis';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DbModule,
    Redis,
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
