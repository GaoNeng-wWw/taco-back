"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
const node_crypto_1 = require("node:crypto");
function encrypt(message) {
    const hash = (0, node_crypto_1.createHash)('sha256').update(message).digest('hex');
    return hash;
}
exports.encrypt = encrypt;
//# sourceMappingURL=dataProtection.js.map