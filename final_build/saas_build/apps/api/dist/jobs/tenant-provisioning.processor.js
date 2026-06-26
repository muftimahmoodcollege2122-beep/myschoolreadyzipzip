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
var TenantProvisioningProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantProvisioningProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const cache_service_1 = require("../common/cache/cache.service");
let TenantProvisioningProcessor = TenantProvisioningProcessor_1 = class TenantProvisioningProcessor {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
        this.logger = new common_1.Logger(TenantProvisioningProcessor_1.name);
    }
    async handleProvision(job) {
        const { tenantId, slug, schoolName, adminUserId } = job.data;
        this.logger.log(`Provisioning tenant ${slug} (${tenantId})`);
        await job.progress(10);
        const now = new Date();
        const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        const academicYear = `${year}-${year + 1}`;
        const school = await this.prisma.school.findFirst({ where: { tenantId } });
        if (!school)
            throw new Error(`School not found for tenant ${tenantId}`);
        await job.progress(30);
        const classes = [];
        for (let i = 1; i <= 12; i++) {
            classes.push({
                tenantId,
                schoolId: school.id,
                name: `Grade ${i}`,
                level: i,
                academicYear,
            });
        }
        await this.prisma.class.createMany({ data: classes, skipDuplicates: true });
        await job.progress(60);
        const subjects = [
            { name: 'Mathematics', code: 'MATH', isElective: false },
            { name: 'English', code: 'ENG', isElective: false },
            { name: 'Urdu', code: 'URD', isElective: false },
            { name: 'Science', code: 'SCI', isElective: false },
            { name: 'Islamiat', code: 'ISL', isElective: false },
            { name: 'Social Studies', code: 'SST', isElective: false },
            { name: 'Computer Science', code: 'CS', isElective: true },
            { name: 'Physics', code: 'PHY', isElective: true },
            { name: 'Chemistry', code: 'CHEM', isElective: true },
            { name: 'Biology', code: 'BIO', isElective: true },
        ];
        await this.prisma.subject.createMany({
            data: subjects.map(s => ({ tenantId, schoolId: school.id, creditHours: 1, ...s })),
            skipDuplicates: true,
        });
        await job.progress(80);
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant)
            await this.cache.set(`tenant:${slug}`, tenant, 300);
        await job.progress(100);
        this.logger.log(`Tenant ${slug} provisioned successfully`);
    }
    onFailed(job, err) {
        this.logger.error(`Tenant provisioning failed for ${job.data.slug}: ${err.message}`);
    }
    onCompleted(job) {
        this.logger.log(`Tenant provisioning completed: ${job.data.slug}`);
    }
};
exports.TenantProvisioningProcessor = TenantProvisioningProcessor;
__decorate([
    (0, bull_1.Process)('provision'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantProvisioningProcessor.prototype, "handleProvision", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], TenantProvisioningProcessor.prototype, "onFailed", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantProvisioningProcessor.prototype, "onCompleted", null);
exports.TenantProvisioningProcessor = TenantProvisioningProcessor = TenantProvisioningProcessor_1 = __decorate([
    (0, bull_1.Processor)('tenant-provisioning'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], TenantProvisioningProcessor);
//# sourceMappingURL=tenant-provisioning.processor.js.map