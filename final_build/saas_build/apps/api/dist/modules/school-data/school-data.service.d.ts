import { PrismaService } from '../../database/prisma.service';
export declare class SchoolDataService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private resolveSchoolId;
    private getSchool;
    getSection(tenantId: string, section: string): Promise<any[]>;
    createSectionItem(tenantId: string, section: string, dto: any): Promise<any>;
    updateSectionItem(tenantId: string, section: string, itemId: string, dto: any): Promise<any>;
    deleteSectionItem(tenantId: string, section: string, itemId: string): Promise<{
        success: boolean;
    }>;
    listClasses(tenantId: string, schoolId: string): Promise<any>;
    createClass(tenantId: string, schoolId: string, dto: any): Promise<any>;
    updateClass(tenantId: string, id: string, dto: any): Promise<any>;
    listSections(tenantId: string, schoolId: string, classId?: string): Promise<any>;
    createSection(tenantId: string, schoolId: string, dto: any): Promise<any>;
    listSubjects(tenantId: string, schoolId: string): Promise<any>;
    createSubject(tenantId: string, schoolId: string, dto: any): Promise<any>;
    listStaff(tenantId: string, schoolId: string, page?: number, limit?: number, search?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createStaff(tenantId: string, schoolId: string, dto: any): Promise<any>;
    listEvents(tenantId: string, schoolId: string, upcoming?: boolean): Promise<any>;
    createEvent(tenantId: string, schoolId: string, dto: any): Promise<any>;
    deleteEvent(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getSchoolInfo(tenantId: string): Promise<any>;
    updateSchoolInfo(tenantId: string, dto: any): Promise<any>;
    getLmsData(tenantId: string): Promise<{
        courses: any;
    }>;
    createLmsCourse(tenantId: string, dto: any): Promise<{
        id: string;
        title: any;
        subject: any;
        description: any;
        teacher: any;
        status: string;
        lessons: number;
        assignments: number;
        students: number;
        progress: number;
        thumb: string;
        createdAt: string;
    }>;
    updateLmsCourse(tenantId: string, courseId: string, dto: any): Promise<any>;
    deleteLmsCourse(tenantId: string, courseId: string): Promise<{
        success: boolean;
    }>;
    getWebsiteSettings(tenantId: string): Promise<any>;
    saveWebsiteSettings(tenantId: string, dto: any): Promise<any>;
    getBackup(tenantId: string): Promise<{
        exportedAt: string;
        version: string;
        tenantId: string;
        summary: {
            students: any;
            teachers: any;
            classes: any;
            subjects: any;
            sections: any;
            announcements: any;
            events: any;
        };
        school: any;
        students: any;
        teachers: any;
        classes: any;
        subjects: any;
        sections: any;
        announcements: any;
        events: any;
    }>;
    listAnnouncements(tenantId: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createAnnouncement(tenantId: string, createdById: string, dto: any): Promise<any>;
    deleteAnnouncement(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    listDepartments(tenantId: string, schoolId: string): Promise<any>;
}
