import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  exports: [
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
  ],
})
export class Redis {}
