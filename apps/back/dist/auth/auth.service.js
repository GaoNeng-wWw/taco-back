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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dataProtection_1 = require("../utils/dataProtection");
const lodash_1 = require("lodash");
const response_1 = require("../utils/response");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("./constants");
let AuthService = class AuthService {
    constructor(userModel, jwt) {
        this.userModel = userModel;
        this.jwt = jwt;
    }
    certificate(body) {
        return this.jwt.sign(body, constants_1.jwtConstants);
    }
    getToken(dto) {
        const { tid, password } = dto;
        const beforeCryptoPassword = (0, dataProtection_1.encrypt)(password);
        const res = new response_1.ApiResponse(response_1.Protocol.HTTP, response_1.Layer.USER, response_1.userAction.LOGIN);
        return this.userModel
            .find({
            tid,
            password: beforeCryptoPassword,
        })
            .exec()
            .then(() => {
            const token = this.certificate(dto);
            res.setData({ token });
            return res.getResponse();
        })
            .catch((reason) => {
            console.log(reason);
            res.fail(response_1.State.FAIL_BAD_REQUEST);
            return res.getResponse();
        });
    }
    async login(body) {
        return await this.getToken(body);
    }
    async register(body) {
        var _a, _b, _c;
        const { nick, password, phone } = body;
        const beforeCryptoPassword = (0, dataProtection_1.encrypt)(password);
        const res = new response_1.ApiResponse(response_1.Protocol.HTTP, response_1.Layer.USER, response_1.userAction.REGISTER);
        const currentTimeStamp = new Date().getTime();
        const hasSamePhone = !(0, lodash_1.isEmpty)(await this.userModel.findOne({ phone }).lean().exec());
        if (hasSamePhone) {
            res.fail(response_1.State.FAIL_BAD_REQUEST);
            return res.getResponse();
        }
        const cursor = await this.userModel
            .find()
            .sort({ _id: -1 })
            .limit(1)
            .lean()
            .exec();
        const tid = (_b = (_a = cursor === null || cursor === void 0 ? void 0 : cursor[0]) === null || _a === void 0 ? void 0 : _a.tid) !== null && _b !== void 0 ? _b : 1000;
        const user = new this.userModel({
            nick,
            password: beforeCryptoPassword,
            birthday: body.birthday,
            description: '',
            friends: [],
            join_date: currentTimeStamp,
            tid: (_c = tid + 1) !== null && _c !== void 0 ? _c : '1000',
            phone: body.phone,
        });
        return user
            .save()
            .then((val) => {
            val['_id'] = undefined;
            val['__v'] = undefined;
            res.setData(val);
            return res.getResponse();
        })
            .catch(() => {
            res.fail(response_1.State.FAIL_BAD_REQUEST);
            return res.getResponse();
        });
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('user')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map