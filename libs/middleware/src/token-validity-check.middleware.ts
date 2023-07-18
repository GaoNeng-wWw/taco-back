import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
	HttpException,
	HttpStatus,
	Injectable,
	NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@app/jwt';
import { Request } from 'express';
import { Redis } from 'ioredis';
import { ServiceError, serviceErrorEnum } from '@app/errors';

@Injectable()
export class TokenValidityCheckMiddleware implements NestMiddleware {
	constructor(
		@InjectRedis() private readonly redis: Redis,
		private jwt: JwtService,
	) {}
	async use(req: Request, res: any, next: () => void) {
		const token = req.headers.authorization.split(' ')[1];
		const isExists = await this.redis.hexists(`token:white-list`, token);
		if (!isExists) {
			throw new ServiceError(
				serviceErrorEnum.FAIL_TOKEN_INVALIDATE,
				HttpStatus.FORBIDDEN,
			);
		}
		const decode = this.jwt.decode<{ tid: string }>(token);
		Reflect.set(req, 'user', decode);
		next();
	}
}
