import { RedisService } from '@liaoliaots/nestjs-redis';
import { Model } from 'mongoose';
import { tokenPayload } from '../interface/strcutre/token';
import { userModel } from '../schema/user';
export declare class FriendsService {
    private userModel;
    private cache;
    constructor(userModel: Model<userModel>, cache: RedisService);
    friendList(dto: tokenPayload): Promise<import("src/utils/response").ApiResponseType<Record<string, any>>>;
    refuseFriend(dto: {
        target: number;
        source: number;
        reason?: string;
    }): Promise<void>;
    acceptFriend(dto: {
        tid: number;
    }): Promise<import("src/utils/response").ApiResponseType<Record<string, any>>>;
}
