import { jwtConstants } from '@common/constants';
import { RequestPayload } from '@common/interface/request.interface';
import { tokenPayload } from '@common/interface/strcutre/token';
import { User, userModel } from '@common/schema/user';
import {
  ApiResponse,
  guardAction,
  Layer,
  Protocol,
  State,
} from '@common/utils/response';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import Redis from 'ioredis';
import { isEmpty } from 'lodash';
import { Model, Document, ObjectId } from 'mongoose';
import { CommonRequestActionDto } from '../friends/dto/common-request-action.dto';

@Injectable()
export class HasRequest implements CanActivate {
  constructor(
    private jwt: JwtService,
    @InjectRedis() private redis: Redis,
    @InjectModel('user') private user: Model<userModel>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.getArgByIndex(0);
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = req.headers.authorization.split(' ')?.[1];
    const vertifyInfo: tokenPayload = this.jwt.verify(token, jwtConstants);
    const payload: CommonRequestActionDto = body;
    const res = new ApiResponse(
      Protocol.HTTP,
      Layer.GUARD,
      guardAction.REQUEST_CHECK,
    );
    const request:
      | string
      | RequestPayload<any>
      | null
      | (User & Document<any, any, any> & { _id: ObjectId })[] =
      await this.redis.hget(`request:${vertifyInfo.tid}`, payload.rid);
    console.log(vertifyInfo, request);
    if (isEmpty(request)) {
      const profile =
        (await this.user.findOne(
          {
            tid: vertifyInfo.tid,
            request: payload.rid,
          },
          {
            request: 1,
          },
        )) ?? null;
      if (isEmpty(profile)) {
        res.fail(State.FAIL_NOT_REQUEST);
        throw new HttpException(res.getResponse(), 422);
      }
    }
    return true;
  }
}
