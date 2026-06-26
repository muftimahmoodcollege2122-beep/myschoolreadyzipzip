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
var ScheduledJobs_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../modules/notifications/notifications.service");
let ScheduledJobs = ScheduledJobs_1 = class ScheduledJobs {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.logger = new common_1.Logger(ScheduledJobs_1.name);
    }
    async sendFeeReminders() {
        this.logger.log('Fee reminder job running');
        const nowOverdue = await this.prisma.feeInvoice.updateMany({
            where: { status: 'PENDING', dueDate: { lt: new Date() } },
            data: { status: 'OVERDUE' },
        });
        this.logger.log(`Marked ${nowOverdue.count} invoices as OVERDUE`);
        const overdue = await this.prisma.feeInvoice.findMany({
            where: { status: { in: ['OVERDUE', 'PARTIAL'] }, dueDate: { lt: new Date() } },
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
                const studentPhone = inv.student.user.profile?.phone;
                if (studentPhone) {
                    await this.notifications.queueSms(studentPhone, inv.tenantId, msg);
                    smsCount++;
                }
                for (const link of inv.student.parents || []) {
                    const parentPhone = link.parent?.user?.profile?.phone;
                    if (parentPhone) {
                        await this.notifications.queueSms(parentPhone, inv.tenantId, msg);
                        smsCount++;
                    }
                }
                await this.notifications.sendInApp(inv.student.userId, inv.tenantId, '⚠️ Fee Overdue', `Your fee of Rs.${amount.toLocaleString()} (${inv.invoiceNo}) is overdue by ${daysOverdue} day(s).`, { invoiceId: inv.id, type: 'fee_overdue' });
            }
            catch (e) {
                this.logger.error(`Fee reminder failed for invoice ${inv.id}: ${e}`);
            }
        }
        this.logger.log(`Sent ${smsCount} fee reminder SMS for ${overdue.length} invoices`);
    }
    async processAbsenceAlerts() {
        const events = await this.prisma.outboxEvent.findMany({
            where: { topic: 'attendance.marked', status: 'PENDING' },
            take: 50,
            orderBy: { createdAt: 'asc' },
        });
        for (const event of events) {
            try {
                const payload = event.payload;
                const absentIds = payload.absentStudentIds || [];
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
                        for (const link of student.parents || []) {
                            const parentPhone = link.parent?.user?.profile?.phone;
                            if (parentPhone)
                                await this.notifications.queueSms(parentPhone, event.tenantId, msg);
                            await this.notifications.sendInApp(link.parent.userId, event.tenantId, `📵 ${name} Absent Today`, msg, { studentId: student.id, date: payload.date, type: 'absence_alert' });
                        }
                        await this.notifications.sendInApp(student.userId, event.tenantId, '📵 Absence Recorded', `Your attendance was marked ABSENT on ${date}.`, { date: payload.date, type: 'absence_alert' });
                    }
                }
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { status: 'SENT', sentAt: new Date() },
                });
            }
            catch (e) {
                this.logger.error(`Absence alert failed for event ${event.id}: ${e}`);
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { attempts: { increment: 1 } },
                });
            }
        }
    }
    async processResultPublishNotifications() {
        const events = await this.prisma.outboxEvent.findMany({
            where: { topic: 'exam.results_published', status: 'PENDING' },
            take: 20,
            orderBy: { createdAt: 'asc' },
        });
        for (const event of events) {
            try {
                const payload = event.payload;
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
                if (!exam)
                    continue;
                for (const result of exam.results) {
                    const student = result.student;
                    const name = `${student.user.profile?.firstName || ''} ${student.user.profile?.lastName || ''}`.trim();
                    const pct = Math.round((Number(result.marksObtained) / Number(exam.maxMarks)) * 100);
                    const passed = Number(result.marksObtained) >= Number(exam.passingMarks || 0);
                    await this.notifications.sendInApp(student.userId, event.tenantId, `📊 ${exam.name} Results Published`, `You scored ${result.marksObtained}/${exam.maxMarks} (${pct}%) — Grade: ${result.grade}. ${passed ? '✅ Passed' : '❌ Failed'}`, { examId: exam.id, resultId: result.id, type: 'result_published' });
                    const msg = `Dear Parent, ${name}'s result for ${exam.name} (${exam.subject?.name}): ${result.marksObtained}/${exam.maxMarks} — ${result.grade}. ${passed ? 'PASSED ✅' : 'FAILED ❌'}`;
                    for (const link of student.parents || []) {
                        const parentPhone = link.parent?.user?.profile?.phone;
                        if (parentPhone)
                            await this.notifications.queueSms(parentPhone, event.tenantId, msg);
                        await this.notifications.sendInApp(link.parent.userId, event.tenantId, `📊 ${name}'s Result: ${exam.name}`, msg, { examId: exam.id, studentId: student.id, type: 'result_published' });
                    }
                }
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { status: 'SENT', sentAt: new Date() },
                });
                this.logger.log(`Result notifications sent for exam ${payload.examId}: ${exam.results.length} students`);
            }
            catch (e) {
                this.logger.error(`Result notification failed for event ${event.id}: ${e}`);
                await this.prisma.outboxEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
            }
        }
    }
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
                if (total === 0)
                    continue;
                const present = records.filter(r => r.status === 'PRESENT').length;
                const absent = records.filter(r => r.status === 'ABSENT').length;
                const pct = Math.round((present / total) * 100);
                const name = `${student.user.profile?.firstName || ''} ${student.user.profile?.lastName || ''}`.trim();
                if (pct < 80 || absent > 1) {
                    const msg = `Weekly Attendance Report for ${name}: Present ${present}/${total} days (${pct}%). ${absent > 0 ? `Absent: ${absent} day(s).` : ''} ${pct < 75 ? '⚠️ Attendance is below 75% — action required.' : ''}`;
                    for (const link of student.parents || []) {
                        const parentPhone = link.parent?.user?.profile?.phone;
                        if (parentPhone)
                            await this.notifications.queueSms(parentPhone, enrollment.tenantId, msg);
                        await this.notifications.sendInApp(link.parent.userId, enrollment.tenantId, `📅 Weekly Attendance: ${name}`, msg, { studentId: student.id, week: weekStart.toISOString(), type: 'weekly_attendance' });
                    }
                }
            }
            catch (e) {
                this.logger.error(`Weekly summary failed for enrollment ${enrollment.id}: ${e}`);
            }
        }
    }
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
    async processTimetableChangeNotifications() {
        const events = await this.prisma.outboxEvent.findMany({
            where: { topic: 'timetable.changed', status: 'PENDING' },
            take: 20,
        });
        for (const event of events) {
            try {
                const payload = event.payload;
                const section = await this.prisma.section.findFirst({
                    where: { id: payload.sectionId, tenantId: event.tenantId },
                    include: {
                        enrollments: {
                            where: { isActive: true },
                            include: { student: { include: { user: true, parents: { include: { parent: { include: { user: true } } } } } } },
                        },
                    },
                });
                if (!section)
                    continue;
                for (const enrollment of section.enrollments) {
                    await this.notifications.sendInApp(enrollment.student.userId, event.tenantId, '🗓️ Timetable Updated', payload.message || 'Your class timetable has been updated. Please check the latest schedule.', { sectionId: payload.sectionId, type: 'timetable_change' });
                    for (const link of enrollment.student.parents || []) {
                        await this.notifications.sendInApp(link.parent.userId, event.tenantId, '🗓️ Timetable Updated', payload.message || `Timetable updated for ${section.name}.`, { sectionId: payload.sectionId, type: 'timetable_change' });
                    }
                }
                await this.prisma.outboxEvent.update({ where: { id: event.id }, data: { status: 'SENT', sentAt: new Date() } });
            }
            catch (e) {
                this.logger.error(`Timetable notification failed: ${e}`);
            }
        }
    }
    async pendingLeaveReminders() {
        const pending = await this.prisma.leaveRequest.findMany({
            where: { status: 'PENDING', createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            include: { teacher: { include: { user: { include: { profile: true } } } } },
            take: 100,
        });
        for (const leave of pending) {
            try {
                const admin = await this.prisma.user.findFirst({
                    where: { tenantId: leave.tenantId, role: 'SCHOOL_ADMIN', isActive: true },
                });
                if (!admin)
                    continue;
                const teacherName = `${leave.teacher.user.profile?.firstName || ''} ${leave.teacher.user.profile?.lastName || ''}`.trim();
                await this.notifications.sendInApp(admin.id, leave.tenantId, '⏳ Pending Leave Approval', `${teacherName}'s leave request (${leave.leaveType}) from ${new Date(leave.startDate).toLocaleDateString()} is awaiting your approval.`, { leaveId: leave.id, type: 'leave_pending' });
            }
            catch (e) {
                this.logger.error(`Leave reminder failed: ${e}`);
            }
        }
    }
    async libraryOverdueAlerts() {
        this.logger.log('Library overdue job running');
        const overdue = await this.prisma.bookIssue.findMany({
            where: { returnedAt: null, dueDate: { lt: new Date() } },
            include: {
                book: true,
                user: { include: { profile: true } },
            },
            take: 500,
        });
        for (const issue of overdue) {
            try {
                const daysOverdue = Math.floor((Date.now() - issue.dueDate.getTime()) / 86400000);
                const userName = `${issue.user.profile?.firstName || ''} ${issue.user.profile?.lastName || ''}`.trim();
                const fine = daysOverdue * 5;
                await this.notifications.sendInApp(issue.userId, issue.tenantId, '📚 Library Book Overdue', `"${issue.book.title}" was due ${daysOverdue} day(s) ago. Fine: Rs. ${fine}. Please return immediately to avoid further charges.`, { bookIssueId: issue.id, type: 'library_overdue' });
                const phone = issue.user.profile?.phone;
                if (phone) {
                    await this.notifications.queueSms(phone, issue.tenantId, `Library Alert: "${issue.book.title}" is overdue by ${daysOverdue} day(s). Fine: Rs. ${fine}. Return immediately to avoid suspension of library privileges.`);
                }
            }
            catch (e) {
                this.logger.error(`Library overdue alert failed for issue ${issue.id}: ${e}`);
            }
        }
        this.logger.log(`Library overdue alerts sent for ${overdue.length} books`);
    }
    async autoDropoutRiskAlerts() {
        this.logger.log('Dropout risk auto-alert job running');
        const tenants = await this.prisma.tenant.findMany({ where: { status: { in: ['ACTIVE', 'TRIAL'] } }, select: { id: true } });
        for (const tenant of tenants) {
            try {
                const students = await this.prisma.student.findMany({
                    where: { tenantId: tenant.id, isActive: true },
                    include: {
                        attendances: { take: 60, orderBy: { date: 'desc' } },
                        feeInvoices: { where: { status: { in: ['PENDING', 'OVERDUE'] } } },
                        user: { include: { profile: true } },
                    },
                });
                const highRisk = students.filter(s => {
                    const total = s.attendances.length || 1;
                    const present = s.attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
                    const attRate = (present / total) * 100;
                    const riskScore = Math.max(0, Math.min(100, (100 - attRate) * 0.6 + s.feeInvoices.length * 10));
                    return riskScore >= 70;
                });
                if (highRisk.length > 0) {
                    const admin = await this.prisma.user.findFirst({ where: { tenantId: tenant.id, role: 'SCHOOL_ADMIN', isActive: true } });
                    if (admin) {
                        const names = highRisk.slice(0, 5).map(s => `${s.user.profile?.firstName} ${s.user.profile?.lastName}`).join(', ');
                        await this.notifications.sendInApp(admin.id, tenant.id, `🚨 ${highRisk.length} High-Risk Students This Week`, `AI Alert: ${names}${highRisk.length > 5 ? ` and ${highRisk.length - 5} more` : ''} are at HIGH dropout risk. Immediate parent contact recommended.`, { type: 'dropout_risk_weekly', count: highRisk.length });
                    }
                }
            }
            catch (e) {
                this.logger.error(`Dropout risk alert failed for tenant ${tenant.id}: ${e}`);
            }
        }
    }
};
exports.ScheduledJobs = ScheduledJobs;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "sendFeeReminders", null);
__decorate([
    (0, schedule_1.Cron)('*/30 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "processAbsenceAlerts", null);
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "processResultPublishNotifications", null);
__decorate([
    (0, schedule_1.Cron)('0 7 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "weeklyAttendanceSummary", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "autoMarkAbsent", null);
__decorate([
    (0, schedule_1.Cron)('*/10 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "processTimetableChangeNotifications", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "pendingLeaveReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "libraryOverdueAlerts", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobs.prototype, "autoDropoutRiskAlerts", null);
exports.ScheduledJobs = ScheduledJobs = ScheduledJobs_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ScheduledJobs);
//# sourceMappingURL=scheduled.jobs.js.map