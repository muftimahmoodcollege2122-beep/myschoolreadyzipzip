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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../../common/cache/cache.service");
let SearchService = SearchService_1 = class SearchService {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async globalSearch(query, tenantId, limit = 20) {
        if (!query || query.trim().length < 2)
            return { students: [], teachers: [], results: [] };
        const cacheKey = `search:${tenantId}:${Buffer.from(query).toString('base64').slice(0, 20)}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const q = query.toLowerCase().trim();
        const [students, teachers, exams] = await Promise.all([
            this.prisma.$queryRaw `
        SELECT s.id, s.roll_number, up.first_name, up.last_name, u.email
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN user_profiles up ON up.user_id = u.id
        WHERE s.tenant_id = ${tenantId}::uuid AND s.is_active = true
        AND (
          LOWER(up.first_name) LIKE ${'%' + q + '%'}
          OR LOWER(up.last_name) LIKE ${'%' + q + '%'}
          OR LOWER(s.roll_number) LIKE ${'%' + q + '%'}
          OR LOWER(u.email) LIKE ${'%' + q + '%'}
          OR LOWER(CONCAT(up.first_name,' ',up.last_name)) LIKE ${'%' + q + '%'}
        )
        LIMIT ${limit}
      `,
            this.prisma.$queryRaw `
        SELECT t.id, t.employee_id, up.first_name, up.last_name, u.email
        FROM teachers t
        JOIN users u ON u.id = t.user_id
        JOIN user_profiles up ON up.user_id = u.id
        WHERE t.tenant_id = ${tenantId}::uuid AND t.is_active = true
        AND (
          LOWER(up.first_name) LIKE ${'%' + q + '%'}
          OR LOWER(up.last_name) LIKE ${'%' + q + '%'}
          OR LOWER(t.employee_id) LIKE ${'%' + q + '%'}
        )
        LIMIT ${limit}
      `,
            this.prisma.exam.findMany({
                where: { tenantId, name: { contains: q, mode: 'insensitive' } },
                include: { subject: true },
                take: 5,
            }),
        ]);
        const result = { students, teachers, exams };
        await this.cache.set(cacheKey, result, 60);
        return result;
    }
    async studentSearch(query, tenantId, filters = {}) {
        const where = {
            tenantId, isActive: true,
            ...(filters.classId && { enrollments: { some: { section: { classId: filters.classId } } } }),
            ...(filters.sectionId && { enrollments: { some: { sectionId: filters.sectionId } } }),
        };
        if (query) {
            where.OR = [
                { rollNumber: { contains: query, mode: 'insensitive' } },
                { user: { profile: { firstName: { contains: query, mode: 'insensitive' } } } },
                { user: { profile: { lastName: { contains: query, mode: 'insensitive' } } } },
                { user: { email: { contains: query, mode: 'insensitive' } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.student.findMany({ where, include: { user: { include: { profile: true } }, enrollments: { include: { section: { include: { class: true } } } } }, take: 20 }),
            this.prisma.student.count({ where }),
        ]);
        return { data, total };
    }
    async getAttendanceAnalytics(tenantId, schoolId, from, to) {
        const cacheKey = `analytics:attendance:${tenantId}:${from}:${to}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const result = await this.prisma.$queryRaw `
      SELECT
        date,
        COUNT(*) FILTER (WHERE status = 'PRESENT') as present,
        COUNT(*) FILTER (WHERE status = 'ABSENT')  as absent,
        COUNT(*) FILTER (WHERE status = 'LATE')    as late,
        COUNT(*) as total,
        ROUND(COUNT(*) FILTER (WHERE status = 'PRESENT')::numeric / NULLIF(COUNT(*),0) * 100, 1) as rate
      FROM attendance_records
      WHERE tenant_id = ${tenantId}::uuid
        AND date BETWEEN ${from} AND ${to}
      GROUP BY date
      ORDER BY date ASC
    `;
        await this.cache.set(cacheKey, result, 300);
        return result;
    }
    async getFeeAnalytics(tenantId, schoolId, year) {
        const cacheKey = `analytics:fees:${tenantId}:${year}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const result = await this.prisma.$queryRaw `
      SELECT
        EXTRACT(MONTH FROM created_at) as month,
        SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as collected,
        SUM(CASE WHEN status IN ('PENDING','OVERDUE') THEN amount ELSE 0 END) as outstanding,
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE status = 'PAID') as paid_count,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_count
      FROM fee_invoices
      WHERE tenant_id = ${tenantId}::uuid
        AND EXTRACT(YEAR FROM created_at) = ${year}
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month ASC
    `;
        await this.cache.set(cacheKey, result, 600);
        return result;
    }
    async getEnrollmentTrend(tenantId, schoolId) {
        const cacheKey = `analytics:enrollment:${tenantId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const result = await this.prisma.$queryRaw `
      SELECT
        DATE_TRUNC('month', admission_date) as month,
        COUNT(*) as new_students,
        SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', admission_date)) as cumulative
      FROM students
      WHERE tenant_id = ${tenantId}::uuid
        AND admission_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', admission_date)
      ORDER BY month ASC
    `;
        await this.cache.set(cacheKey, result, 3600);
        return result;
    }
    async getExamPerformanceAnalytics(tenantId, sectionId, academicYear) {
        return this.prisma.$queryRaw `
      SELECT
        e.name,
        e.exam_type,
        e.max_marks,
        COUNT(er.id) as total_students,
        ROUND(AVG(er.marks_obtained), 1) as avg_marks,
        MAX(er.marks_obtained) as highest,
        MIN(er.marks_obtained) as lowest,
        ROUND(COUNT(er.id) FILTER (WHERE er.marks_obtained >= e.passing_marks)::numeric / NULLIF(COUNT(er.id),0) * 100, 1) as pass_rate
      FROM exams e
      LEFT JOIN exam_results er ON er.exam_id = e.id
      WHERE e.tenant_id = ${tenantId}::uuid
        AND e.academic_year = ${academicYear}
        AND e.is_published = true
      GROUP BY e.id, e.name, e.exam_type, e.max_marks
      ORDER BY e.scheduled_at ASC
    `;
    }
    async getPlatformAnalytics() {
        const [tenantGrowth, planDistribution, activeToday, topSchools] = await Promise.all([
            this.prisma.$queryRaw `
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as new_tenants
        FROM tenants WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at) ORDER BY month ASC
      `,
            this.prisma.tenant.groupBy({ by: ['tier'], _count: { tier: true } }),
            this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.$queryRaw `
        SELECT t.id, t.name, t.tier,
          COUNT(DISTINCT s.id) as student_count,
          COUNT(DISTINCT tc.id) as teacher_count
        FROM tenants t
        LEFT JOIN students s ON s.tenant_id = t.id
        LEFT JOIN teachers tc ON tc.tenant_id = t.id
        WHERE t.status = 'ACTIVE'
        GROUP BY t.id, t.name, t.tier
        ORDER BY student_count DESC LIMIT 10
      `,
        ]);
        return { tenantGrowth, planDistribution, activeToday, topSchools };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cache_service_1.CacheService])
], SearchService);
//# sourceMappingURL=search.service.js.map