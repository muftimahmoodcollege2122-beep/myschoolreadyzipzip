import { QuestionBankService } from './question-bank.service';
export declare class QuestionBankController {
    private readonly svc;
    constructor(svc: QuestionBankService);
    createBank(dto: any, tid: string, u: any): Promise<any>;
    listBanks(tid: string, sid?: string, subId?: string): Promise<any>;
    createQuestion(dto: any, tid: string, u: any): Promise<any>;
    listQuestions(tid: string, bid?: string, t?: string, d?: string, sid?: string, s?: string): Promise<any>;
    updateQuestion(id: string, dto: any, tid: string): Promise<any>;
    deleteQuestion(id: string, tid: string): Promise<any>;
    generatePaper(dto: any, tid: string): Promise<{
        questions: any;
        totalMarks: any;
        questionCount: any;
        generatedAt: Date;
    }>;
    getBankStats(id: string, tid: string): Promise<{
        bank: any;
        total: any;
        byType: any;
        byDiff: any;
    }>;
    startExam(examId: string, tid: string, u: any): Promise<any>;
    submitAnswer(sid: string, dto: any, tid: string): Promise<any>;
    submitExam(sid: string, tid: string): Promise<any>;
    getSession(sid: string, tid: string): Promise<any>;
}
