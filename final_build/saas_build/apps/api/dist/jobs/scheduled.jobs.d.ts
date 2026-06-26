import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
export declare class ScheduledJobs {
    private readonly prisma;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    sendFeeReminders(): Promise<void>;
    processAbsenceAlerts(): Promise<void>;
    processResultPublishNotifications(): Promise<void>;
    weeklyAttendanceSummary(): Promise<void>;
    autoMarkAbsent(): Promise<void>;
    processTimetableChangeNotifications(): Promise<void>;
    pendingLeaveReminders(): Promise<void>;
    libraryOverdueAlerts(): Promise<void>;
    autoDropoutRiskAlerts(): Promise<void>;
}
