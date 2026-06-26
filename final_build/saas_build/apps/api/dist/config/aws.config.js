"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('aws', () => ({
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    s3PresignExpiry: parseInt(process.env.AWS_S3_PRESIGN_EXPIRY || '900', 10),
    sesSmtpHost: process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
    sesSmtpUser: process.env.SES_SMTP_USER || '',
    sesSmtpPass: process.env.SES_SMTP_PASS || '',
    kafkaBrokers: process.env.KAFKA_BROKERS || 'localhost:9092',
}));
//# sourceMappingURL=aws.config.js.map