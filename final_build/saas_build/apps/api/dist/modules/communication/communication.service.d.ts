import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommunicationService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    sendMessage(dto: any, senderId: string, tenantId: string): Promise<any>;
    getThreads(userId: string, tenantId: string): Promise<any>;
    getThread(threadId: string, userId: string, tenantId: string): Promise<any>;
    getAnnouncements(tenantId: string, schoolId: string): Promise<any>;
    createAnnouncement(dto: any, authorId: string, tenantId: string): Promise<any>;
}
