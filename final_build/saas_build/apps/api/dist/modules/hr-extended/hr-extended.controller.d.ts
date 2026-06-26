import { HrExtendedService } from './hr-extended.service';
export declare class HrExtendedController {
    private readonly svc;
    constructor(svc: HrExtendedService);
    createLessonPlan(dto: any, tid: string, u: any): Promise<any>;
    listLessonPlans(tid: string, tid2?: string, week?: string, status?: string): Promise<any>;
    updateLessonPlan(id: string, dto: any, tid: string): Promise<any>;
    submitLessonPlan(id: string, tid: string): Promise<any>;
    approveLessonPlan(id: string, tid: string, u: any): Promise<any>;
    rejectLessonPlan(id: string, dto: any, tid: string, u: any): Promise<any>;
    createSubstitution(dto: any, tid: string, u: any): Promise<any>;
    listSubstitutions(tid: string, date?: string, tid2?: string): Promise<any>;
    updateSubstitutionStatus(id: string, dto: any, tid: string): Promise<any>;
    addTraining(dto: any, tid: string): Promise<any>;
    listTrainings(tid: string, tid2?: string, status?: string): Promise<any>;
    completeTraining(id: string, tid: string, dto: any): Promise<any>;
    addCertification(dto: any, tid: string): Promise<any>;
    listCertifications(tid: string, tid2?: string): Promise<any>;
    verifyCertification(id: string, tid: string, u: any): Promise<any>;
    getPayrollSummary(tid: string, sid: string, month: string): Promise<{
        month: string;
        employees: any[];
        totalPayroll: any;
        teacherCount: any;
        staffCount: any;
    }>;
    getTeacherWorkload(tid2: string, tid: string): Promise<{
        teacherId: string;
        weeklySlots: any;
        weeklyHours: number;
        lessonPlans: any;
        substitutionsHandled: any;
        leaveRequests: any;
        workloadLevel: string;
    }>;
}
