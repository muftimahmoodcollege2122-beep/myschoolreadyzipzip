import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class HrExtendedService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    createLessonPlan(dto: any, tenantId: string, teacherId: string): Promise<any>;
    listLessonPlans(tenantId: string, teacherId?: string, week?: string, status?: string): Promise<any>;
    updateLessonPlan(id: string, dto: any, tenantId: string): Promise<any>;
    submitLessonPlan(id: string, tenantId: string): Promise<any>;
    approveLessonPlan(id: string, tenantId: string, approvedById: string): Promise<any>;
    rejectLessonPlan(id: string, note: string, tenantId: string, approvedById: string): Promise<any>;
    createSubstitution(dto: any, tenantId: string, assignedById: string): Promise<any>;
    listSubstitutions(tenantId: string, date?: string, teacherId?: string): Promise<any>;
    updateSubstitutionStatus(id: string, status: string, tenantId: string): Promise<any>;
    addTraining(dto: any, tenantId: string): Promise<any>;
    listTrainings(tenantId: string, teacherId?: string, status?: string): Promise<any>;
    completeTraining(id: string, tenantId: string, certificateUrl?: string): Promise<any>;
    addCertification(dto: any, tenantId: string): Promise<any>;
    listCertifications(tenantId: string, teacherId?: string): Promise<any>;
    verifyCertification(id: string, tenantId: string, verifiedById: string): Promise<any>;
    getPayrollSummary(tenantId: string, schoolId: string, month: string): Promise<{
        month: string;
        employees: any[];
        totalPayroll: any;
        teacherCount: any;
        staffCount: any;
    }>;
    getTeacherWorkload(teacherId: string, tenantId: string): Promise<{
        teacherId: string;
        weeklySlots: any;
        weeklyHours: number;
        lessonPlans: any;
        substitutionsHandled: any;
        leaveRequests: any;
        workloadLevel: string;
    }>;
}
