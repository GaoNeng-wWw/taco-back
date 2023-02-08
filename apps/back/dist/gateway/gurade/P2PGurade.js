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
exports.P2PAuthGurade = void 0;
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const ioredis_1 = require("ioredis");
const response_1 = require("../../utils/response");
let P2PAuthGurade = class P2PAuthGurade {
    constructor(redis) {
        this.redis = redis;
    }
    async canActivate(context) {
        const ctx = context.switchToWs();
        const data = ctx.getData();
        const res = new response_1.ApiResponse(response_1.Protocol.WS, response_1.Layer.CHAT, response_1.chatKind.P2P);
        const { sender, reciver } = data;
        const hasFriend = await this.redis.sismember(String(sender), reciver);
        if (hasFriend) {
            return true;
        }
        res.fail(response_1.State.FAIL_NOT_FRIEND);
        throw new websockets_1.WsException(res.getResponse());
    }
};
P2PAuthGurade = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_redis_1.InjectRedis)()),
    __metadata("design:paramtypes", [ioredis_1.default])
], P2PAuthGurade);
exports.P2PAuthGurade = P2PAuthGurade;
//# sourceMappingURL=P2PGurade.js.map