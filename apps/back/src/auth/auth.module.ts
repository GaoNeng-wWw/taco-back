import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '@common/schema/user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { FriendsSchema } from '@common/schema/friends';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'user',
        schema: UserSchema,
        collection: 'user',
      },
      {
        name: 'friends',
        schema: FriendsSchema,
        collection: 'friends',
      },
    ]),
    PassportModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://guest:guest@localhost:5672',
      enableControllerDiscovery: true,
      exchanges: [
        {
          name: 'system.db',
          createExchangeIfNotExists: true,
        },
      ],
    }),
  ],
  providers: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
