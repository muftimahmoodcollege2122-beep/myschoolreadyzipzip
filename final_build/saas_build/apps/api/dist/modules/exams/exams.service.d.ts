import { PrismaService } from '../../database/prisma.service';
export declare class ExamsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: any, tenantId: string, createdById: string): Promise<any>;
    findAll(tenantId: string, schoolId?: string, academicYear?: string): Promise<any>;
    findOne(id: string, tenantId: string): Promise<any>;
    enterResults(examId: string, results: Array<{
        studentId: string;
        marksObtained: number;
        remarks?: string;
    }>, tenantId: string): Promise<any>;
    getSectionResults(examId: string, tenantId: string): Promise<any>;
}
