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
exports.FriendsService = void 0;
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const response_1 = require("../utils/response");
let FriendsService = class FriendsService {
    constructor(userModel, cache) {
        this.userModel = userModel;
        this.cache = cache;
    }
    async friendList(dto) {
        const { tid } = dto;
        const res = new response_1.ApiResponse(response_1.Protocol.HTTP, response_1.Layer.FRIEND, response_1.friendAction.GET_FRIENDS);
        return this.userModel
            .find({
            tid,
        }, 'friends -_id')
            .lean()
            .exec()
            .then((friends) => {
            var _a;
            res.setData((_a = friends[0]) !== null && _a !== void 0 ? _a : []);
            return res.getResponse();
        })
            .catch(() => {
            res.fail();
            return res.getResponse();
        });
    }
    async refuseFriend(dto) {
        const friendCache = this.cache.getClient('friend');
        const { target, source, reason } = dto;
        const refuseFriendRequest = JSON.stringify({
            type: 'friend-refuse',
            tid: source,
            reason,
        });
        friendCache.sadd(target.toString(), refuseFriendRequest);
    }
    async acceptFriend(dto) {
        const friendCache = this.cache.getClient('friend');
        const response = new response_1.ApiResponse(response_1.Protocol.HTTP, response_1.Layer.FRIEND, response_1.friendAction.ACCEPT_REQ);
        return this.userModel
            .findOne({
            tid: dto.tid,
        })
            .exec()
            .then((ref) => {
            const { _id } = ref;
            ref.friends = undefined;
            ref.password = undefined;
            return this.userModel
                .updateOne({
                tid: dto.tid,
            }, {
                $push: {
                    friends: _id,
                },
            })
                .exec()
                .then(async () => {
                await friendCache.srem(dto.tid.toString(), _id);
                return response.getResponse();
            })
                .catch(() => {
                response.fail();
                return response.getResponse();
            });
        })
            .catch(() => {
            response.fail(response_1.State.FAIL_BAD_REQUEST);
            return response.getResponse();
        });
    }
};
FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('user')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        nestjs_redis_1.RedisService])
], FriendsService);
exports.FriendsService = FriendsService;
//# sourceMappingURL=friends.service.js.map