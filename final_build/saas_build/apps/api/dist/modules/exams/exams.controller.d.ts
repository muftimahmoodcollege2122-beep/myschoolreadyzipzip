import { ExamsService } from './exams.service';
export declare class ExamsController {
    private readonly svc;
    constructor(svc: ExamsService);
    create(dto: any, tid: string, u: any): Promise<any>;
    findAll(tid: string, sid?: string, y?: string): Promise<any>;
    findOne(id: string, tid: string): Promise<any>;
    enterResults(id: string, dto: {
        results: any[];
    }, tid: string): Promise<any>;
    getResults(id: string, tid: string): Promise<any>;
}
