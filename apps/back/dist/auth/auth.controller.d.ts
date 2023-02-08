import { UserLoginDTO, UserRegisterDTO } from 'src/dto/user.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    Login(body: UserLoginDTO): Promise<import("../utils/response").ApiResponseType<Record<string, any>>>;
    register(body: UserRegisterDTO): Promise<import("../utils/response").ApiResponseType<Record<string, any>>>;
}
