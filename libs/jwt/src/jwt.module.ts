import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  exports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        issuer: process.env.JWT_ISSUER,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
  ],
})
export class JWTModule {}
