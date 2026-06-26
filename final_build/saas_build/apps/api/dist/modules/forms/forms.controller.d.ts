import { FormsService } from './forms.service';
export declare class FormsController {
    private readonly svc;
    constructor(svc: FormsService);
    createForm(dto: any, tid: string, u: any): Promise<any>;
    listForms(tid: string, sid?: string): Promise<any>;
    getForm(id: string, tid: string): Promise<any>;
    updateForm(id: string, dto: any, tid: string): Promise<any>;
    deleteForm(id: string, tid: string): Promise<any>;
    submitResponse(id: string, dto: any, tid: string, u: any): Promise<any>;
    getResponses(id: string, tid: string): Promise<any>;
    getStats(id: string, tid: string): Promise<{
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
    createPolicy(dto: any, tid: string, u: any): Promise<any>;
    listPolicies(tid: string, sid?: string, cat?: string): Promise<any>;
    publishPolicy(id: string, tid: string): Promise<any>;
    updatePolicy(id: string, dto: any, tid: string): Promise<any>;
    getChecklist(tid: string): Promise<any>;
    updateChecklistItem(tid: string, dto: any): Promise<any>;
    createRule(dto: any, tid: string, u: any): Promise<any>;
    listRules(tid: string, sid?: string, type?: string): Promise<any>;
}
