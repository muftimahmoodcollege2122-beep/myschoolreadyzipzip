import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { AuditService } from '../../common/audit/audit.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceReportQueryDto } from './dto/attendance-report-query.dto';
import { AttendanceStatus } from '@prisma/client';
import * as dayjs from 'dayjs';

export interface AttendanceSummary {
  studentId: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventPublisher,
    private readonly audit: AuditService,
  ) {}

  /**
   * Mark attendance for entire section — bulk upsert, idempotent
   */
  async markSectionAttendance(
    sectionId: string,
    tenantId: string,
    teacherId: string,
    records: MarkAttendanceDto[],
  ): Promise<void> {
    const date = dayjs().startOf('day').toDate();

    // Validate section belongs to tenant
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, tenantId },
      include: { class: true },
    });

    if (!section) throw new NotFoundException(`Section ${sectionId} not found`);

    // Verify teacher is assigned to this section
    const isAssigned = await this.prisma.timetableSlot.findFirst({
      where: {
        sectionId,
        teacherId,
        tenantId,
        dayOfWeek: dayjs().day() === 0 ? 7 : dayjs().day(), // Convert to Mon=1..Sun=7
      },
    });

    if (!isAssigned) {
      this.logger.warn(`Teacher ${teacherId} marking attendance for unassigned section ${sectionId}`);
      // Allow but flag — some schools let admin teachers mark any section
    }

    await this.prisma.$transaction(async (tx) => {
      // Upsert each attendance record — idempotent operation
      const upserts = records.map((record) =>
        (tx as any).attendance.upsert({
          where: {
            studentId_sectionId_date: {
              studentId: record.studentId,
              sectionId,
              date,
            },
          },
          create: {
            studentId: record.studentId,
            sectionId,
            tenantId,
            date,
            status: record.status,
            markedById: teacherId,
            remarks: record.remarks,
          },
          update: {
            status: record.status,
            markedById: teacherId,
            remarks: record.remarks,
            markedAt: new Date(),
          },
        }),
      );

      await Promise.all(upserts);

      // Emit event for real-time parent notification (absent students only)
      const absentStudents = records.filter(
        (r) => r.status === AttendanceStatus.ABSENT,
      );

      if (absentStudents.length > 0) {
        await tx.outboxEvent.create({
          data: {
            tenantId,
            topic: 'attendance.marked',
            key: sectionId,
            payload: {
              sectionId,
              classId: section.classId,
              date: date.toISOString(),
              teacherId,
              absentStudentIds: absentStudents.map((r) => r.studentId),
              allRecords: records,
            },
            headers: { source: 'teacher-app' },
          },
        });
      }
    });

    this.logger.log(
      `Attendance marked for section ${sectionId}: ${records.length} students, date ${date.toISOString().slice(0, 10)}`,
    );
  }

  /**
   * Get attendance for a student across date range
   */
  async getStudentAttendance(
    studentId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const records = await this.prisma.attendance.findMany({
      where: {
        studentId,
        tenantId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });

    const summary = this.calculateSummary(studentId, records);
    return { records, summary };
  }

  /**
   * Section attendance report for a given date range
   */
  async getSectionAttendanceReport(
    sectionId: string,
    tenantId: string,
    query: AttendanceReportQueryDto,
  ) {
    const { startDate, endDate } = query;

    const [students, attendanceRecords] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where: { sectionId, tenantId, isActive: true },
        include: { student: { include: { user: { include: { profile: true } } } } },
      }),
      this.prisma.attendance.findMany({
        where: {
          sectionId,
          tenantId,
          date: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      }),
    ]);

    // Group by student
    const byStudent = new Map<string, typeof attendanceRecords>();
    for (const record of attendanceRecords) {
      if (!byStudent.has(record.studentId)) {
        byStudent.set(record.studentId, []);
      }
      byStudent.get(record.studentId)!.push(record);
    }

    const report = students.map((enrollment) => ({
      student: enrollment.student,
      summary: this.calculateSummary(
        enrollment.studentId,
        byStudent.get(enrollment.studentId) || [],
      ),
    }));

    return {
      sectionId,
      startDate,
      endDate,
      report,
      totalStudents: students.length,
    };
  }

  /**
   * Identify chronically absent students (< 75% attendance)
   */
  async getChronicAbsentees(
    schoolId: string,
    tenantId: string,
    threshold = 75,
    academicYear: string,
  ) {
    // Raw SQL for complex aggregation — more efficient than Prisma ORM
    const results = await this.prisma.$queryRaw<Array<{
      student_id: string;
      total_days: number;
      present_days: number;
      percentage: number;
    }>>`
      SELECT 
        a.student_id,
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE a.status = 'PRESENT') as present_days,
        ROUND(
          COUNT(*) FILTER (WHERE a.status = 'PRESENT')::decimal / 
          NULLIF(COUNT(*), 0) * 100, 2
        ) as percentage
      FROM attendances a
      JOIN students s ON s.id = a.student_id
      WHERE s.school_id = ${schoolId}
        AND a.tenant_id = ${tenantId}
        AND DATE_PART('year', a.date) = ${parseInt(academicYear.split('-')[0])}
      GROUP BY a.student_id
      HAVING ROUND(
        COUNT(*) FILTER (WHERE a.status = 'PRESENT')::decimal / 
        NULLIF(COUNT(*), 0) * 100, 2
      ) < ${threshold}
      ORDER BY percentage ASC
    `;

    return results;
  }

  private calculateSummary(
    studentId: string,
    records: Array<{ status: AttendanceStatus }>,
  ): AttendanceSummary {
    const total = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const excused = records.filter((r) => r.status === AttendanceStatus.EXCUSED).length;

    return {
      studentId,
      total,
      present,
      absent,
      late,
      excused,
      percentage: total > 0 ? Math.round(((present + late * 0.5) / total) * 10000) / 100 : 0,
    };
  }
}
