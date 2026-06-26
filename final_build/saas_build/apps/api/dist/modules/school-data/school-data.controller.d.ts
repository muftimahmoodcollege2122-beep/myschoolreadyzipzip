import { SchoolDataService } from './school-data.service';
export declare class SchoolDataController {
    private readonly svc;
    constructor(svc: SchoolDataService);
    schoolInfo(tid: string): Promise<any>;
    updateSchool(tid: string, dto: any): Promise<any>;
    classes(tid: string, sid: string): Promise<any>;
    createClass(tid: string, sid: string, dto: any): Promise<any>;
    updateClass(tid: string, id: string, dto: any): Promise<any>;
    sections(tid: string, sid: string, classId: string): Promise<any>;
    createSection(tid: string, sid: string, dto: any): Promise<any>;
    subjects(tid: string, sid: string): Promise<any>;
    createSubject(tid: string, sid: string, dto: any): Promise<any>;
    staff(tid: string, sid: string, p: number, l: number, s: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createStaff(tid: string, sid: string, dto: any): Promise<any>;
    events(tid: string, sid: string, upcoming: string): Promise<any>;
    createEvent(tid: string, sid: string, dto: any): Promise<any>;
    deleteEvent(tid: string, id: string): Promise<{
        success: boolean;
    }>;
    announcements(tid: string, p: number, l: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createAnnouncement(tid: string, u: any, dto: any): Promise<any>;
    deleteAnnouncement(tid: string, id: string): Promise<{
        success: boolean;
    }>;
    departments(tid: string, sid: string): Promise<any>;
    getLms(tid: string): Promise<{
        courses: any;
    }>;
    createCourse(tid: string, dto: any): Promise<{
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
    updateCourse(tid: string, id: string, dto: any): Promise<any>;
    deleteCourse(tid: string, id: string): Promise<{
        success: boolean;
    }>;
    getWebsite(tid: string): Promise<any>;
    saveWebsite(tid: string, dto: any): Promise<any>;
    backup(tid: string): Promise<{
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
    getSection(tid: string, name: string): Promise<any[]>;
    createItem(tid: string, name: string, dto: any): Promise<any>;
    updateItem(tid: string, name: string, id: string, dto: any): Promise<any>;
    deleteItem(tid: string, name: string, id: string): Promise<{
        success: boolean;
    }>;
}
