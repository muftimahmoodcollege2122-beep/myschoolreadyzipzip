import { PrismaService } from '../../database/prisma.service';
import { RealtimeService } from '../../realtime/realtime.service';
export declare class AttendanceRealtimeInterceptor {
    private readonly prisma;
    private readonly realtime;
    private readonly logger;
    constructor(prisma: PrismaService, realtime: RealtimeService);
    afterBulkMark(tenantId: string, records: Array<{
        studentId: string;
        status: string;
        sectionId: string;
        date: string;
    }>, markedByName: string): Promise<void>;
}
