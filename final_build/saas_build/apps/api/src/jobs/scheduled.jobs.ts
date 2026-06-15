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

  // ── 1. Mark overdue invoices + send SMS reminders (daily 8am) ──────────────
  @Cron('0 8 * * *')
  async sendFeeReminders() {
    this.logger.log('Fee reminder job running');

    // Auto-mark PENDING invoices past due date as OVERDUE
    const nowOverdue = await this.prisma.feeInvoice.updateMany({
      where: { status: 'PENDING', dueDate: { lt: new Date() } },
      data: { status: 'OVERDUE' },
    });
    this.logger.log(`Marked ${nowOverdue.count} invoices as OVERDUE`);

    // Fetch all overdue invoices with student + parent info
    const overdue = await this.prisma.feeInvoice.findMany({
      where: { status: { in: ['OVERDUE', 'PARTIAL'] as any }, dueDate: { lt: new Date() } },
      include: {
        student: {
          include: {
            user: { include: { profile: true } },
            parents: { include: { parent: { include: { user: { include: { profile: true } } } } } },
          },
        },
      },
      take: 1000,
    });

    let smsCount = 0;
    for (const inv of overdue) {
      try {
        const daysOverdue = Math.floor((Date.now() - inv.dueDate.getTime()) / 86400000);
        const studentName = `${inv.student.user.profile?.firstName || ''} ${inv.student.user.profile?.lastName || ''}`.trim();
        const amount = Number(inv.amount) - Number(inv.amountPaid ?? 0);
        const msg = `Dear Parent, fee of Rs.${amount.toLocaleString()} for ${studentName} is overdue by ${daysOverdue} day(s). Invoice: ${inv.invoiceNo}. Please pay immediately to avoid suspension.`;

        // SMS to student
        const studentPhone = inv.student.user.profile?.phone;
        if (studentPhone) {
          await this.notifications.queueSms(studentPhone, inv.tenantId, msg);
          smsCount++;
        }

        // SMS to each linked parent
        for (const link of inv.student.parents || []) {
          const parentPhone = link.parent?.user?.profile?.phone;
          if (parentPhone) {
            await this.notifications.queueSms(parentPhone, inv.tenantId, msg);
            smsCount++;
          }
        }

        // In-app notification to student
        await this.notifications.sendInApp(
          inv.student.userId, inv.tenantId,
          '⚠️ Fee Overdue',
          `Your fee of Rs.${amount.toLocaleString()} (${inv.invoiceNo}) is overdue by ${daysOverdue} day(s).`,
          { invoiceId: inv.id, type: 'fee_overdue' },
        );
      } catch (e) {
        this.logger.error(`Fee reminder failed for invoice ${inv.id}: ${e}`);
      }
    }
    this.logger.log(`Sent ${smsCount} fee reminder SMS for ${overdue.length} invoices`);
  }

  // ── 2. Send absent alerts to parents immediately after attendance (every 30 min) ──
  @Cron('*/30 * * * *')
  async processAbsenceAlerts() {
    // Find unprocessed attendance.marked outbox events
    const events = await this.prisma.outboxEvent.findMany({
      where: { topic: 'attendance.marked', status: 'PENDING' },
      take: 50,
      orderBy: { createdAt: 'asc' },
    });

    for (const event of events) {
      try {
        const payload = event.payload as any;
        const absentIds: string[] = payload.absentStudentIds || [];

        if (absentIds.length > 0) {
          const students = await this.prisma.student.findMany({
            where: { id: { in: absentIds }, tenantId: event.tenantId },
            include: {
              user: { include: { profile: true } },
              parents: { include: { parent: { include: { user: { include: { profile: true } } } } } },
            },
          });

          for (const student of students) {
            const name = `${student.user.profile?.firstName || ''} ${student.user.profile?.lastName || ''}`.trim();
            const date = new Date(payload.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
            const msg = `Dear Parent, ${name} was marked ABSENT on ${date}. Please contact the school if this is incorrect.`;

            // Alert each parent
            for (const link of student.parents || []) {
              const parentPhone = link.parent?.user?.profile?.phone;
              if (parentPhone) await this.notifications.queueSms(parentPhone, event.tenantId, msg);

              // In-app to parent
              await this.notifications.sendInApp(
                link.parent.userId, event.tenantId,
                `📵 ${name} Absent Today`,
                msg,
                { studentId: student.id, date: payload.date, type: 'absence_alert' },
              );
            }

            // Also in-app to student
            await this.notifications.sendInApp(
              student.userId, event.tenantId,
              '📵 Absence Recorded',
              `Your attendance was marked ABSENT on ${date}.`,
              { date: payload.date, type: 'absence_alert' },
            );
          }
        }

        // Mark event as processed
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (e) {
        this.logger.error(`Absence alert failed for event ${event.id}: ${e}`);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { attempts: { increment: 1 } },
        });
      }
    }
  }

  // ── 3. Process exam result publish notifications ────────────────────────────
  @Cron('*/5 * * * *')
  async processResultPublishNotifications() {
    const events = await this.prisma.outboxEvent.findMany({
      where: { topic: 'exam.results_published', status: 'PENDING' },
      take: 20,
      orderBy: { createdAt: 'asc' },
    });

    for (const event of events) {
      try {
        const payload = event.payload as any;
        const exam = await this.prisma.exam.findFirst({
          where: { id: payload.examId, tenantId: event.tenantId },
          include: {
            subject: true,
            results: {
              include: {
                student: {
                  include: {
                    user: { include: { profile: true } },
                    parents: { include: { parent: { include: { user: { include: { profile: true } } } } } },
                  },
                },
              },
            },
          },
        });

        if (!exam) continue;

        for (const result of exam.results) {
          const student = result.student;
          const name = `${student.user.profile?.firstName || ''} ${student.user.profile?.lastName || ''}`.trim();
          const pct = Math.round((Number(result.marksObtained) / Number(exam.maxMarks)) * 100);
          const passed = Number(result.marksObtained) >= Number(exam.passingMarks || 0);

          // In-app to student
          await this.notifications.sendInApp(
            student.userId, event.tenantId,
            `📊 ${exam.name} Results Published`,
            `You scored ${result.marksObtained}/${exam.maxMarks} (${pct}%) — Grade: ${result.grade}. ${passed ? '✅ Passed' : '❌ Failed'}`,
            { examId: exam.id, resultId: result.id, type: 'result_published' },
          );

          // SMS + in-app to parents
          const msg = `Dear Parent, ${name}'s result for ${exam.name} (${exam.subject?.name}): ${result.marksObtained}/${exam.maxMarks} — ${result.grade}. ${passed ? 'PASSED ✅' : 'FAILED ❌'}`;
          for (const link of student.parents || []) {
            const parentPhone = link.parent?.user?.profile?.phone;
            if (parentPhone) await this.notifications.queueSms(parentPhone, event.tenantId, msg);
            await this.notifications.sendInApp(
              link.parent.userId, event.tenantId,
              `📊 ${name}'s Result: ${exam.name}`,
              msg,
              { examId: exam.id, studentId: student.id, type: 'result_published' },
            );
          }
        }

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
        this.logger.log(`Result notifications sent for exam ${payload.examId}: ${exam.results.length} students`);
      } catch (e) {
        this.logger.error(`Result notification failed for event ${event.id}: ${e}`);
        await this.prisma.outboxEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
      }
    }
  }

  // ── 4. Weekly attendance summary to parents (Monday 7am) ───────────────────
  @Cron('0 7 * * 1')
  async weeklyAttendanceSummary() {
    this.logger.log('Weekly attendance summary job running');
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { isActive: true },
      include: {
        student: {
          include: {
            user: { include: { profile: true } },
            parents: { include: { parent: { include: { user: { include: { profile: true } } } } } },
            attendances: { where: { date: { gte: weekStart } } },
          },
        },
      },
      take: 5000,
    });

    for (const enrollment of enrollments) {
      try {
        const student = enrollment.student;
        const records = student.attendances;
        const total = records.length;
        if (total === 0) continue;

        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const pct = Math.round((present / total) * 100);
        const name = `${student.user.profile?.firstName || ''} ${student.user.profile?.lastName || ''}`.trim();

        if (pct < 80 || absent > 1) {
          const msg = `Weekly Attendance Report for ${name}: Present ${present}/${total} days (${pct}%). ${absent > 0 ? `Absent: ${absent} day(s).` : ''} ${pct < 75 ? '⚠️ Attendance is below 75% — action required.' : ''}`;
          for (const link of student.parents || []) {
            const parentPhone = link.parent?.user?.profile?.phone;
            if (parentPhone) await this.notifications.queueSms(parentPhone, enrollment.tenantId, msg);
            await this.notifications.sendInApp(
              link.parent.userId, enrollment.tenantId,
              `📅 Weekly Attendance: ${name}`,
              msg,
              { studentId: student.id, week: weekStart.toISOString(), type: 'weekly_attendance' },
            );
          }
        }
      } catch (e) {
        this.logger.error(`Weekly summary failed for enrollment ${enrollment.id}: ${e}`);
      }
    }
  }

  // ── 5. Auto-mark absent if no attendance submitted by 2pm ──────────────────
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoMarkAbsent() {
    this.logger.log('Auto-mark absent job running');
    await this.prisma.outboxEvent.create({
      data: {
        tenantId: 'platform',
        topic: 'jobs.auto_mark_absent',
        key: 'daily',
        payload: { date: new Date().toISOString() },
        headers: {},
      },
    });
  }

  // ── 6. Send timetable change notifications (process pending events) ─────────
  @Cron('*/10 * * * *')
  async processTimetableChangeNotifications() {
    const events = await this.prisma.outboxEvent.findMany({
      where: { topic: 'timetable.changed', status: 'PENDING' },
      take: 20,
    });

    for (const event of events) {
      try {
        const payload = event.payload as any;
        const section = await this.prisma.section.findFirst({
          where: { id: payload.sectionId, tenantId: event.tenantId },
          include: {
            enrollments: {
              where: { isActive: true },
              include: { student: { include: { user: true, parents: { include: { parent: { include: { user: true } } } } } } },
            },
          },
        });

        if (!section) continue;

        for (const enrollment of section.enrollments) {
          await this.notifications.sendInApp(
            enrollment.student.userId, event.tenantId,
            '🗓️ Timetable Updated',
            payload.message || 'Your class timetable has been updated. Please check the latest schedule.',
            { sectionId: payload.sectionId, type: 'timetable_change' },
          );
          for (const link of enrollment.student.parents || []) {
            await this.notifications.sendInApp(
              link.parent.userId, event.tenantId,
              '🗓️ Timetable Updated',
              payload.message || `Timetable updated for ${section.name}.`,
              { sectionId: payload.sectionId, type: 'timetable_change' },
            );
          }
        }

        await this.prisma.outboxEvent.update({ where: { id: event.id }, data: { status: 'SENT', sentAt: new Date() } });
      } catch (e) {
        this.logger.error(`Timetable notification failed: ${e}`);
      }
    }
  }

  // ── 7. Leave request approval reminders (daily 9am) ───────────────────────
  @Cron('0 9 * * *')
  async pendingLeaveReminders() {
    const pending = await this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING', createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      include: { teacher: { include: { user: { include: { profile: true } } } } },
      take: 100,
    });

    for (const leave of pending) {
      try {
        // Find school admin for this tenant
        const admin = await this.prisma.user.findFirst({
          where: { tenantId: leave.tenantId, role: 'SCHOOL_ADMIN', isActive: true },
        });
        if (!admin) continue;

        const teacherName = `${leave.teacher.user.profile?.firstName || ''} ${leave.teacher.user.profile?.lastName || ''}`.trim();
        await this.notifications.sendInApp(
          admin.id, leave.tenantId,
          '⏳ Pending Leave Approval',
          `${teacherName}'s leave request (${leave.leaveType}) from ${new Date(leave.startDate).toLocaleDateString()} is awaiting your approval.`,
          { leaveId: leave.id, type: 'leave_pending' },
        );
      } catch (e) {
        this.logger.error(`Leave reminder failed: ${e}`);
      }
    }
  }
}
