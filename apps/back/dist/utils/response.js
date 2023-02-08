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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = exports.sponsorKind = exports.chatKind = exports.groupAction = exports.friendAction = exports.userAction = exports.State = exports.Layer = exports.Protocol = void 0;
const swagger_1 = require("@nestjs/swagger");
var Protocol;
(function (Protocol) {
    Protocol["WS"] = "001";
    Protocol["HTTP"] = "002";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
var Layer;
(function (Layer) {
    Layer["USER"] = "01";
    Layer["FRIEND"] = "02";
    Layer["GROUP"] = "03";
    Layer["CHAT"] = "04";
    Layer["SPONSOR"] = "05";
})(Layer = exports.Layer || (exports.Layer = {}));
var State;
(function (State) {
    State["SUCCESS"] = "00";
    State["FAIL"] = "01";
    State["FAIL_TOKEN_EXPIRED"] = "02";
    State["FAIL_SERVER_ERROR"] = "03";
    State["FAIL_BAD_REQUEST"] = "04";
    State["FAIL_NOT_FRIEND"] = "05";
    State["FAIL_NOT_IN_GROUP"] = "06";
})(State = exports.State || (exports.State = {}));
var userAction;
(function (userAction) {
    userAction["LOGIN"] = "01001";
    userAction["REGISTER"] = "01002";
    userAction["LOGINOUT"] = "01003";
    userAction["GET_USER_INFO"] = "01004";
    userAction["UPDATE_USER_INFO"] = "01005";
    userAction["UPDATE_STATE"] = "01006";
    userAction["AUTH"] = "01007";
})(userAction = exports.userAction || (exports.userAction = {}));
var friendAction;
(function (friendAction) {
    friendAction["GET_FRIENDS"] = "02001";
    friendAction["ADD_FRIEND"] = "02002";
    friendAction["REMOVE_FRIEND"] = "02003";
    friendAction["ACCEPT_REQ"] = "02004";
    friendAction["REFUSE_REQ"] = "02005";
})(friendAction = exports.friendAction || (exports.friendAction = {}));
var groupAction;
(function (groupAction) {
    groupAction["GET_GROUP_LIST"] = "03001";
    groupAction["GET_GROUP_INFO"] = "03002";
    groupAction["CREATE_GROUP"] = "03003";
    groupAction["DELETE_GROUP"] = "03004";
    groupAction["AUTH_ROLE"] = "03005";
    groupAction["UPDATE_GROUP_INFO"] = "03006";
    groupAction["JOIN_GROUP"] = "03007";
    groupAction["LEAVE_GROUP"] = "03008";
    groupAction["MANAGE_MEMBER"] = "03009";
})(groupAction = exports.groupAction || (exports.groupAction = {}));
var chatKind;
(function (chatKind) {
    chatKind["P2P"] = "04001";
    chatKind["GROUP"] = "04002";
})(chatKind = exports.chatKind || (exports.chatKind = {}));
var sponsorKind;
(function (sponsorKind) {
    sponsorKind["SUBSCRIPTION_VIP"] = "05001";
    sponsorKind["RENEW_VIP"] = "05002";
})(sponsorKind = exports.sponsorKind || (exports.sponsorKind = {}));
class ApiResponse {
    constructor(protocol, layer, action, message, data) {
        this.state = State.SUCCESS;
        this.code = `${protocol}${layer}${action}`;
        this.message = message !== null && message !== void 0 ? message : ``;
        this.data = data !== null && data !== void 0 ? data : {};
        this.layer = layer;
        this.action = action;
        this.protocol = protocol;
    }
    fail(state) {
        this.state = state !== null && state !== void 0 ? state : State.FAIL;
    }
    getResponse() {
        const message = State[this.state];
        return {
            protocol: this.protocol,
            state: this.state,
            layer: this.layer,
            action: this.action,
            code: this.code,
            message,
            data: this.data,
        };
    }
    updateMessage(message) {
        this.message = message;
    }
    setData(data) {
        this.data = data;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: State,
    }),
    __metadata("design:type", String)
], ApiResponse.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ApiResponse.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApiResponse.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: Layer,
    }),
    __metadata("design:type", String)
], ApiResponse.prototype, "layer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: [userAction, friendAction, groupAction, chatKind],
    }),
    __metadata("design:type", String)
], ApiResponse.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: Protocol,
    }),
    __metadata("design:type", String)
], ApiResponse.prototype, "protocol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ApiResponse.prototype, "data", void 0);
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=response.js.map