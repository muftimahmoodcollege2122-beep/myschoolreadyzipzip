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

  /**
   * Called when teacher marks a student absent.
   * Immediately notifies:
   *   - The parent of the absent student (personal room)
   *   - School admins (role room)
   *   - Section room (other teachers monitoring)
   */
  async onAttendanceMarked(tenantId: string, events: AttendanceEvent[]) {
    for (const evt of events) {
      // Emit to section room (live attendance sheet updates)
      this.gateway.emitToSection(tenantId, evt.sectionId, 'attendance:marked', {
        studentId: evt.studentId,
        rollNumber: evt.rollNumber,
        status: evt.status,
        date: evt.date,
        markedAt: new Date().toISOString(),
      });

      // If absent — find parent and send live alert
      if (evt.status === 'ABSENT') {
        try {
          const parents = await this.prisma.studentGuardian.findMany({
            where: { studentId: evt.studentId },
            include: { guardian: true },
          });

          for (const p of parents) {
            this.gateway.emitToUser(p.guardianId, 'alert:child_absent', {
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

          // Notify admins too
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

  /**
   * Called when a fee payment is recorded.
   * Notifies student + parents + admins live.
   */
  async onFeePaymentRecorded(tenantId: string, event: FeePaymentEvent) {
    // Notify the student
    this.gateway.emitToUser(event.studentId, 'fee:payment_confirmed', {
      ...event,
      message: `Payment of Rs. ${event.amount.toLocaleString()} confirmed`,
      timestamp: new Date().toISOString(),
    });

    // Notify parents
    try {
      const parents = await this.prisma.studentGuardian.findMany({
        where: { studentId: event.studentId },
      });
      for (const p of parents) {
        this.gateway.emitToUser(p.guardianId, 'fee:payment_confirmed', {
          ...event,
          message: `Fee payment of Rs. ${event.amount.toLocaleString()} received`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      this.logger.error(`Failed to emit fee payment event: ${(err as Error).message}`);
    }

    // Update admin dashboard stats live
    this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'dashboard:stats_update', {
      type: 'fee_collected',
      amount: event.amount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Called when exam results are published.
   * Broadcasts to all students and parents in the section.
   */
  async onExamResultsPublished(tenantId: string, event: ExamResultEvent) {
    // Broadcast to entire section
    this.gateway.emitToSection(tenantId, event.sectionId, 'exam:results_published', {
      examId: event.examId,
      examTitle: event.examTitle,
      message: `Results for "${event.examTitle}" have been published!`,
      timestamp: new Date().toISOString(),
    });

    // Broadcast to full tenant (students check their results)
    this.gateway.emitToTenant(tenantId, 'exam:results_available', {
      examId: event.examId,
      examTitle: event.examTitle,
      sectionId: event.sectionId,
    });
  }

  /**
   * Push a notification to a specific user's bell in real-time.
   */
  async onNotificationCreated(userId: string, tenantId: string, notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    data?: any;
  }) {
    // Send notification to user's room
    this.gateway.emitToUser(userId, 'notification:new', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    // Update unread count
    const unread = await this.prisma.notification.count({
      where: { userId, tenantId, readAt: null },
    });
    this.gateway.emitToUser(userId, 'notifications:unread_count', { count: unread });
  }

  /**
   * Push live dashboard stats update to admin screens.
   */
  broadcastDashboardUpdate(tenantId: string, stats: DashboardStatsEvent) {
    this.gateway.emitToRole(tenantId, 'SCHOOL_ADMIN', 'dashboard:live_stats', {
      ...stats,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast a school-wide announcement in real-time.
   */
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

  /** Online count for a tenant */
  getOnlineCount(tenantId: string): number {
    return this.gateway.getOnlineCount(tenantId);
  }
}
