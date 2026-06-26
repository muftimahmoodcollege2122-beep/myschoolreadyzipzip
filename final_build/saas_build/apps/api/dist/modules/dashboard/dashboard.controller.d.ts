import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly svc;
    constructor(svc: DashboardService);
    school(tid: string, sid: string): Promise<any>;
    platform(): Promise<any>;
}
