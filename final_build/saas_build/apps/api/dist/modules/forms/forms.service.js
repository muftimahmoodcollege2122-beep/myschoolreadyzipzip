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
var FormsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let FormsService = FormsService_1 = class FormsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FormsService_1.name);
    }
    async createForm(dto, tenantId, createdById) {
        return this.prisma.customForm.create({ data: { tenantId, schoolId: dto.schoolId, title: dto.title, description: dto.description, targetRoles: dto.targetRoles ?? [], fields: dto.fields ?? [], isActive: dto.isActive ?? true, isPublic: dto.isPublic ?? false, deadline: dto.deadline ? new Date(dto.deadline) : undefined, createdById } });
    }
    async listForms(tenantId, schoolId) {
        return this.prisma.customForm.findMany({ where: { tenantId, ...(schoolId && { schoolId }), isActive: true }, include: { _count: { select: { responses: true } } }, orderBy: { createdAt: 'desc' } });
    }
    async getForm(id, tenantId) {
        const f = await this.prisma.customForm.findFirst({ where: { id, tenantId } });
        if (!f)
            throw new common_1.NotFoundException('Form not found');
        return f;
    }
    async updateForm(id, dto, tenantId) {
        return this.prisma.customForm.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
    }
    async deleteForm(id, tenantId) {
        return this.prisma.customForm.update({ where: { id }, data: { isActive: false } });
    }
    async submitResponse(formId, data, tenantId, respondentId) {
        const form = await this.prisma.customForm.findFirst({ where: { id: formId, tenantId, isActive: true } });
        if (!form)
            throw new common_1.NotFoundException('Form not found or inactive');
        return this.prisma.formResponse.create({ data: { formId, tenantId, respondentId, data } });
    }
    async getResponses(formId, tenantId) {
        return this.prisma.formResponse.findMany({ where: { formId, tenantId }, orderBy: { submittedAt: 'desc' } });
    }
    async getResponseStats(formId, tenantId) {
        const [form, responses] = await Promise.all([this.prisma.customForm.findFirst({ where: { id: formId, tenantId } }), this.prisma.formResponse.findMany({ where: { formId, tenantId } })]);
        if (!form)
            throw new common_1.NotFoundException('Form not found');
        const fields = form.fields;
        const stats = fields.map(f => {
            const answers = responses.map(r => r.data[f.id]).filter(Boolean);
            const freq = {};
            answers.forEach(a => { freq[String(a)] = (freq[String(a)] || 0) + 1; });
            return { fieldId: f.id, label: f.label, type: f.type, totalAnswers: answers.length, frequency: freq };
        });
        return { form, totalResponses: responses.length, stats };
    }
    async createPolicy(dto, tenantId, createdById) {
        return this.prisma.schoolPolicy.create({ data: { tenantId, schoolId: dto.schoolId, title: dto.title, category: dto.category, content: dto.content, createdById } });
    }
    async listPolicies(tenantId, schoolId, category) {
        return this.prisma.schoolPolicy.findMany({ where: { tenantId, ...(schoolId && { schoolId }), ...(category && { category }), isActive: true }, orderBy: { category: 'asc' } });
    }
    async publishPolicy(id, tenantId) {
        return this.prisma.schoolPolicy.update({ where: { id }, data: { publishedAt: new Date() } });
    }
    async updatePolicy(id, dto, tenantId) {
        return this.prisma.schoolPolicy.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
    }
    async getChecklist(tenantId) {
        const existing = await this.prisma.setupChecklist.findUnique({ where: { tenantId } });
        if (existing)
            return existing;
        const defaultItems = [
            { key: 'school_profile', label: 'Complete school profile', done: false, required: true },
            { key: 'classes', label: 'Create classes and sections', done: false, required: true },
            { key: 'subjects', label: 'Add subjects', done: false, required: true },
            { key: 'teachers', label: 'Add at least one teacher', done: false, required: true },
            { key: 'students', label: 'Add students', done: false, required: true },
            { key: 'fee_structure', label: 'Create fee structure', done: false, required: false },
            { key: 'timetable', label: 'Set up timetable', done: false, required: false },
            { key: 'theme', label: 'Customize school theme', done: false, required: false },
            { key: 'website', label: 'Publish school website', done: false, required: false },
            { key: 'notifications', label: 'Configure notification preferences', done: false, required: false },
        ];
        return this.prisma.setupChecklist.create({ data: { tenantId, items: defaultItems, totalCount: defaultItems.length, completedCount: 0 } });
    }
    async updateChecklistItem(tenantId, key, done) {
        const checklist = await this.getChecklist(tenantId);
        const items = checklist.items;
        const updated = items.map(i => i.key === key ? { ...i, done } : i);
        const completedCount = updated.filter(i => i.done).length;
        const isComplete = updated.filter(i => i.required).every(i => i.done);
        return this.prisma.setupChecklist.update({ where: { tenantId }, data: { items: updated, completedCount, isComplete, lastUpdatedAt: new Date() } });
    }
    async createAcademicRule(dto, tenantId, createdById) {
        return this.prisma.academicRule.create({ data: { tenantId, schoolId: dto.schoolId, type: dto.type, title: dto.title, conditions: dto.conditions ?? {}, actions: dto.actions ?? {}, createdById } });
    }
    async listAcademicRules(tenantId, schoolId, type) {
        return this.prisma.academicRule.findMany({ where: { tenantId, ...(schoolId && { schoolId }), ...(type && { type }), isActive: true } });
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = FormsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map