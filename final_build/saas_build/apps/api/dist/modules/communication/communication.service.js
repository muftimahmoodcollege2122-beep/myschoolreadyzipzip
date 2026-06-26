"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let CommunicationService = class CommunicationService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async sendMessage(dto, senderId, tenantId) {
        const msg = await this.prisma.message.create({ data: { tenantId, senderId, recipientId: dto.recipientId, threadId: dto.threadId, subject: dto.subject, body: dto.body, attachments: dto.attachments ?? [] } });
        await this.notifications.sendInApp(dto.recipientId, tenantId, 'New Message', 'You have a new message', { messageId: msg.id });
        return msg;
    }
    async getThreads(userId, tenantId) {
        return this.prisma.messageThread.findMany({ where: { tenantId, participants: { some: { userId } } }, include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 }, participants: { include: { user: { include: { profile: true } } } } }, orderBy: { updatedAt: 'desc' } });
    }
    async getThread(threadId, userId, tenantId) {
        const thread = await this.prisma.messageThread.findFirst({ where: { id: threadId, tenantId, participants: { some: { userId } } }, include: { messages: { orderBy: { createdAt: 'asc' } }, participants: { include: { user: { include: { profile: true } } } } } });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        await this.prisma.message.updateMany({ where: { threadId, tenantId, recipientId: userId, readAt: null }, data: { readAt: new Date() } });
        return thread;
    }
    async getAnnouncements(tenantId, schoolId) {
        return this.prisma.announcement.findMany({ where: { tenantId, schoolId }, orderBy: { createdAt: 'desc' }, take: 20 });
    }
    async createAnnouncement(dto, authorId, tenantId) {
        return this.prisma.$transaction(async (tx) => {
            const a = await tx.announcement.create({ data: { ...dto, tenantId, authorId } });
            await tx.outboxEvent.create({ data: { tenantId, topic: 'announcement.created', key: a.id, payload: { announcementId: a.id, schoolId: dto.schoolId }, headers: {} } });
            return a;
        });
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, notifications_service_1.NotificationsService])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map