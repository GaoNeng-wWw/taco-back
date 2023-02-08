"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    db: {
        redis: [
            {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWD,
                db: process.env.REDIS_DB,
            },
        ],
    },
});
//# sourceMappingURL=config.js.map