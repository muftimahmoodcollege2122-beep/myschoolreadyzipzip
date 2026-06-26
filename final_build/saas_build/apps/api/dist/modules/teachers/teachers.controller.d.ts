import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Request } from 'express';
export declare class TeachersController {
    private readonly svc;
    constructor(svc: TeachersService);
    create(dto: CreateTeacherDto, tid: string, u: any, req: Request): Promise<any>;
    findMe(tid: string, u: any): Promise<any>;
    findAll(tid: string, sid: string, p: number, l: number, s: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, tid: string): Promise<any>;
    schedule(id: string, tid: string): Promise<any>;
    requestLeave(id: string, tid: string, dto: any): Promise<any>;
    approveLeave(id: string, tid: string, u: any): Promise<any>;
}
