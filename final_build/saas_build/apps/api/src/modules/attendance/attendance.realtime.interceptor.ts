import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RealtimeService } from '../../realtime/realtime.service';

/**
 * Called by AttendanceService after bulk mark.
 * Fires real-time events for every absent student.
 */
@Injectable()
export class AttendanceRealtimeInterceptor {
  private readonly logger = new Logger(AttendanceRealtimeInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async afterBulkMark(
    tenantId: string,
    records: Array<{ studentId: string; status: string; sectionId: string; date: string }>,
    markedByName: string,
  ) {
    const events = await Promise.all(
      records.map(async r => {
        const student = await this.prisma.student.findFirst({
          where: { id: r.studentId },
          include: { user: { include: { profile: true } } },
        });
        return {
          studentId: r.studentId,
          studentName: student ? `${student.user.profile?.firstName} ${student.user.profile?.lastName}` : r.studentId,
          rollNumber: student?.rollNumber ?? '',
          status: r.status as any,
          sectionId: r.sectionId,
          date: r.date,
          markedByName,
        };
      }),
    );

    await this.realtime.onAttendanceMarked(tenantId, events);
    // Admins are in the SCHOOL_ADMIN role room, not the section room —
    // broadcast separately so their dashboard live-refreshes too.
    this.realtime.broadcastDashboardUpdate(tenantId, {});
  }
}
