"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    gid: {
        type: String,
        required: [true, 'gid can not be empty'],
    },
    group_avatar: {
        type: String,
    },
    members: {
        type: Array,
        default: [],
    },
    managers: {
        type: Array,
        default: [],
    },
});
//# sourceMappingURL=group.js.map