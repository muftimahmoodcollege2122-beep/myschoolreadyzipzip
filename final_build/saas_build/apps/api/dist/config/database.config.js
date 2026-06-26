"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
    readReplicaUrl: process.env.DATABASE_READ_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
}));
//# sourceMappingURL=database.config.js.map