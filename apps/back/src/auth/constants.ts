import { JwtSignOptions } from '@nestjs/jwt';

export const jwtConstants = {
  secret: 'xBuYxme6eYaAi7ayBB8R',
  issuer: 'Taco-issuer',
  expiresIn: '1y',
} as JwtSignOptions;
