import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CreateTeacherDto } from './dto/create-teacher.dto';
export declare class TeachersService {
    private prisma;
    private audit;
    private planGuard;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService, planGuard: PlanGuard);
    private resolveSchoolId;
    create(dto: CreateTeacherDto, tenantId: string, schoolId: string | undefined, createdById: string): Promise<any>;
    findAll(tenantId: string, schoolId: string, page?: number, limit?: number, search?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByUserId(userId: string, tenantId: string): Promise<any>;
    findOne(id: string, tenantId: string): Promise<any>;
    getTeacherSchedule(teacherId: string, tenantId: string): Promise<any>;
    requestLeave(teacherId: string, tenantId: string, dto: any): Promise<any>;
    approveLeave(leaveId: string, tenantId: string, approverId: string): Promise<any>;
}
