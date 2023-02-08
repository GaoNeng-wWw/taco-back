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
exports.ChatService = void 0;
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const ioredis_1 = require("ioredis");
const response_1 = require("../utils/response");
let ChatService = class ChatService {
    constructor(redis, pub, sub, jwt) {
        this.redis = redis;
        this.pub = pub;
        this.sub = sub;
        this.jwt = jwt;
        this.socket_cache = new Map();
    }
    async p2p(client, payload) {
        var _a;
        const { sender, reciver } = payload;
        const token = (_a = client.handshake.auth.token) !== null && _a !== void 0 ? _a : client.handshake.query.token;
        const cacheTid = Number(await this.redis.get(`token:${token}`));
        const res = new response_1.ApiResponse(response_1.Protocol.WS, response_1.Layer.CHAT, response_1.chatKind.P2P);
        const reciverToken = await this.redis.get(`tid:${reciver}`);
        if (cacheTid !== sender) {
            res.fail(response_1.State.FAIL_BAD_REQUEST);
            res.updateMessage('TOKEN_INVALID');
            throw new websockets_1.WsException(res.getResponse());
        }
        res.setData(payload);
        const socket = this.socket_cache.get(String(reciver));
        if (socket === null || socket === void 0 ? void 0 : socket.instance) {
            socket.instance.emit('p2p', res.getResponse());
        }
        else {
            this.redis.rpush(`history:${reciver}`, JSON.stringify(payload));
        }
        if (cacheTid === sender) {
            client.emit('p2p', res.getResponse());
        }
        else {
            this.pub.publish('p2p-channel', JSON.stringify(payload));
        }
    }
    async connect(client) {
        var _a, _b, _c, _d;
        const { handshake: { auth }, } = client;
        const res = new response_1.ApiResponse(response_1.Protocol.WS, response_1.Layer.USER, response_1.userAction.LOGIN);
        const token = (_b = (_a = auth.token) !== null && _a !== void 0 ? _a : client.handshake.query.token) !== null && _b !== void 0 ? _b : '';
        const tid = (_d = (_c = auth.tid) !== null && _c !== void 0 ? _c : client.handshake.query.tid) !== null && _d !== void 0 ? _d : '';
        if (!token || !tid) {
            const state = !token ? response_1.State.FAIL_BAD_REQUEST : response_1.State.FAIL_BAD_REQUEST;
            res.fail(state);
            client.emit('system', res.getResponse());
            client.disconnect(true);
        }
        const tokenVerifyInfo = await this.jwt.verifyAsync(token);
        if (tokenVerifyInfo.tid !== Number(tid)) {
            res.fail(response_1.State.FAIL);
            client.emit('system', res.getResponse());
            client.disconnect(true);
        }
        this.socket_cache.set(tid, { instance: client, token });
        const nearHistory = await this.redis.lrange(`history:${tid}`, 0, await this.redis.llen(`history:${tid}`));
        this.redis.set(`token:${token}`, tid);
        this.redis.set(`tid:${tid}`, token);
        res.setData({ nearHistory });
        res.getResponse();
        for (let i = 0; i < nearHistory.length; i++) {
            client.emit('p2p', nearHistory[i]);
        }
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_redis_1.InjectRedis)()),
    __param(1, (0, nestjs_redis_1.InjectRedis)('pub')),
    __param(2, (0, nestjs_redis_1.InjectRedis)('sub')),
    __metadata("design:paramtypes", [ioredis_1.default,
        ioredis_1.default,
        ioredis_1.default,
        jwt_1.JwtService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map