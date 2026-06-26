import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { PaginatedResult } from '../../common/types/pagination.types';
import { Student } from '@prisma/client';
export declare class StudentsService {
    private readonly prisma;
    private readonly audit;
    private readonly events;
    private readonly planGuard;
    private readonly logger;
    private resolveSchoolId;
    constructor(prisma: PrismaService, audit: AuditService, events: EventPublisher, planGuard: PlanGuard);
    create(dto: CreateStudentDto, tenantId: string, schoolId: string | undefined, createdById: string): Promise<any>;
    findAll(tenantId: string, schoolId: string, query: StudentListQueryDto): Promise<PaginatedResult<Student>>;
    findByUserId(userId: string, tenantId: string): Promise<Student | null>;
    findOne(id: string, tenantId: string): Promise<any>;
    update(id: string, dto: UpdateStudentDto, tenantId: string, updatedById: string): Promise<any>;
    deactivate(id: string, tenantId: string, deactivatedById: string): Promise<void>;
    erasePersonalData(id: string, tenantId: string, requestedById: string): Promise<void>;
}
