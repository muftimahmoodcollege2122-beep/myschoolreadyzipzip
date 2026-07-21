import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createForm(dto: any, tenantId: string, createdById: string) {
    return this.prisma.customForm.create({ data: { tenantId, schoolId: dto.schoolId, title: dto.title, description: dto.description, targetRoles: dto.targetRoles ?? [], fields: dto.fields ?? [], isActive: dto.isActive ?? true, isPublic: dto.isPublic ?? false, deadline: dto.deadline ? new Date(dto.deadline) : undefined, createdById } });
  }

  async listForms(tenantId: string, schoolId?: string) {
    return this.prisma.customForm.findMany({ where: { tenantId, ...(schoolId && { schoolId }), isActive: true }, include: { _count: { select: { responses: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async getForm(id: string, tenantId: string) {
    const f = await this.prisma.customForm.findFirst({ where: { id, tenantId } });
    if (!f) throw new NotFoundException('Form not found');
    return f;
  }

  async updateForm(id: string, dto: any, tenantId: string) {
    return this.prisma.customForm.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async deleteForm(id: string, tenantId: string) {
    return this.prisma.customForm.update({ where: { id }, data: { isActive: false } });
  }

  async submitResponse(formId: string, data: any, tenantId: string, respondentId: string) {
    const form = await this.prisma.customForm.findFirst({ where: { id: formId, tenantId, isActive: true } });
    if (!form) throw new NotFoundException('Form not found or inactive');
    return this.prisma.formResponse.create({ data: { formId, tenantId, respondentId, data } });
  }

  async getResponses(formId: string, tenantId: string) {
    return this.prisma.formResponse.findMany({ where: { formId, tenantId }, orderBy: { submittedAt: 'desc' } });
  }

  async getResponseStats(formId: string, tenantId: string) {
    const [form, responses] = await Promise.all([ this.prisma.customForm.findFirst({ where: { id: formId, tenantId } }), this.prisma.formResponse.findMany({ where: { formId, tenantId } }) ]);
    if (!form) throw new NotFoundException('Form not found');
    const fields = form.fields as any[];
    const stats = fields.map(f => {
      const answers = responses.map(r => (r.data as any)[f.id]).filter(Boolean);
      const freq: Record<string, number> = {};
      answers.forEach(a => { freq[String(a)] = (freq[String(a)] || 0) + 1; });
      return { fieldId: f.id, label: f.label, type: f.type, totalAnswers: answers.length, frequency: freq };
    });
    return { form, totalResponses: responses.length, stats };
  }

  // ── School Policies ────────────────────────────────────────
  async createPolicy(dto: any, tenantId: string, createdById: string) {
    return this.prisma.schoolPolicy.create({ data: { tenantId, schoolId: dto.schoolId, title: dto.title, category: dto.category, content: dto.content, createdById } });
  }

  async listPolicies(tenantId: string, schoolId?: string, category?: string) {
    return this.prisma.schoolPolicy.findMany({ where: { tenantId, ...(schoolId && { schoolId }), ...(category && { category }), isActive: true }, orderBy: { category: 'asc' } });
  }

  async publishPolicy(id: string, tenantId: string) {
    return this.prisma.schoolPolicy.update({ where: { id }, data: { publishedAt: new Date() } });
  }

  async updatePolicy(id: string, dto: any, tenantId: string) {
    return this.prisma.schoolPolicy.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  // ── Setup Checklist ────────────────────────────────────────
  async getChecklist(tenantId: string) {
    const existing = await this.prisma.setupChecklist.findUnique({ where: { tenantId } });
    if (existing) return existing;
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

  async updateChecklistItem(tenantId: string, key: string, done: boolean) {
    const checklist = await this.getChecklist(tenantId);
    const items = checklist.items as any[];
    const updated = items.map(i => i.key === key ? { ...i, done } : i);
    const completedCount = updated.filter(i => i.done).length;
    const isComplete = updated.filter(i => i.required).every(i => i.done);
    return this.prisma.setupChecklist.update({ where: { tenantId }, data: { items: updated, completedCount, isComplete, lastUpdatedAt: new Date() } });
  }

  // ── Academic Rules ─────────────────────────────────────────
  async createAcademicRule(dto: any, tenantId: string, createdById: string) {
    return this.prisma.academicRule.create({ data: { tenantId, schoolId: dto.schoolId, type: dto.type, title: dto.title, conditions: dto.conditions ?? {}, actions: dto.actions ?? {}, createdById } });
  }

  async listAcademicRules(tenantId: string, schoolId?: string, type?: string) {
    return this.prisma.academicRule.findMany({ where: { tenantId, ...(schoolId && { schoolId }), ...(type && { type }), isActive: true } });
  }
}
