import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getMyNotifications(u: any, tid: string, limit?: string): Promise<any>;
    markRead(id: string, u: any, tid: string): Promise<any>;
    markAllRead(u: any, tid: string): Promise<any>;
    broadcast(dto: {
        schoolId?: string;
        title: string;
        body: string;
        channels: string[];
        audience: string;
    }, tid: string): Promise<{
        count: number;
    }>;
    sendInApp(dto: {
        userId: string;
        title: string;
        body: string;
        data?: any;
    }, tid: string): Promise<void>;
}
