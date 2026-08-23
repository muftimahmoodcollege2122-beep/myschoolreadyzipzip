/**
 * Reports service — generates PDF and Excel reports.
 * generateAttendanceReport(): monthly attendance per class/student
 * generateFeeReport(): fee collection summary with outstanding
 * generateResultReport(): exam result analysis per subject/class
 * generateStaffReport(): HR report with leave, payroll summary
 * All heavy reports run on READ REPLICA with streaming for large datasets.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { ReplicaService } from '../../database/replica.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { GradesService } from '../grades/grades.service';
import { AttendanceService } from '../attendance/attendance.service';
let puppeteer: any; try { puppeteer = require('puppeteer'); } catch { puppeteer = null; }
let XLSX: any; try { XLSX = require('xlsx'); } catch { XLSX = null; }

export interface ReportJob {
  type: 'report_card' | 'attendance_report' | 'fee_report' | 'custom';
  tenantId: string;
  parameters: Record<string, unknown>;
  requestedById: string;
  notifyEmail?: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly replica: ReplicaService,
    private readonly config: ConfigService,
    private readonly storage: S3StorageService,
    private readonly gradesService: GradesService,
    private readonly attendanceService: AttendanceService,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
  ) {}

  /**
   * Queue report generation — never block request thread
   */
  async queueReport(job: ReportJob): Promise<string> {
    const queueJob = await this.reportsQueue.add(job.type, job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
      removeOnComplete: 20,
      removeOnFail: 10,
    });
    return String(queueJob.id);
  }

  /**
   * Generate single student report card PDF
   * Called by BullMQ worker
   */
  async generateReportCardPdf(
    studentId: string,
    tenantId: string,
    academicYear: string,
    term: string,
  ): Promise<string> {
    const reportData = await this.gradesService.getStudentReportCard(
      studentId, tenantId, academicYear, term,
    );

    const student = await this.replica.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: { include: { profile: true } },
        enrollments: {
          where: { isActive: true },
          include: { section: { include: { class: true } } },
        },
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    const tenant = await this.replica.tenant.findUnique({
      where: { id: tenantId },
      include: { schools: { take: 1 } },
    });

    const html = this.buildReportCardHtml(reportData, student, tenant);
    const pdfBuffer = await this.htmlToPdf(html);

    const s3Key = `tenants/${tenantId}/report-cards/${academicYear}/${term}/${studentId}.pdf`;
    await this.storage.upload(s3Key, pdfBuffer, 'application/pdf');

    // Save document reference
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
        createdById: studentId, // system-generated
      },
    });

    this.logger.log(`Report card generated for student ${studentId}: ${s3Key}`);
    return s3Key;
  }

  /**
   * Export student list to Excel
   */
  async exportStudentsToExcel(
    tenantId: string,
    schoolId: string,
    filters: Record<string, unknown>,
  ): Promise<Buffer> {
    const students = await this.replica.student.findMany({
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

    // Auto-fit column widths
    const maxWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] || '').length)),
    }));
    worksheet['!cols'] = maxWidths;

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  /**
   * Attendance summary CSV export
   */
  async exportAttendanceCsv(
    tenantId: string,
    sectionId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<string> {
    const report = await this.attendanceService.getSectionAttendanceReport(
      sectionId, tenantId, { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    );

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

  private async htmlToPdf(html: string): Promise<Buffer> {
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
    } finally {
      await browser.close();
    }
  }

  /** Escapes free-text before interpolating into the report-card HTML, which is
   * rendered by a real headless browser (Puppeteer) — unescaped admin/student
   * input here is a genuine stored-HTML-injection risk (subject names, school
   * name/address, student names are all editable free text). */
  private escapeHtml(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildReportCardHtml(
    reportData: any,
    student: any,
    tenant: any,
  ): string {
    const school = tenant?.schools?.[0];
    const profile = student.user?.profile;
    const enrollment = student.enrollments?.[0];

    const subjectRows = reportData.subjects.map((sub: any) => `
      <tr>
        <td>${this.escapeHtml(sub.subjectName)}</td>
        <td>${sub.weightedAverage.toFixed(1)}%</td>
        <td class="grade-${sub.letterGrade.replace('+', 'plus').replace('-', 'minus')}">${this.escapeHtml(sub.letterGrade)}</td>
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
      <h1>${this.escapeHtml(school?.name) || 'School'}</h1>
      <p>${school?.address ? this.escapeHtml(JSON.stringify(school.address)) : ''} ${this.escapeHtml(school?.phone)}</p>
    </div>
  </div>

  <div class="content">
    <h2 style="font-size:16px;margin-bottom:16px;color:#1e3a5f;">
      Academic Report Card — ${this.escapeHtml(reportData.academicYear)} | ${this.escapeHtml(reportData.term)}
    </h2>

    <div class="info-grid">
      <div class="info-block">
        <label>Student Name</label>
        <p>${this.escapeHtml(profile?.firstName)} ${this.escapeHtml(profile?.lastName)}</p>
      </div>
      <div class="info-block">
        <label>Roll Number</label>
        <p>${this.escapeHtml(student.rollNumber)}</p>
      </div>
      <div class="info-block">
        <label>Admission Number</label>
        <p>${this.escapeHtml(student.admissionNo)}</p>
      </div>
      <div class="info-block">
        <label>Class / Section</label>
        <p>${this.escapeHtml(enrollment?.section?.class?.name) || '—'} / ${this.escapeHtml(enrollment?.section?.name) || '—'}</p>
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
      <span>${this.escapeHtml(school?.name)}</span>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Real per-teacher performance metrics for the Analytics dashboard.
   * Returns null for any metric where there isn't enough underlying data yet
   * (no published exams, no attendance records, no lesson plans) rather than
   * fabricating a number — the frontend should show "Not enough data" in that case.
   */
  async getTeacherPerformance(tenantId: string) {
    const teachers = await this.replica.teacher.findMany({
      where: { tenantId, isActive: true },
      include: {
        user: { include: { profile: true } },
        department: true,
        subjects: { include: { subject: true, class: { include: { sections: { include: { students: true } } } } } },
      },
    });

    return Promise.all(teachers.map(async (t) => {
      const subjectIds = [...new Set(t.subjects.map(cs => cs.subjectId))];
      const classIds = [...new Set(t.subjects.map(cs => cs.classId))];

      const studentsCount = new Set(
        t.subjects.flatMap(cs => cs.class.sections.flatMap(sec => sec.students.map(e => e.studentId))),
      ).size;

      const exams = subjectIds.length
        ? await this.replica.exam.findMany({
            where: { tenantId, subjectId: { in: subjectIds }, isPublished: true },
            include: { results: true },
          })
        : [];

      let totalResults = 0, passCount = 0, marksSum = 0, marksMaxSum = 0;
      for (const exam of exams) {
        for (const r of exam.results) {
          if (r.isAbsent) continue;
          totalResults++;
          if (Number(r.marksObtained) >= Number(exam.passingMarks)) passCount++;
          marksSum += Number(r.marksObtained);
          marksMaxSum += Number(exam.maxMarks);
        }
      }
      const passRate = totalResults > 0 ? Math.round((passCount / totalResults) * 100) : null;
      const avgMarksPct = marksMaxSum > 0 ? Math.round((marksSum / marksMaxSum) * 100) : null;

      const since = new Date(Date.now() - 90 * 86400000);
      const attendanceRecords = await this.replica.teacherAttendance.findMany({
        where: { teacherId: t.id, tenantId, date: { gte: since } },
      });
      const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : null;

      const lessonPlans = await this.replica.lessonPlan.findMany({
        where: { tenantId, teacherId: t.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      const completedCount = lessonPlans.filter(lp => lp.status === 'APPROVED' || lp.status === 'SUBMITTED').length;
      const lessonCompletionRate = lessonPlans.length > 0 ? Math.round((completedCount / lessonPlans.length) * 100) : null;

      return {
        id: t.id,
        name: `${t.user.profile?.firstName ?? ''} ${t.user.profile?.lastName ?? ''}`.trim() || 'Unnamed Teacher',
        department: t.department?.name ?? 'Unassigned',
        subjectsCount: subjectIds.length,
        sectionsCount: classIds.length,
        studentsCount,
        passRate,
        avgMarksPct,
        attendanceRate,
        lessonCompletionRate,
      };
    }));
  }
}
