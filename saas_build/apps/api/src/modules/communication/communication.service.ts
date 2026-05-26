import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) {}

  async sendMessage(dto: any, senderId: string, tenantId: string) {
    const msg = await this.prisma.message.create({ data: { tenantId, senderId, recipientId: dto.recipientId, threadId: dto.threadId, subject: dto.subject, body: dto.body, attachments: dto.attachments ?? [] } });
    await this.notifications.sendInApp(dto.recipientId, tenantId, 'New Message', 'You have a new message', { messageId: msg.id });
    return msg;
  }

  async getThreads(userId: string, tenantId: string) {
    return this.prisma.messageThread.findMany({ where: { tenantId, participants: { some: { userId } } }, include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 }, participants: { include: { user: { include: { profile: true } } } } }, orderBy: { updatedAt: 'desc' } });
  }

  async getThread(threadId: string, userId: string, tenantId: string) {
    const thread = await this.prisma.messageThread.findFirst({ where: { id: threadId, tenantId, participants: { some: { userId } } }, include: { messages: { orderBy: { createdAt: 'asc' } }, participants: { include: { user: { include: { profile: true } } } } } });
    if (!thread) throw new NotFoundException('Thread not found');
    await this.prisma.message.updateMany({ where: { threadId, tenantId, recipientId: userId, readAt: null }, data: { readAt: new Date() } });
    return thread;
  }

  async getAnnouncements(tenantId: string, schoolId: string) {
    return this.prisma.announcement.findMany({ where: { tenantId, schoolId }, orderBy: { createdAt: 'desc' }, take: 20 });
  }

  async createAnnouncement(dto: any, authorId: string, tenantId: string) {
    return this.prisma.$transaction(async tx => {
      const a = await tx.announcement.create({ data: { ...dto, tenantId, authorId } });
      await tx.outboxEvent.create({ data: { tenantId, topic: 'announcement.created', key: a.id, payload: { announcementId: a.id, schoolId: dto.schoolId }, headers: {} } });
      return a;
    });
  }
}
