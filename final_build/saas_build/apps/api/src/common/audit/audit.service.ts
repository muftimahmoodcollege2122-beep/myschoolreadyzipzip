import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditAction } from '../prisma-enums';;

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  action: AuditAction | string;
  entity: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

const PII_FIELDS = new Set(['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationalId', 'medicalNotes', 'salary', 'passwordHash']);

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId as any,
          before: entry.before ? this.sanitize(entry.before) as any : undefined,
          after: entry.after ? this.sanitize(entry.after) as any : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent?.slice(0, 500),
          correlationId: entry.correlationId,
        },
      });
    } catch (err) {
      // Audit log failure must never break the main flow
      this.logger.error(`Audit log write failed: ${err}`);
    }
  }

  /** Strip PII from audit log before persisting — compliance requirement */
  private sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (PII_FIELDS.has(key)) {
        cleaned[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = this.sanitize(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}
