import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '@common/schema/user';
import { FriendsSchema } from '@common/schema/friends';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { FriendsConsumerService } from './consumer/friends.consumer.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://guest:guest@localhost:5672',
      enableControllerDiscovery: true,
    }),
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
    ClientsModule.register([
      {
        name: 'Pusher',
        transport: Transport.TCP,
      },
    ]),
  ],
  providers: [FriendsService, JwtService, FriendsConsumerService],
  controllers: [FriendsController],
})
export class FriendsModule {}
