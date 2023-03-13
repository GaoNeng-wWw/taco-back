import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

@Module({
  exports: [
    MongooseModule.forRootAsync({
      useFactory: (): MongooseModuleFactoryOptions => {
        return {
          uri: `${process.env.MONGO_PATH}`,
        } as MongooseModuleFactoryOptions;
      },
    }),
  ],
})
export class DbModule {}
