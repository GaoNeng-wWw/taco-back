"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsModule = void 0;
const common_1 = require("@nestjs/common");
const friends_service_1 = require("./friends.service");
const friends_controller_1 = require("./friends.controller");
const mongoose_1 = require("@nestjs/mongoose");
const user_1 = require("../schema/user");
let FriendsModule = class FriendsModule {
};
FriendsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'user',
                    schema: user_1.UserSchema,
                    collection: 'user',
                },
            ]),
        ],
        providers: [friends_service_1.FriendsService],
        controllers: [friends_controller_1.FriendsController],
    })
], FriendsModule);
exports.FriendsModule = FriendsModule;
//# sourceMappingURL=friends.module.js.map