import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { Socket } from 'socket.io';
import { p2pMessageStructure } from 'src/interface/strcutre/p2p';
export declare class ChatService {
    private readonly redis;
    private readonly pub;
    private readonly sub;
    private jwt;
    private socket_cache;
    constructor(redis: Redis, pub: Redis, sub: Redis, jwt: JwtService);
    p2p(client: Socket, payload: p2pMessageStructure): Promise<void>;
    connect(client: Socket): Promise<void>;
}
