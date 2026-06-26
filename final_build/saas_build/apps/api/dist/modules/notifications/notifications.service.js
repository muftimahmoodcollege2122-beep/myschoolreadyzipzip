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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../database/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
const prisma_enums_1 = require("../../common/prisma-enums");
;
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, config, notifQueue) {
        this.prisma = prisma;
        this.config = config;
        this.notifQueue = notifQueue;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.emailTransport = null;
        const sesUser = config.get('SES_SMTP_USER');
        if (sesUser) {
            this.emailTransport = nodemailer.createTransport({
                host: config.get('SES_SMTP_HOST', 'email-smtp.us-east-1.amazonaws.com'),
                port: 587,
                secure: false,
                auth: { user: sesUser, pass: config.get('SES_SMTP_PASS') },
            });
        }
    }
    async send(dto) {
        const notif = await this.prisma.notification.create({
            data: {
                tenantId: dto.tenantId,
                userId: dto.userId,
                channel: dto.channel,
                status: prisma_enums_1.NotificationStatus.PENDING,
                title: dto.title,
                body: dto.body,
                data: dto.data || {},
            },
        });
        await this.notifQueue.add('send', { notificationId: notif.id, ...dto }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
        });
        return notif.id;
    }
    async sendInApp(userId, tenantId, title, body, data) {
        await this.prisma.notification.create({
            data: {
                tenantId,
                userId,
                channel: prisma_enums_1.NotificationChannel.IN_APP,
                status: prisma_enums_1.NotificationStatus.SENT,
                title,
                body,
                data: data || {},
                sentAt: new Date(),
            },
        });
        this.logger.debug(`In-app notification saved for user ${userId}`);
    }
    async sendBulk(dto) {
        const jobs = dto.userIds.flatMap((userId) => dto.channels.map((channel) => ({
            name: 'send',
            data: {
                tenantId: dto.tenantId,
                userId,
                channel,
                title: dto.title,
                body: dto.body,
                data: dto.data,
            },
            opts: { attempts: 3 },
        })));
        await this.notifQueue.addBulk(jobs);
    }
    async queueSms(phone, tenantId, message) {
        if (!phone)
            return;
        await this.notifQueue.add('send_sms', { phone, message, tenantId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
    }
    async getForUser(userId, tenantId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId, tenantId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId, tenantId } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async markRead(id, tenantId) {
        await this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
    }
    async getUserNotifications(userId, tenantId, limit = 20) {
        return this.prisma.notification.findMany({
            where: { userId, tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async markAsRead(id, userId, tenantId) {
        return this.prisma.notification.updateMany({
            where: { id, userId, tenantId },
            data: { readAt: new Date() },
        });
    }
    async markAllAsRead(userId, tenantId) {
        return this.prisma.notification.updateMany({
            where: { userId, tenantId, readAt: null },
            data: { readAt: new Date() },
        });
    }
    async broadcastAnnouncement(schoolId, title, body, channels, tenantId) {
        await this.prisma.outboxEvent.create({
            data: {
                tenantId,
                topic: 'announcement.broadcast',
                key: schoolId,
                payload: { schoolId, title, body, channels },
                headers: {},
            },
        });
    }
    async broadcastToAudience(tenantId, schoolId, title, body, channels, audience) {
        let userIds = [];
        if (audience === 'ALL_STUDENTS' || audience === 'ENTIRE_SCHOOL') {
            const students = await this.prisma.student.findMany({
                where: { tenantId, isActive: true },
                select: { userId: true },
            });
            userIds.push(...students.map((s) => s.userId));
        }
        if (audience === 'ALL_TEACHERS' || audience === 'ALL_STAFF' || audience === 'ENTIRE_SCHOOL') {
            const teachers = await this.prisma.teacher.findMany({
                where: { tenantId, isActive: true },
                select: { userId: true },
            });
            userIds.push(...teachers.map((t) => t.userId));
        }
        if (audience === 'ALL_PARENTS' || audience === 'ENTIRE_SCHOOL') {
            const parents = await this.prisma.user.findMany({
                where: { tenantId, role: 'PARENT', isActive: true },
                select: { id: true },
            });
            userIds.push(...parents.map((p) => p.id));
        }
        if (audience === 'ALL_STAFF' || audience === 'ENTIRE_SCHOOL') {
            const admins = await this.prisma.user.findMany({
                where: { tenantId, role: { in: ['SCHOOL_ADMIN', 'STAFF'] }, isActive: true },
                select: { id: true },
            });
            userIds.push(...admins.map((a) => a.id));
        }
        userIds = [...new Set(userIds)];
        if (channels.includes('IN_APP') && userIds.length > 0) {
            await this.prisma.notification.createMany({
                data: userIds.map((uid) => ({
                    userId: uid,
                    tenantId,
                    title,
                    body,
                    data: { type: 'broadcast', audience },
                })),
                skipDuplicates: true,
            });
        }
        if (channels.includes('SMS')) {
            const users = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                include: { profile: true },
            });
            for (const u of users) {
                if (u.profile?.phone) {
                    await this.queueSms(u.profile.phone, tenantId, `${title}: ${body}`);
                }
            }
        }
        this.logger.log(`Broadcast to ${userIds.length} users (${audience}) — channels: ${channels.join(',')}`);
        return { count: userIds.length };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map