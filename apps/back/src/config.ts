import { ConfigStructre } from './interface/config.interface';

export default () =>
  ({
    db: {
      redis: [
        {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWD,
          db: process.env.REDIS_DB,
        },
      ],
    },
  } as unknown as ConfigStructre);
