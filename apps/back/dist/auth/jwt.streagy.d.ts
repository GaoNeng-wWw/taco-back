import { Strategy } from 'passport-jwt';
import { UserInfo } from '../interface/Model/user';
declare const JWTStreagy_base: new (...args: any[]) => Strategy;
export declare class JWTStreagy extends JWTStreagy_base {
    constructor();
    validate(payload: UserInfo): UserInfo;
}
export {};
