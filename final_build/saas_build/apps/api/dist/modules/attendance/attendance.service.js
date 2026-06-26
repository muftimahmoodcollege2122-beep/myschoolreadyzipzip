"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const audit_service_1 = require("../../common/audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const prisma_enums_1 = require("../../common/prisma-enums");
;
const dayjs_1 = __importDefault(require("dayjs"));
let AttendanceService = AttendanceService_1 = class AttendanceService {
    constructor(prisma, events, audit, notifications) {
        this.prisma = prisma;
        this.events = events;
        this.audit = audit;
        this.notifications = notifications;
        this.logger = new common_1.Logger(AttendanceService_1.name);
    }
    async markSectionAttendance(sectionId, tenantId, teacherId, records) {
        const date = (0, dayjs_1.default)().startOf('day').toDate();
        const section = await this.prisma.section.findFirst({
            where: { id: sectionId, tenantId },
            include: { class: true },
        });
        if (!section)
            throw new common_1.NotFoundException(`Section ${sectionId} not found`);
        await this.prisma.$transaction(async (tx) => {
            const upserts = records.map((record) => tx.attendance.upsert({
                where: { studentId_sectionId_date: { studentId: record.studentId, sectionId, date } },
                create: { studentId: record.studentId, sectionId, tenantId, date, status: record.status, markedById: teacherId, remarks: record.remarks },
                update: { status: record.status, markedById: teacherId, remarks: record.remarks, markedAt: new Date() },
            }));
            await Promise.all(upserts);
            const absentStudents = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.ABSENT);
            const lateStudents = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.LATE);
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
        const absentCount = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.ABSENT).length;
        const lateCount = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.LATE).length;
        this.logger.log(`Attendance marked for section ${sectionId}: ${records.length} students (${absentCount} absent, ${lateCount} late)`);
        return { marked: records.length, absentCount, lateCount };
    }
    async getStudentAttendance(studentId, tenantId, startDate, endDate) {
        const records = await this.prisma.attendance.findMany({
            where: { studentId, tenantId, date: { gte: startDate, lte: endDate } },
            orderBy: { date: 'desc' },
        });
        const summary = this.calculateSummary(studentId, records);
        return { records, summary };
    }
    async getSectionAttendanceReport(sectionId, tenantId, query) {
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
        const byStudent = new Map();
        for (const record of attendanceRecords) {
            if (!byStudent.has(record.studentId))
                byStudent.set(record.studentId, []);
            byStudent.get(record.studentId).push(record);
        }
        const report = students.map(enrollment => ({
            student: enrollment.student,
            summary: this.calculateSummary(enrollment.studentId, byStudent.get(enrollment.studentId) || []),
        }));
        return { sectionId, startDate, endDate, report, totalStudents: students.length };
    }
    async getTodayAttendanceSummary(tenantId, schoolId) {
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        const tomorrow = (0, dayjs_1.default)().endOf('day').toDate();
        const [total, byStatus] = await Promise.all([
            this.prisma.attendance.count({ where: { tenantId, date: { gte: today, lte: tomorrow } } }),
            this.prisma.attendance.groupBy({
                by: ['status'],
                where: { tenantId, date: { gte: today, lte: tomorrow } },
                _count: true,
            }),
        ]);
        const statusMap = byStatus.reduce((acc, b) => { acc[b.status] = b._count; return acc; }, {});
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
    async getChronicAbsentees(schoolId, tenantId, threshold = 75, academicYear) {
        const results = await this.prisma.$queryRaw `
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
    calculateSummary(studentId, records) {
        const total = records.length;
        const present = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.PRESENT).length;
        const absent = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.ABSENT).length;
        const late = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.LATE).length;
        const excused = records.filter(r => r.status === prisma_enums_1.AttendanceStatus.EXCUSED).length;
        return {
            studentId, total, present, absent, late, excused,
            percentage: total > 0 ? Math.round(((present + late * 0.5) / total) * 10000) / 100 : 0,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_publisher_service_1.EventPublisher,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map