/**
 * Attendance service — daily student and teacher attendance tracking.
 * markAttendance(): bulk mark present/absent/late for a class section
 * getAttendance(): attendance records with date range filters
 * getAttendanceSummary(): per-student attendance percentage
 * getDashboardStats(): today's present/absent/late counts for dashboard
 * Fires attendance.marked event via EventPublisher for real-time updates.
 */

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceReportQueryDto } from './dto/attendance-report-query.dto';
import { AttendanceStatus } from '../../common/prisma-enums';
import dayjs from 'dayjs';

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
    private readonly notifications: NotificationsService,
  ) {}

  async markSectionAttendance(
    sectionId: string,
    tenantId: string,
    teacherId: string,
    records: MarkAttendanceDto[],
  ): Promise<{ marked: number; absentCount: number; lateCount: number }> {
    const date = dayjs().startOf('day').toDate();

    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, tenantId },
      include: { class: true },
    });
    if (!section) throw new NotFoundException(`Section ${sectionId} not found`);

    await this.prisma.$transaction(async (tx) => {
      const upserts = records.map((record) =>
        (tx as any).attendance.upsert({
          where: { studentId_sectionId_date: { studentId: record.studentId, sectionId, date } },
          create: { studentId: record.studentId, sectionId, tenantId, date, status: record.status, markedById: teacherId, remarks: record.remarks },
          update: { status: record.status, markedById: teacherId, remarks: record.remarks, markedAt: new Date() },
        }),
      );
      await Promise.all(upserts);

      const absentStudents = records.filter(r => r.status === AttendanceStatus.ABSENT);
      const lateStudents   = records.filter(r => r.status === AttendanceStatus.LATE);

      // Always store outbox event — scheduled job processes absent alerts
      await tx.outboxEvent.create({
        data: {
          tenantId,
          topic: 'attendance.marked',
          key: sectionId,
          payload: {
            sectionId,
            classId: section.classId,
            className: section.class?.name,
            sectionName: section.name,
            date: date.toISOString(),
            teacherId,
            absentStudentIds: absentStudents.map(r => r.studentId),
            lateStudentIds: lateStudents.map(r => r.studentId),
            allRecords: records,
            totalMarked: records.length,
          },
          headers: { source: 'teacher-app' },
          status: 'PENDING',
        },
      });
    });

    const absentCount = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const lateCount   = records.filter(r => r.status === AttendanceStatus.LATE).length;

    this.logger.log(`Attendance marked for section ${sectionId}: ${records.length} students (${absentCount} absent, ${lateCount} late)`);
    return { marked: records.length, absentCount, lateCount };
  }

  async getSectionAttendanceForDate(sectionId: string, tenantId: string, date: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await this.prisma.attendance.findMany({
      where: { sectionId, tenantId, date: { gte: targetDate, lt: nextDay } },
      include: { student: { include: { user: { include: { profile: true } } } } },
      orderBy: { student: { rollNumber: 'asc' } as any },
    });
    return { date: targetDate.toISOString().split('T')[0], sectionId, records };
  }

  async getStudentAttendance(studentId: string, tenantId: string, startDate: Date, endDate: Date) {
    const records = await this.prisma.attendance.findMany({
      where: { studentId, tenantId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
    });
    const summary = this.calculateSummary(studentId, records);
    return { records, summary };
  }

  async getSectionAttendanceReport(sectionId: string, tenantId: string, query: AttendanceReportQueryDto) {
    const { startDate, endDate } = query;
    const [students, attendanceRecords] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where: { sectionId, tenantId, isActive: true },
        include: { student: { include: { user: { include: { profile: true } } } } },
      }),
      this.prisma.attendance.findMany({
        where: { sectionId, tenantId, date: { gte: new Date(startDate), lte: new Date(endDate) } },
      }),
    ]);

    const byStudent = new Map<string, typeof attendanceRecords>();
    for (const record of attendanceRecords) {
      if (!byStudent.has(record.studentId)) byStudent.set(record.studentId, []);
      byStudent.get(record.studentId)!.push(record);
    }

    const report = students.map(enrollment => ({
      student: enrollment.student,
      summary: this.calculateSummary(enrollment.studentId, byStudent.get(enrollment.studentId) || []),
    }));

    return { sectionId, startDate, endDate, report, totalStudents: students.length };
  }

  async getTodayAttendanceSummary(tenantId: string, schoolId?: string) {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().endOf('day').toDate();

    const [total, byStatus] = await Promise.all([
      this.prisma.attendance.count({ where: { tenantId, date: { gte: today, lte: tomorrow } } }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { tenantId, date: { gte: today, lte: tomorrow } },
        _count: true,
      }),
    ]);

    const statusMap = byStatus.reduce((acc, b) => { acc[b.status] = b._count; return acc; }, {} as any);
    return {
      date: today,
      total,
      present: statusMap['PRESENT'] ?? 0,
      absent: statusMap['ABSENT'] ?? 0,
      late: statusMap['LATE'] ?? 0,
      excused: statusMap['EXCUSED'] ?? 0,
      presentRate: total > 0 ? Math.round(((statusMap['PRESENT'] ?? 0) / total) * 100) : 0,
    };
  }

  async getChronicAbsentees(schoolId: string, tenantId: string, threshold = 75, academicYear: string) {
    const results = await this.prisma.$queryRaw<Array<{
      student_id: string; total_days: number; present_days: number; percentage: number;
    }>>`
      SELECT a.student_id, COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE a.status = 'PRESENT') as present_days,
        ROUND(COUNT(*) FILTER (WHERE a.status = 'PRESENT')::decimal / NULLIF(COUNT(*), 0) * 100, 2) as percentage
      FROM attendances a JOIN students s ON s.id = a.student_id
      WHERE s.school_id = ${schoolId} AND a.tenant_id = ${tenantId}
        AND DATE_PART('year', a.date) = ${parseInt(academicYear.split('-')[0])}
      GROUP BY a.student_id
      HAVING ROUND(COUNT(*) FILTER (WHERE a.status = 'PRESENT')::decimal / NULLIF(COUNT(*), 0) * 100, 2) < ${threshold}
      ORDER BY percentage ASC
    `;
    return results;
  }

  private calculateSummary(studentId: string, records: Array<{ status: AttendanceStatus }>): AttendanceSummary {
    const total   = records.length;
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absent  = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const late    = records.filter(r => r.status === AttendanceStatus.LATE).length;
    const excused = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    return {
      studentId, total, present, absent, late, excused,
      percentage: total > 0 ? Math.round(((present + late * 0.5) / total) * 10000) / 100 : 0,
    };
  }
}
