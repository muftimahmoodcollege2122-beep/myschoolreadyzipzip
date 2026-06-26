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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../database/prisma.service");
const s3_storage_service_1 = require("../../common/storage/s3-storage.service");
const grades_service_1 = require("../grades/grades.service");
const attendance_service_1 = require("../attendance/attendance.service");
let puppeteer;
try {
    puppeteer = require('puppeteer');
}
catch {
    puppeteer = null;
}
let XLSX;
try {
    XLSX = require('xlsx');
}
catch {
    XLSX = null;
}
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(prisma, config, storage, gradesService, attendanceService, reportsQueue) {
        this.prisma = prisma;
        this.config = config;
        this.storage = storage;
        this.gradesService = gradesService;
        this.attendanceService = attendanceService;
        this.reportsQueue = reportsQueue;
        this.logger = new common_1.Logger(ReportsService_1.name);
    }
    async queueReport(job) {
        const queueJob = await this.reportsQueue.add(job.type, job, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 10000 },
            removeOnComplete: 20,
            removeOnFail: 10,
        });
        return String(queueJob.id);
    }
    async generateReportCardPdf(studentId, tenantId, academicYear, term) {
        const reportData = await this.gradesService.getStudentReportCard(studentId, tenantId, academicYear, term);
        const student = await this.prisma.student.findFirst({
            where: { id: studentId, tenantId },
            include: {
                user: { include: { profile: true } },
                enrollments: {
                    where: { isActive: true },
                    include: { section: { include: { class: true } } },
                },
            },
        });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { schools: { take: 1 } },
        });
        const html = this.buildReportCardHtml(reportData, student, tenant);
        const pdfBuffer = await this.htmlToPdf(html);
        const s3Key = `tenants/${tenantId}/report-cards/${academicYear}/${term}/${studentId}.pdf`;
        await this.storage.upload(s3Key, pdfBuffer, 'application/pdf');
        await this.prisma.studentDocument.create({
            data: {
                studentId,
                tenantId,
                name: `Report Card ${academicYear} ${term}`,
                type: 'report_card',
                s3Key,
                s3Bucket: this.config.get('AWS_S3_BUCKET', ''),
                fileSize: pdfBuffer.length,
                mimeType: 'application/pdf',
                academicYear,
                term,
                createdById: studentId,
            },
        });
        this.logger.log(`Report card generated for student ${studentId}: ${s3Key}`);
        return s3Key;
    }
    async exportStudentsToExcel(tenantId, schoolId, filters) {
        const students = await this.prisma.student.findMany({
            where: { tenantId, schoolId, isActive: true },
            include: {
                user: { include: { profile: true } },
                enrollments: {
                    where: { isActive: true },
                    include: { section: { include: { class: true } } },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        const rows = students.map((s) => ({
            'Admission No': s.admissionNo,
            'Roll Number': s.rollNumber,
            'First Name': s.user.profile?.firstName || '',
            'Last Name': s.user.profile?.lastName || '',
            'Email': s.user.email,
            'Gender': s.user.profile?.gender || '',
            'Class': s.enrollments[0]?.section?.class?.name || '',
            'Section': s.enrollments[0]?.section?.name || '',
            'Admission Date': s.admissionDate.toISOString().slice(0, 10),
            'Status': s.isActive ? 'Active' : 'Inactive',
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
        const maxWidths = Object.keys(rows[0] || {}).map((key) => ({
            wch: Math.max(key.length, ...rows.map((r) => String(r[key] || '').length)),
        }));
        worksheet['!cols'] = maxWidths;
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async exportAttendanceCsv(tenantId, sectionId, startDate, endDate) {
        const report = await this.attendanceService.getSectionAttendanceReport(sectionId, tenantId, { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
        const lines = [
            'Student Name,Roll Number,Total Days,Present,Absent,Late,Excused,Percentage',
            ...report.report.map((row) => {
                const name = `${row.student.user.profile?.firstName || ''} ${row.student.user.profile?.lastName || ''}`.trim();
                const s = row.summary;
                return `"${name}",${row.student.rollNumber},${s.total},${s.present},${s.absent},${s.late},${s.excused},${s.percentage}%`;
            }),
        ];
        return lines.join('\n');
    }
    async htmlToPdf(html) {
        if (!puppeteer) {
            this.logger.warn('Puppeteer not available — returning empty PDF. Install puppeteer for PDF generation.');
            return Buffer.from('%PDF-1.4 (placeholder)');
        }
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
            });
            return Buffer.from(pdf);
        }
        finally {
            await browser.close();
        }
    }
    buildReportCardHtml(reportData, student, tenant) {
        const school = tenant?.schools?.[0];
        const profile = student.user?.profile;
        const enrollment = student.enrollments?.[0];
        const subjectRows = reportData.subjects.map((sub) => `
      <tr>
        <td>${sub.subjectName}</td>
        <td>${sub.weightedAverage.toFixed(1)}%</td>
        <td class="grade-${sub.letterGrade.replace('+', 'plus').replace('-', 'minus')}">${sub.letterGrade}</td>
        <td>${sub.gpa.toFixed(2)}</td>
      </tr>
    `).join('');
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #1a1a1a; }
    .header { background: #1a56db; color: white; padding: 24px; display: flex; align-items: center; gap: 16px; }
    .header h1 { font-size: 22px; font-weight: 700; }
    .header p { font-size: 11px; opacity: 0.85; margin-top: 2px; }
    .content { padding: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .info-block label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-block p { font-weight: 600; font-size: 13px; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1e3a5f; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f8fafc; }
    .grade-A, .grade-Aplus { color: #15803d; font-weight: 700; }
    .grade-B, .grade-Bplus { color: #1d4ed8; font-weight: 700; }
    .grade-C, .grade-Cplus { color: #b45309; font-weight: 600; }
    .grade-D { color: #dc2626; font-weight: 600; }
    .grade-F { color: #dc2626; font-weight: 700; }
    .summary-box { background: #eff6ff; border: 2px solid #1a56db; border-radius: 8px; padding: 16px; margin-top: 20px; }
    .summary-box h3 { color: #1a56db; font-size: 13px; margin-bottom: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .summary-item label { font-size: 10px; color: #64748b; }
    .summary-item p { font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    .signature-line { border-top: 1px solid #1a1a1a; width: 150px; margin-top: 40px; padding-top: 4px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${school?.name || 'School'}</h1>
      <p>${school?.address ? JSON.stringify(school.address) : ''} ${school?.phone || ''}</p>
    </div>
  </div>

  <div class="content">
    <h2 style="font-size:16px;margin-bottom:16px;color:#1e3a5f;">
      Academic Report Card — ${reportData.academicYear} | ${reportData.term}
    </h2>

    <div class="info-grid">
      <div class="info-block">
        <label>Student Name</label>
        <p>${profile?.firstName || ''} ${profile?.lastName || ''}</p>
      </div>
      <div class="info-block">
        <label>Roll Number</label>
        <p>${student.rollNumber}</p>
      </div>
      <div class="info-block">
        <label>Admission Number</label>
        <p>${student.admissionNo}</p>
      </div>
      <div class="info-block">
        <label>Class / Section</label>
        <p>${enrollment?.section?.class?.name || '—'} / ${enrollment?.section?.name || '—'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Subject</th>
          <th>Score</th>
          <th>Grade</th>
          <th>GPA Points</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
    </table>

    <div class="summary-box">
      <h3>Academic Summary</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <label>Overall Percentage</label>
          <p>${reportData.overallPercentage.toFixed(1)}%</p>
        </div>
        <div class="summary-item">
          <label>GPA</label>
          <p>${reportData.overallGpa.toFixed(2)}</p>
        </div>
        <div class="summary-item">
          <label>Total Subjects</label>
          <p>${reportData.subjects.length}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:40px;margin-top:40px;">
      <div class="signature-line">Class Teacher</div>
      <div class="signature-line">Principal</div>
      <div class="signature-line">Parent / Guardian</div>
    </div>

    <div class="footer">
      <span>Generated: ${new Date().toLocaleDateString()}</span>
      <span>This is a computer-generated document</span>
      <span>${school?.name || ''}</span>
    </div>
  </div>
</body>
</html>`;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, bull_1.InjectQueue)('reports')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        s3_storage_service_1.S3StorageService,
        grades_service_1.GradesService,
        attendance_service_1.AttendanceService, Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map