import { PrismaService } from '../../database/prisma.service';
export declare class FormsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createForm(dto: any, tenantId: string, createdById: string): Promise<any>;
    listForms(tenantId: string, schoolId?: string): Promise<any>;
    getForm(id: string, tenantId: string): Promise<any>;
    updateForm(id: string, dto: any, tenantId: string): Promise<any>;
    deleteForm(id: string, tenantId: string): Promise<any>;
    submitResponse(formId: string, data: any, tenantId: string, respondentId: string): Promise<any>;
    getResponses(formId: string, tenantId: string): Promise<any>;
    getResponseStats(formId: string, tenantId: string): Promise<{
        form: any;
        totalResponses: any;
        stats: {
            fieldId: any;
            label: any;
            type: any;
            totalAnswers: any;
            frequency: Record<string, number>;
        }[];
    }>;
    createPolicy(dto: any, tenantId: string, createdById: string): Promise<any>;
    listPolicies(tenantId: string, schoolId?: string, category?: string): Promise<any>;
    publishPolicy(id: string, tenantId: string): Promise<any>;
    updatePolicy(id: string, dto: any, tenantId: string): Promise<any>;
    getChecklist(tenantId: string): Promise<any>;
    updateChecklistItem(tenantId: string, key: string, done: boolean): Promise<any>;
    createAcademicRule(dto: any, tenantId: string, createdById: string): Promise<any>;
    listAcademicRules(tenantId: string, schoolId?: string, type?: string): Promise<any>;
}
