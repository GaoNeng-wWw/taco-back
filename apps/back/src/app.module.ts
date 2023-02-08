import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { jwtConstants } from './auth/constants';
import { JWTStreagy } from './auth/jwt.streagy';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ChatGateway } from './gateway/chat.gateway';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './env/.dev.env',
    }),
    MongooseModule.forRoot(`${process.env.MONGO_PATH}`),
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
  ],
  controllers: [AppController],
  providers: [JWTStreagy, AppService, ChatGateway],
})
export class AppModule {}
console.log(process.env.MONGO_PATH);
