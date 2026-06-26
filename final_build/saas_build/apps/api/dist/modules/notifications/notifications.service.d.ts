import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { NotificationChannel } from '@prisma/client';
export declare class NotificationsService {
    private readonly prisma;
    private readonly config;
    private readonly notifQueue;
    private readonly logger;
    private emailTransport;
    constructor(prisma: PrismaService, config: ConfigService, notifQueue: Queue);
    send(dto: {
        tenantId: string;
        userId: string;
        channel: NotificationChannel;
        title: string;
        body: string;
        data?: Record<string, string>;
        priority?: string;
    }): Promise<string>;
    sendInApp(userId: string, tenantId: string, title: string, body: string, data?: any): Promise<void>;
    sendBulk(dto: {
        tenantId: string;
        userIds: string[];
        channels: NotificationChannel[];
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<void>;
    queueSms(phone: string, tenantId: string, message: string): Promise<void>;
    getForUser(userId: string, tenantId: string, page: number, limit: number): Promise<any>;
    markRead(id: string, tenantId: string): Promise<void>;
    getUserNotifications(userId: string, tenantId: string, limit?: number): Promise<any>;
    markAsRead(id: string, userId: string, tenantId: string): Promise<any>;
    markAllAsRead(userId: string, tenantId: string): Promise<any>;
    broadcastAnnouncement(schoolId: string, title: string, body: string, channels: string[], tenantId: string): Promise<void>;
    broadcastToAudience(tenantId: string, schoolId: string, title: string, body: string, channels: string[], audience: string): Promise<{
        count: number;
    }>;
}
