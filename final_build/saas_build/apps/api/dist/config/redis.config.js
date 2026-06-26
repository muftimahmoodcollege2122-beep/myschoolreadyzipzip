"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = void 0;
const config_1 = require("@nestjs/config");
const redisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    clusterMode: process.env.REDIS_CLUSTER_MODE === 'true',
}));
exports.redisConfig = redisConfig;
exports.default = redisConfig;
//# sourceMappingURL=redis.config.js.map