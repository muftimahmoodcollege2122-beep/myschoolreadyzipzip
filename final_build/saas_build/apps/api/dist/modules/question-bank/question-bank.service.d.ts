import { PrismaService } from '../../database/prisma.service';
export declare class QuestionBankService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createBank(dto: any, tenantId: string, createdById: string): Promise<any>;
    listBanks(tenantId: string, schoolId?: string, subjectId?: string): Promise<any>;
    createQuestion(dto: any, tenantId: string, createdById: string): Promise<any>;
    listQuestions(tenantId: string, bankId?: string, type?: string, difficulty?: string, subjectId?: string, search?: string): Promise<any>;
    updateQuestion(id: string, dto: any, tenantId: string): Promise<any>;
    deleteQuestion(id: string, tenantId: string): Promise<any>;
    generatePaper(dto: {
        bankId: string;
        totalMarks: number;
        questionCount: number;
        types?: string[];
        difficulty?: string;
    }, tenantId: string): Promise<{
        questions: any;
        totalMarks: any;
        questionCount: any;
        generatedAt: Date;
    }>;
    startOnlineExam(examId: string, studentId: string, tenantId: string, ipAddress?: string): Promise<any>;
    submitAnswer(sessionId: string, questionId: string, answer: string, tenantId: string): Promise<any>;
    submitExam(sessionId: string, tenantId: string): Promise<any>;
    getSessionResults(sessionId: string, tenantId: string): Promise<any>;
    getBankStats(bankId: string, tenantId: string): Promise<{
        bank: any;
        total: any;
        byType: any;
        byDiff: any;
    }>;
}
