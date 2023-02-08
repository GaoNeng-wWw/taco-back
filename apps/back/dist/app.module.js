"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const friends_module_1 = require("./friends/friends.module");
const constants_1 = require("./auth/constants");
const jwt_streagy_1 = require("./auth/jwt.streagy");
const config_1 = require("@nestjs/config");
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const chat_gateway_1 = require("./gateway/chat.gateway");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: './env/.production.env',
            }),
            mongoose_1.MongooseModule.forRoot(`${process.env.MONGO_PATH}`),
            nestjs_redis_1.RedisModule.forRootAsync({
                useFactory: () => {
                    return {
                        config: [
                            {
                                host: process.env.REDIS_HOST,
                                port: Number(process.env.REDIS_PORT),
                                db: Number(process.env.REDIS_DB),
                                password: process.env.REDIS_PASSWD,
                            },
                            {
                                namespace: 'sub',
                                host: process.env.REDIS_HOST,
                                port: Number(process.env.REDIS_PORT),
                                db: Number(process.env.REDIS_DB),
                                password: process.env.REDIS_PASSWD,
                            },
                            {
                                namespace: 'pub',
                                host: process.env.REDIS_HOST,
                                port: Number(process.env.REDIS_PORT),
                                db: Number(process.env.REDIS_DB),
                                password: process.env.REDIS_PASSWD,
                            },
                        ],
                    };
                },
            }),
            auth_module_1.AuthModule,
            friends_module_1.FriendsModule,
            jwt_1.JwtModule.register(constants_1.jwtConstants),
        ],
        controllers: [app_controller_1.AppController],
        providers: [jwt_streagy_1.JWTStreagy, app_service_1.AppService, chat_gateway_1.ChatGateway],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map