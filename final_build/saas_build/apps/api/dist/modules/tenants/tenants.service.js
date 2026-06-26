"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../../common/cache/cache.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcryptjs"));
let TenantsService = TenantsService_1 = class TenantsService {
    constructor(prisma, cache, events, audit) {
        this.prisma = prisma;
        this.cache = cache;
        this.events = events;
        this.audit = audit;
        this.logger = new common_1.Logger(TenantsService_1.name);
    }
    async provision(dto) {
        const slug = this.generateSlug(dto.schoolName);
        const existing = await this.prisma.tenant.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException(`A school with this name already exists`);
        const tenantId = (0, crypto_1.randomUUID)();
        const schemaName = `tenant_${slug.replace(/-/g, '_')}`;
        const result = await this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    id: tenantId, name: dto.schoolName, slug,
                    tier: client_1.TenantTier.STARTER, status: client_1.TenantStatus.TRIAL, schemaName,
                    dataRegion: dto.dataRegion || 'ap-south-1',
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    planLimits: { maxStudents: 200, maxTeachers: 20, smsEnabled: false, storageGb: 1 },
                    settings: {
                        timezone: dto.timezone || 'Asia/Karachi',
                        locale: dto.locale || 'en',
                        currency: dto.currency || 'PKR',
                        academicYear: dto.academicYear || this.getCurrentAcademicYear(),
                    },
                },
            });
            const school = await tx.school.create({
                data: {
                    tenantId, name: dto.schoolName,
                    code: slug.slice(0, 10).toUpperCase(),
                    address: dto.address || {},
                    phone: dto.phone, email: dto.adminEmail,
                    timezone: dto.timezone || 'Asia/Karachi',
                    locale: dto.locale || 'en',
                    academicYear: dto.academicYear || this.getCurrentAcademicYear(),
                },
            });
            const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
            const adminUser = await tx.user.create({
                data: {
                    tenantId, email: dto.adminEmail, passwordHash, role: 'SCHOOL_ADMIN', emailVerified: false,
                    profile: { create: { firstName: dto.adminFirstName, lastName: dto.adminLastName, phone: dto.adminPhone } },
                },
            });
            await tx.outboxEvent.create({
                data: {
                    tenantId, topic: 'tenant.provisioned', key: tenantId,
                    payload: { tenantId, slug, schoolName: dto.schoolName, adminEmail: dto.adminEmail, adminUserId: adminUser.id, schoolId: school.id },
                    headers: { source: 'onboarding' },
                },
            });
            return { tenantId, slug, adminUserId: adminUser.id, schemaName, schoolId: school.id };
        });
        await this.audit.log({ tenantId, action: 'CREATE', entity: 'Tenant', entityId: tenantId, after: { slug, schoolName: dto.schoolName } });
        this.logger.log(`Tenant provisioned: ${slug} (${tenantId})`);
        return result;
    }
    async findById(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { schools: {} },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant;
    }
    async updateConfig(tenantId, config) {
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...(config.logoUrl && { logoUrl: config.logoUrl }),
                ...(config.primaryColor && { primaryColor: config.primaryColor }),
                ...(config.customDomain && { customDomain: config.customDomain }),
            },
        });
        const t = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
        if (t)
            await this.cache.del(`tenant:${t.slug}`);
    }
    async suspend(tenantId) {
        await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: client_1.TenantStatus.SUSPENDED, suspendedAt: new Date() } });
        await this.cache.delPattern('tenant:*');
        this.logger.warn(`Tenant suspended: ${tenantId}`);
    }
    async reactivate(tenantId) {
        await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: client_1.TenantStatus.ACTIVE, suspendedAt: null } });
        await this.cache.delPattern('tenant:*');
    }
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 50)
            .replace(/^-|-$/g, '');
    }
    getCurrentAcademicYear() {
        const now = new Date();
        const year = now.getFullYear();
        return now.getMonth() + 1 >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService,
        event_publisher_service_1.EventPublisher,
        audit_service_1.AuditService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map