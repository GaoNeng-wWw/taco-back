import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwt: JwtService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const token = req.headers.authorization.replace('Bearer ', '');
		if (!token) {
			return false;
		}
		try {
			await this.jwt.verify(token);
			Reflect.set(
				context.switchToHttp().getRequest(),
				'user',
				await this.jwt.decode(token),
			);
			return true;
		} catch (e) {
			return false;
		}
	}
}
