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
exports.ChatGateway = void 0;
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ioredis_1 = require("ioredis");
const ws_exception_filter_1 = require("../ws-exception.filter");
const TokenAuthGurade_1 = require("./gurade/TokenAuthGurade");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(redis, pub, sub, jwt) {
        this.redis = redis;
        this.pub = pub;
        this.sub = sub;
        this.jwt = jwt;
        this.socket_cache = new Map();
        this.service = new chat_service_1.ChatService(this.redis, this.pub, this.sub, this.jwt);
        this.sub.subscribe('group-channel', 'p2p-channel', 'system-channel', 'urgent');
        this.sub.on('message', (channel, res) => {
            console.log('emit');
            console.log(channel, res);
        });
    }
    async handleMessage(client, payload) {
        await this.service.p2p(client, payload);
        return;
    }
    async handleConnection(client) {
        await this.service.connect(client);
    }
    handleDisconnect(client) {
        var _a, _b;
        const { handshake } = client;
        const tid = (_a = handshake.auth.tid) !== null && _a !== void 0 ? _a : handshake.query.tid;
        const token = (_b = handshake.auth.token) !== null && _b !== void 0 ? _b : handshake.query.token;
        this.socket_cache.delete(tid);
        this.redis.del(`token:${token}`);
        this.redis.del(`tid:${tid}`);
        client.disconnect(true);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('p2p'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, common_1.UseGuards)(TokenAuthGurade_1.TokenAuthGurade),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleDisconnect", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(3001, {
        cors: {
            allowedHeaders: '*',
        },
    }),
    (0, common_1.UseGuards)(TokenAuthGurade_1.TokenAuthGurade),
    (0, common_1.UseFilters)(ws_exception_filter_1.WsExceptionFilter),
    __param(0, (0, nestjs_redis_1.InjectRedis)()),
    __param(1, (0, nestjs_redis_1.InjectRedis)('pub')),
    __param(2, (0, nestjs_redis_1.InjectRedis)('sub')),
    __metadata("design:paramtypes", [ioredis_1.default,
        ioredis_1.default,
        ioredis_1.default,
        jwt_1.JwtService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map