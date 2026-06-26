import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/create-invoice.dto';
export declare class FeesService {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    createInvoice(dto: CreateInvoiceDto, tenantId: string): Promise<any>;
    createDirectInvoice(dto: {
        studentId: string;
        description: string;
        amount: number;
        dueDate: string;
        category?: string;
    }, tenantId: string): Promise<any>;
    bulkGenerateInvoices(feeStructureId: string, studentIds: string[], tenantId: string): Promise<{
        created: number;
        skipped: number;
    }>;
    recordPayment(dto: RecordPaymentDto, tenantId: string, processedById: string): Promise<void>;
    getStudentFeeSummary(studentId: string, tenantId: string): Promise<any>;
    getOutstandingInvoices(schoolId: string, tenantId: string): Promise<any[]>;
    getRevenueReport(schoolId: string, tenantId: string, month: number, year: number): Promise<any>;
}
