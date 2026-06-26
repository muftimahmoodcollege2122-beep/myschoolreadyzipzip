import { RealtimeService } from './realtime.service';
export declare class RealtimeController {
    private readonly svc;
    constructor(svc: RealtimeService);
    onlineCount(tid: string): {
        count: number;
        tenantId: string;
    };
    announce(dto: {
        title: string;
        body: string;
        priority?: 'normal' | 'urgent';
        targetRoles?: string[];
    }, tid: string): {
        success: boolean;
        message: string;
    };
    dashboardUpdate(stats: any, tid: string): {
        success: boolean;
    };
}
