"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAuthGurade = void 0;
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const ioredis_1 = require("ioredis");
const response_1 = require("../../utils/response");
let TokenAuthGurade = class TokenAuthGurade {
    constructor(redis, jwt) {
        this.redis = redis;
        this.jwt = jwt;
    }
    canActivate(context) {
        var _a, _b, _c, _d, _e, _f;
        const ctx = context.switchToWs();
        const client = ctx.getClient();
        const handshake = context.getArgs()[0].handshake;
        const token = (_e = (_d = (_c = (_b = (_a = handshake.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.split) === null || _c === void 0 ? void 0 : _c.call(_b, '')) !== null && _d !== void 0 ? _d : handshake.query.token) !== null && _e !== void 0 ? _e : handshake.auth.token;
        const tid = (_f = handshake.auth.tid) !== null && _f !== void 0 ? _f : handshake.query.tid;
        const res = new response_1.ApiResponse(response_1.Protocol.WS, response_1.Layer.USER, response_1.userAction.AUTH);
        if (!token) {
            res.fail(response_1.State.FAIL_BAD_REQUEST);
        }
        try {
            const verifyInfo = this.jwt.verify(token);
            if (verifyInfo.tid === Number(tid)) {
                client.emit('system', res.getResponse());
                return true;
            }
            throw new Error('Token Error');
        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.fail(response_1.State.FAIL_TOKEN_EXPIRED);
            }
            if (e.name === 'JsonWebTokenError') {
                res.fail(response_1.State.FAIL_BAD_REQUEST);
            }
            if (e.message === 'Token Error') {
                res.fail(response_1.State.FAIL_BAD_REQUEST);
            }
            throw new websockets_1.WsException(res.getResponse());
        }
    }
};
TokenAuthGurade = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_redis_1.InjectRedis)()),
    __metadata("design:paramtypes", [ioredis_1.default,
        jwt_1.JwtService])
], TokenAuthGurade);
exports.TokenAuthGurade = TokenAuthGurade;
//# sourceMappingURL=TokenAuthGurade.js.map