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
var RealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const realtime_gateway_1 = require("./realtime.gateway");
const prisma_service_1 = require("../database/prisma.service");
let RealtimeService = RealtimeService_1 = class RealtimeService {
    constructor(gateway, prisma) {
        this.gateway = gateway;
        this.prisma = prisma;
        this.logger = new common_1.Logger(RealtimeService_1.name);
    }
    async onAttendanceMarked(tenantId, events) {
        for (const evt of events) {
            this.gateway.emitToSection(tenantId, evt.sectionId, 'attendance:marked', {
                studentId: evt.studentId,
                rollNumber: evt.rollNumber,
                status: evt.status,
                date: evt.date,
                markedAt: new Date().toISOString(),
            });
            if (evt.status === 'ABSENT') {
                try {
                    const parents = await this.prisma.studentParent.findMany({
                        where: { studentId: evt.studentId },
                        include: { parent: { include: { user: true } } },
                    });
                    for (const p of parents) {
                        this.gateway.emitToUser(p.parentId, 'alert:child_absent', {
                            studentId: evt.studentId,
                            studentName: evt.studentName,
                            rollNumber: evt.rollNumber,
                            date: evt.date,
                            markedByName: evt.markedByName,
                            message: `${evt.studentName} was marked absent today`,
                            severity: 'high',
                            timestamp: new Date().toISOString(),
                        });
                    }
                    this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'attendance:absent_alert', {
                        studentId: evt.studentId,
                        studentName: evt.studentName,
                        sectionId: evt.sectionId,
                        date: evt.date,
                    });
                }
                catch (err) {
                    this.logger.error(`Failed to emit absent alert: ${err.message}`);
                }
            }
        }
    }
    async onFeePaymentRecorded(tenantId, event) {
        this.gateway.emitToUser(event.studentId, 'fee:payment_confirmed', {
            ...event,
            message: `Payment of Rs. ${event.amount.toLocaleString()} confirmed`,
            timestamp: new Date().toISOString(),
        });
        try {
            const parents = await this.prisma.studentParent.findMany({
                where: { studentId: event.studentId },
            });
            for (const p of parents) {
                this.gateway.emitToUser(p.parentId, 'fee:payment_confirmed', {
                    ...event,
                    message: `Fee payment of Rs. ${event.amount.toLocaleString()} received`,
                    timestamp: new Date().toISOString(),
                });
            }
        }
        catch (err) {
            this.logger.error(`Failed to emit fee payment event: ${err.message}`);
        }
        this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'dashboard:stats_update', {
            type: 'fee_collected',
            amount: event.amount,
            timestamp: new Date().toISOString(),
        });
    }
    async onExamResultsPublished(tenantId, event) {
        this.gateway.emitToSection(tenantId, event.sectionId, 'exam:results_published', {
            examId: event.examId,
            examTitle: event.examTitle,
            message: `Results for "${event.examTitle}" have been published!`,
            timestamp: new Date().toISOString(),
        });
        this.gateway.emitToTenant(tenantId, 'exam:results_available', {
            examId: event.examId,
            examTitle: event.examTitle,
            sectionId: event.sectionId,
        });
    }
    async onNotificationCreated(userId, tenantId, notification) {
        this.gateway.emitToUser(userId, 'notification:new', {
            ...notification,
            timestamp: new Date().toISOString(),
        });
        const unread = await this.prisma.notification.count({
            where: { userId, tenantId, readAt: null },
        });
        this.gateway.emitToUser(userId, 'notifications:unread_count', { count: unread });
    }
    broadcastDashboardUpdate(tenantId, stats) {
        this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'dashboard:live_stats', {
            ...stats,
            timestamp: new Date().toISOString(),
        });
    }
    broadcastAnnouncement(tenantId, announcement) {
        if (announcement.targetRoles?.length) {
            for (const role of announcement.targetRoles) {
                this.gateway.emitToRole(tenantId, role, 'announcement:new', announcement);
            }
        }
        else {
            this.gateway.emitToTenant(tenantId, 'announcement:new', announcement);
        }
        this.logger.log(`Broadcast announcement "${announcement.title}" to tenant ${tenantId}`);
    }
    getOnlineCount(tenantId) {
        return this.gateway.getOnlineCount(tenantId);
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = RealtimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway,
        prisma_service_1.PrismaService])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map