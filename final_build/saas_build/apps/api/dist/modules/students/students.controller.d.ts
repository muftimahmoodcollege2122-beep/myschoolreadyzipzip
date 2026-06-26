import { Request } from 'express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import type { JwtPayload } from '../auth/auth.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(dto: CreateStudentDto, tenantId: string, user: JwtPayload, req: Request): Promise<Student>;
    findMe(tenantId: string, user: JwtPayload): Promise<any>;
    findAll(tenantId: string, query: StudentListQueryDto, req: Request): Promise<import("../../common/types/pagination.types").PaginatedResult<Student>>;
    findOne(id: string, tenantId: string): Promise<Student>;
    update(id: string, dto: UpdateStudentDto, tenantId: string, user: JwtPayload): Promise<Student>;
    deactivate(id: string, tenantId: string, user: JwtPayload): Promise<void>;
    erasePersonalData(id: string, tenantId: string, user: JwtPayload): Promise<void>;
}
