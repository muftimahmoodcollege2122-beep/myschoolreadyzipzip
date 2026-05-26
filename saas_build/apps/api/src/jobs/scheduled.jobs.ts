import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

@Injectable()
export class ScheduledJobs {
  private readonly logger = new Logger(ScheduledJobs.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron('0 8 * * *')
  async sendFeeReminders() {
    this.logger.log('Fee reminder job running');
    const overdue = await this.prisma.feeInvoice.findMany({
      where: { status: { in: ['PENDING', 'OVERDUE'] as any }, dueDate: { lt: new Date() } },
      include: { student: { include: { user: { include: { profile: true } } } } },
      take: 500,
    });
    for (const inv of overdue) {
      try {
        const phone = inv.student.user.profile?.phone;
        if (phone) {
          // queueSms signature: (phone, tenantId, message)
          await this.notifications.queueSms(
            phone,
            inv.tenantId,
            `Fee reminder: Rs. ${inv.amount} is overdue. Please pay immediately to avoid suspension.`,
          );
        }
      } catch (e) {
        this.logger.error(`Fee reminder failed for invoice ${inv.id}: ${e}`);
      }
    }
    this.logger.log(`Queued fee reminders for ${overdue.length} invoices`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoMarkAbsent() {
    this.logger.log('Auto-mark absent job: checking for missing attendance records');
    // Finds sections with no attendance records for yesterday and marks all enrolled students absent
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    // Implementation handled by event consumer
    await this.prisma.outboxEvent.create({
      data: { tenantId: 'platform', topic: 'jobs.auto_mark_absent', key: 'daily', payload: { date: yesterday.toISOString() }, headers: {} },
    });
  }

  @Cron('0 7 * * 1')
  async weeklyAttendanceSummary() {
    this.logger.log('Weekly attendance summary job running');
    await this.prisma.outboxEvent.create({
      data: { tenantId: 'platform', topic: 'jobs.weekly_attendance_summary', key: 'weekly', payload: { weekStart: new Date().toISOString() }, headers: {} },
    });
  }
}
