import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
export const Token = createParamDecorator(
  (
    data: { raw: boolean; field: string } = { raw: false, field: 'Bearer' },
    ctx: ExecutionContext,
  ) => {
    const http = ctx.switchToHttp();
    const req: Request = http.getRequest();
    const token = req.get('Authorization');
    if (data.raw) {
      return token;
    } else {
      return token.substring(data.field.length).trim();
    }
  },
);
