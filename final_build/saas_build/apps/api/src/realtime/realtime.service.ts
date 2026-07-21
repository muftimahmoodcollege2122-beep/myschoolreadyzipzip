import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { PrismaService } from '../database/prisma.service';

export interface AttendanceEvent {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  sectionId: string;
  date: string;
  markedByName: string;
}

export interface FeePaymentEvent {
  invoiceId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
}

export interface ExamResultEvent {
  examId: string;
  examTitle: string;
  sectionId: string;
  publishedCount: number;
}

export interface DashboardStatsEvent {
  totalStudents?: number;
  presentToday?: number;
  absentToday?: number;
  attendanceRate?: number;
  feesCollectedToday?: number;
  pendingFees?: number;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly prisma: PrismaService,
  ) {}

  async onAttendanceMarked(tenantId: string, events: AttendanceEvent[]) {
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
        } catch (err) {
          this.logger.error(`Failed to emit absent alert: ${(err as Error).message}`);
        }
      }
    }
  }

  async onFeePaymentRecorded(tenantId: string, event: FeePaymentEvent) {
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
    } catch (err) {
      this.logger.error(`Failed to emit fee payment event: ${(err as Error).message}`);
    }

    this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'dashboard:stats_update', {
      type: 'fee_collected',
      amount: event.amount,
      timestamp: new Date().toISOString(),
    });
  }

  async onExamResultsPublished(tenantId: string, event: ExamResultEvent) {
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

  async onNotificationCreated(userId: string, tenantId: string, notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    data?: any;
  }) {
    this.gateway.emitToUser(userId, 'notification:new', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    const unread = await this.prisma.notification.count({
      where: { userId, tenantId, readAt: null },
    });
    this.gateway.emitToUser(userId, 'notifications:unread_count', { count: unread });
  }

  broadcastDashboardUpdate(tenantId: string, stats: DashboardStatsEvent) {
    this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'dashboard:live_stats', {
      ...stats,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastAnnouncement(tenantId: string, announcement: {
    id: string;
    title: string;
    body: string;
    priority: 'normal' | 'urgent';
    targetRoles?: string[];
  }) {
    if (announcement.targetRoles?.length) {
      for (const role of announcement.targetRoles) {
        this.gateway.emitToRole(tenantId, role, 'announcement:new', announcement);
      }
    } else {
      this.gateway.emitToTenant(tenantId, 'announcement:new', announcement);
    }
    this.logger.log(`Broadcast announcement "${announcement.title}" to tenant ${tenantId}`);
  }

  getOnlineCount(tenantId: string): number {
    return this.gateway.getOnlineCount(tenantId);
  }
}
