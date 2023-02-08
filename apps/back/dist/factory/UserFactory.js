"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
class UserFactory {
    create({ nick, password, birthday, phone }) {
        return new User_1.default({
            nick,
            password,
            birthday,
            phone,
        });
    }
}
exports.default = UserFactory;
//# sourceMappingURL=UserFactory.js.map