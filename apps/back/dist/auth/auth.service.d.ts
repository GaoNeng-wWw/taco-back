import { Model } from 'mongoose';
import { UserRegisterDTO } from 'src/dto/user.dto';
import { userModel } from '../schema/user';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private userModel;
    private jwt;
    constructor(userModel: Model<userModel>, jwt: JwtService);
    certificate(body: {
        tid: number;
        password: string;
    }): string;
    getToken(dto: {
        tid: number;
        password: string;
    }): Promise<import("src/utils/response").ApiResponseType<Record<string, any>>>;
    login(body: {
        tid: number;
        password: string;
    }): Promise<import("src/utils/response").ApiResponseType<Record<string, any>>>;
    register(body: UserRegisterDTO): Promise<import("src/utils/response").ApiResponseType<Record<string, any>>>;
}
