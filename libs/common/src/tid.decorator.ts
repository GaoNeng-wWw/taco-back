import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Tid = createParamDecorator((data: null, ctx: ExecutionContext) => {
	const http = ctx.switchToHttp();
	const req = http.getRequest<Request & { user: { tid: string } }>();
	const user = req.user;
	return user.tid;
});
