import { Socket, Server } from 'socket.io';
import { p2pMessageStructure } from '../interface/strcutre/p2p';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
export declare class ChatGateway {
    private readonly redis;
    private readonly pub;
    private readonly sub;
    private jwt;
    server: Server;
    private socket_cache;
    private service;
    constructor(redis: Redis, pub: Redis, sub: Redis, jwt: JwtService);
    handleMessage(client: Socket, payload: p2pMessageStructure): Promise<void>;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
}
