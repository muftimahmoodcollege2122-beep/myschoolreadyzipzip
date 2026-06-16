import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import * as nodemailer from 'nodemailer';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private emailTransport: nodemailer.Transporter | null = null;
  private twilioClient: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue('notifications') private readonly notifQueue: Queue,
  ) {
    // Lazy-init to avoid crashing if env vars not set in dev
    const sesUser = config.get('SES_SMTP_USER');
    if (sesUser) {
      this.emailTransport = nodemailer.createTransport({
        host: config.get('SES_SMTP_HOST', 'email-smtp.us-east-1.amazonaws.com'),
        port: 587, secure: false,
        auth: { user: sesUser, pass: config.get('SES_SMTP_PASS') },
      });
    }
  }

  async send(dto: { tenantId: string; userId: string; channel: NotificationChannel; title: string; body: string; data?: Record<string, string>; priority?: string }): Promise<string> {
    const notif = await this.prisma.notification.create({
      data: { tenantId: dto.tenantId, userId: dto.userId, channel: dto.channel, status: NotificationStatus.PENDING, title: dto.title, body: dto.body, data: dto.data || {} },
    });
    await this.notifQueue.add('send', { notificationId: notif.id, ...dto }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100 });
    return notif.id;
  }

  async sendInApp(userId: string, tenantId: string, title: string, body: string, data?: any): Promise<void> {
    // Save notification to DB — WebSocket gateway picks it up and pushes to user
    await this.prisma.notification.create({
      data: { tenantId, userId, channel: NotificationChannel.IN_APP, status: NotificationStatus.SENT, title, body, data: data || {}, sentAt: new Date() },
    });
    // Real-time push handled by RealtimeService.onNotificationCreated()
    this.logger.debug(`In-app notification saved for user ${userId}`);
  }

  async sendBulk(dto: { tenantId: string; userIds: string[]; channels: NotificationChannel[]; title: string; body: string; data?: Record<string, string> }): Promise<void> {
    const jobs = dto.userIds.flatMap(userId => dto.channels.map(channel => ({ name: 'send', data: { tenantId: dto.tenantId, userId, channel, title: dto.title, body: dto.body, data: dto.data }, opts: { attempts: 3 } })));
    await this.notifQueue.addBulk(jobs);
  }

  async queueSms(phone: string, tenantId: string, message: string): Promise<void> {
    if (!phone) return;
    await this.notifQueue.add('send_sms', { phone, message, tenantId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  }

  async getForUser(userId: string, tenantId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where: { userId, tenantId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.notification.count({ where: { userId, tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async markRead(id: string, tenantId: string): Promise<void> {
    await this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async broadcastAnnouncement(schoolId: string, title: string, body: string, channels: string[], tenantId: string): Promise<void> {
    await this.prisma.outboxEvent.create({ data: { tenantId, topic: 'announcement.broadcast', key: schoolId, payload: { schoolId, title, body, channels }, headers: {} } });
  }
}

  // ── Audience-based broadcast ───────────────────────────────────────────────
  async broadcastToAudience(
    tenantId: string, schoolId: string,
    title: string, body: string,
    channels: string[], audience: string,
  ): Promise<{ count: number }> {
    let userIds: string[] = [];

    if (audience === 'ALL_STUDENTS' || audience === 'ENTIRE_SCHOOL') {
      const students = await this.prisma.student.findMany({
        where: { tenantId, isActive: true }, select: { userId: true },
      });
      userIds.push(...students.map(s => s.userId));
    }
    if (audience === 'ALL_TEACHERS' || audience === 'ALL_STAFF' || audience === 'ENTIRE_SCHOOL') {
      const teachers = await this.prisma.teacher.findMany({
        where: { tenantId, isActive: true }, select: { userId: true },
      });
      userIds.push(...teachers.map(t => t.userId));
    }
    if (audience === 'ALL_PARENTS' || audience === 'ENTIRE_SCHOOL') {
      const parents = await this.prisma.user.findMany({
        where: { tenantId, role: 'PARENT', isActive: true }, select: { id: true },
      });
      userIds.push(...parents.map(p => p.id));
    }
    if (audience === 'ALL_STAFF' || audience === 'ENTIRE_SCHOOL') {
      const admins = await this.prisma.user.findMany({
        where: { tenantId, role: { in: ['SCHOOL_ADMIN','STAFF'] as any }, isActive: true }, select: { id: true },
      });
      userIds.push(...admins.map(a => a.id));
    }

    userIds = [...new Set(userIds)];

    // Create in-app notifications in bulk
    if (channels.includes('IN_APP') && userIds.length > 0) {
      await this.prisma.notification.createMany({
        data: userIds.map(uid => ({
          userId: uid, tenantId, title, body,
          data: { type: 'broadcast', audience },
          isRead: false,
        })),
        skipDuplicates: true,
      });
    }

    // Queue SMS if requested
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

  async getUserNotifications(userId: string, tenantId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(id: string, userId: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, tenantId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
