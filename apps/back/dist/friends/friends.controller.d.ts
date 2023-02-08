import { FriendsService } from './friends.service';
export declare class FriendsController {
    private readonly service;
    constructor(service: FriendsService);
    getFirends(req: any): Promise<import("../utils/response").ApiResponseType<Record<string, any>>>;
    accept(req: any, body: {
        tid: number;
    }): Promise<void>;
}
