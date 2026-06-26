import { TimetableService } from './timetable.service';
export declare class TimetableController {
    private readonly svc;
    constructor(svc: TimetableService);
    createSlot(dto: any, tid: string): Promise<any>;
    sectionTimetable(id: string, y: string, tid: string): Promise<{
        day: number;
        dayName: string;
        slots: any[];
    }[]>;
    teacherTimetable(id: string, y: string, tid: string): Promise<any>;
    deleteSlot(id: string, tid: string): Promise<void>;
}
