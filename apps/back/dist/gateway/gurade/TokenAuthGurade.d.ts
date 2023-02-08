import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
export declare class TokenAuthGurade implements CanActivate {
    private readonly redis;
    private readonly jwt?;
    constructor(redis: Redis, jwt?: JwtService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
