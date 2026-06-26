"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    appVersion: process.env.APP_VERSION || '1.0.0',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    rateLimitShort: parseInt(process.env.RATE_LIMIT_SHORT || '20', 10),
    rateLimitMedium: parseInt(process.env.RATE_LIMIT_MEDIUM || '100', 10),
    rateLimitLong: parseInt(process.env.RATE_LIMIT_LONG || '500', 10),
}));
//# sourceMappingURL=app.config.js.map