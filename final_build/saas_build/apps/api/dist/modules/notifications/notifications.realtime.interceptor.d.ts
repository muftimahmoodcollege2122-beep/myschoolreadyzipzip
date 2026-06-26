import { RealtimeService } from '../../realtime/realtime.service';
export declare class NotificationsRealtimeInterceptor {
    private readonly realtime;
    constructor(realtime: RealtimeService);
    afterCreate(userId: string, tenantId: string, notification: {
        id: string;
        title: string;
        body: string;
        type: string;
        data?: any;
    }): Promise<void>;
}
