import { PrismaService } from '../../database/prisma.service';
export declare class TimetableService {
    private prisma;
    constructor(prisma: PrismaService);
    createSlot(dto: any, tenantId: string): Promise<any>;
    getSectionTimetable(sectionId: string, tenantId: string, academicYear: string): Promise<{
        day: number;
        dayName: string;
        slots: any[];
    }[]>;
    getTeacherTimetable(teacherId: string, tenantId: string, academicYear: string): Promise<any>;
    deleteSlot(id: string, tenantId: string): Promise<void>;
}
