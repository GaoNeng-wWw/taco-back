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
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): MongooseModuleFactoryOptions => {
        const { host, port, db, auth_db, user, password } = configService.get<{
          host: string;
          port: number;
          db: string;
          auth_db: string;
          user: string;
          password: string;
        }>('db');
        console.log(
          `mongodb://${user}:${password}@${host}:${port}/${db}${auth_db}`,
        );
        return {
          uri: `mongodb://${user}:${password}@${host}:${port}/${db}${auth_db}`,
        } as MongooseModuleFactoryOptions;
      },
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          config: [
            {
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              db: configService.get('redis.db'),
              password: configService.get('redis.password'),
            },
            {
              namespace: 'sub',
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              db: configService.get('redis.db'),
              password: configService.get('redis.password'),
            },
            {
              namespace: 'pub',
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              db: configService.get('redis.db'),
              password: configService.get('redis.password'),
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
