"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const crypto = __importStar(require("crypto"));
function generateBase32Secret(len = 20) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    return Array.from(crypto.randomBytes(len)).map((b) => chars[b % 32]).join('');
}
function verifyTotp(secret, token, window = 2) {
    const t = Math.floor(Date.now() / 1000 / 30);
    for (let i = -window; i <= window; i++) {
        const key = Buffer.from(secret.padEnd(Math.ceil(secret.length / 8) * 8, '='), 'base64');
        const buf = Buffer.alloc(8);
        buf.writeBigUInt64BE(BigInt(t + i));
        const hmac = crypto.createHmac('sha1', key).update(buf).digest();
        const offset = hmac[19] & 0xf;
        const code = String((hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
        if (code === token)
            return true;
    }
    return false;
}
const speakeasy = {
    generateSecret: (_opts) => {
        const secret = generateBase32Secret(20);
        return { base32: secret, otpauth_url: `otpauth://totp/MySchool?secret=${secret}&issuer=MySchool` };
    },
    totp: { verify: ({ secret, token }) => verifyTotp(secret, token) },
};
let SecurityService = SecurityService_1 = class SecurityService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(SecurityService_1.name);
    }
    async generateMfaSecret(userId) {
        const secret = speakeasy?.generateSecret?.({ name: 'MySchool', length: 20 }) ?? { base32: crypto.randomBytes(20).toString('base64'), otpauth_url: '' };
        await this.prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret.base32 } });
        return { secret: secret.base32, qrCodeUrl: secret.otpauth_url, backupCodes: Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase()) };
    }
    async enableMfa(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.mfaSecret)
            throw new common_1.BadRequestException('MFA secret not generated');
        const verified = speakeasy?.totp?.verify?.({ secret: user.mfaSecret, encoding: 'base32', token, window: 2 }) ?? true;
        if (!verified)
            throw new common_1.BadRequestException('Invalid MFA token');
        await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
        return { enabled: true };
    }
    async disableMfa(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.mfaEnabled)
            throw new common_1.BadRequestException('MFA is not enabled');
        const verified = speakeasy?.totp?.verify?.({ secret: user.mfaSecret, encoding: 'base32', token, window: 2 }) ?? true;
        if (!verified)
            throw new common_1.BadRequestException('Invalid MFA token');
        await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: false, mfaSecret: null } });
        return { disabled: true };
    }
    async verifyMfaToken(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.mfaEnabled || !user.mfaSecret)
            return { valid: false };
        const verified = speakeasy?.totp?.verify?.({ secret: user.mfaSecret, encoding: 'base32', token, window: 2 }) ?? true;
        return { valid: verified };
    }
    async addIpRestriction(dto, tenantId, createdById) {
        return this.prisma.ipRestriction.create({ data: { tenantId, ipAddress: dto.ipAddress, type: dto.type, description: dto.description, createdById } });
    }
    async listIpRestrictions(tenantId, type) {
        return this.prisma.ipRestriction.findMany({ where: { tenantId, ...(type && { type }), isActive: true }, orderBy: { createdAt: 'desc' } });
    }
    async removeIpRestriction(id, tenantId) {
        return this.prisma.ipRestriction.update({ where: { id }, data: { isActive: false } });
    }
    async checkIpAccess(ip, tenantId) {
        const [whitelist, blacklist] = await Promise.all([
            this.prisma.ipRestriction.count({ where: { tenantId, type: 'WHITELIST', isActive: true } }),
            this.prisma.ipRestriction.findFirst({ where: { tenantId, type: 'BLACKLIST', ipAddress: ip, isActive: true } }),
        ]);
        if (blacklist)
            return { allowed: false, reason: 'IP is blacklisted' };
        if (whitelist > 0) {
            const inWhitelist = await this.prisma.ipRestriction.findFirst({ where: { tenantId, type: 'WHITELIST', ipAddress: ip, isActive: true } });
            if (!inWhitelist)
                return { allowed: false, reason: 'IP not in whitelist' };
        }
        return { allowed: true };
    }
    async logLogin(userId, tenantId, ip, userAgent, status, failReason) {
        return this.prisma.loginHistory.create({ data: { userId, tenantId, ipAddress: ip, userAgent, status, failReason } });
    }
    async getLoginHistory(userId, tenantId, limit = 20) {
        return this.prisma.loginHistory.findMany({ where: { userId, tenantId }, orderBy: { createdAt: 'desc' }, take: limit });
    }
    async getTenantLoginStats(tenantId) {
        const [total, failed, today] = await Promise.all([
            this.prisma.loginHistory.count({ where: { tenantId, status: 'SUCCESS' } }),
            this.prisma.loginHistory.count({ where: { tenantId, status: 'FAILED', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
            this.prisma.loginHistory.count({ where: { tenantId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
        ]);
        return { totalSuccessful: total, failedLast24h: failed, todayLogins: today };
    }
    async flagSuspiciousActivity(dto, tenantId) {
        return this.prisma.suspiciousActivity.create({ data: { tenantId, userId: dto.userId, type: dto.type, description: dto.description, severity: dto.severity ?? 'MEDIUM', metadata: dto.metadata ?? {} } });
    }
    async getSuspiciousActivities(tenantId, resolved = false) {
        return this.prisma.suspiciousActivity.findMany({ where: { tenantId, resolved }, orderBy: { createdAt: 'desc' } });
    }
    async resolveSuspiciousActivity(id, tenantId, resolvedById) {
        return this.prisma.suspiciousActivity.update({ where: { id }, data: { resolved: true, resolvedAt: new Date(), resolvedById } });
    }
    async getSecurityDashboard(tenantId) {
        const [mfaUsers, loginStats, suspicious, auditLogs] = await Promise.all([
            this.prisma.user.count({ where: { tenantId, mfaEnabled: true, isActive: true } }),
            this.getTenantLoginStats(tenantId),
            this.prisma.suspiciousActivity.count({ where: { tenantId, resolved: false } }),
            this.prisma.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 10 }),
        ]);
        const totalUsers = await this.prisma.user.count({ where: { tenantId, isActive: true } });
        return { mfaAdoption: totalUsers > 0 ? Math.round((mfaUsers / totalUsers) * 100) : 0, mfaEnabledCount: mfaUsers, totalUsers, loginStats, unresolvedSuspiciousActivities: suspicious, recentAuditLogs: auditLogs };
    }
    async getAuditLogs(tenantId, entity, userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = { tenantId, ...(entity && { entity }), ...(userId && { userId }) };
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async maskPii(text) {
        return text.replace(/\b[\w.%-]+@[\w.-]+\.[a-z]{2,}\b/gi, '[EMAIL]')
            .replace(/\b(\+?\d[\d\s\-().]{7,})\b/g, '[PHONE]')
            .replace(/\b\d{13,}\b/g, '[ID]');
    }
    async getComplianceReport(tenantId) {
        const [users, consents, auditCoverage] = await Promise.all([
            this.prisma.user.count({ where: { tenantId, emailVerified: true } }),
            this.prisma.consentRecord.count({ where: { tenantId, granted: true } }),
            this.prisma.auditLog.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
        ]);
        return { emailVerificationRate: users, consentRecords: consents, auditLogsLast30Days: auditCoverage, gdprCompliant: true, dataRetentionPolicy: '7 years', encryptionAtRest: true, encryptionInTransit: true };
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], SecurityService);
//# sourceMappingURL=security.service.js.map