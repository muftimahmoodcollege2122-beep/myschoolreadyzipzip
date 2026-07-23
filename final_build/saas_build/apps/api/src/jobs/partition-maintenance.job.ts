/**
 * Partition maintenance — auto-creates next month's partition for
 * audit_logs / attendances / payments before it's needed.
 *
 * Why this exists: RANGE-partitioned tables only accept inserts for dates
 * that have a matching partition (or a DEFAULT catch-all, which
 * 02_create_partitions.sql also creates as a safety net — but everything
 * landing in DEFAULT defeats the point of partitioning and needs manual
 * cleanup later). Forgetting to create next month's partition is the most
 * common way partitioned tables break in production: everything works
 * fine for months, then on the 1st, every insert either errors or silently
 * piles into DEFAULT. Running this monthly with several months of
 * lookahead makes that a non-issue.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

const PARTITIONED_TABLES: Array<{ table: string }> = [
  { table: 'audit_logs' },
  { table: 'attendances' },
  { table: 'payments' },
];

const MONTHS_AHEAD = 3;

@Injectable()
export class PartitionMaintenanceJob {
  private readonly logger = new Logger(PartitionMaintenanceJob.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs monthly on the 1st at 03:00 — well before any table would run out
  // of pre-created partitions given MONTHS_AHEAD=3.
  @Cron('0 3 1 * *')
  async ensureFuturePartitions(): Promise<void> {
    this.logger.log('Partition maintenance job running');

    for (const { table } of PARTITIONED_TABLES) {
      for (let i = 0; i < MONTHS_AHEAD; i++) {
        const partStart = startOfMonth(addMonths(new Date(), i));
        const partEnd = addMonths(partStart, 1);
        const partName = `${table}_${formatYYYYMM(partStart)}`;

        try {
          // $executeRawUnsafe because table/partition names can't be
          // parameterized — inputs here are entirely internally generated
          // (fixed table list + computed dates), never user input.
          await this.prisma.unscoped.$executeRawUnsafe(
            `CREATE TABLE IF NOT EXISTS "${partName}" PARTITION OF "${table}" FOR VALUES FROM ('${toSqlDate(partStart)}') TO ('${toSqlDate(partEnd)}')`,
          );
        } catch (err) {
          // Don't let one table's failure block the others, and don't
          // crash the cron scheduler — log loudly so it surfaces in
          // monitoring instead.
          this.logger.error(`Failed to ensure partition ${partName}: ${(err as Error).message}`);
        }
      }
    }

    this.logger.log('Partition maintenance job complete');
  }
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}
function formatYYYYMM(d: Date): string {
  return `${d.getUTCFullYear()}_${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
function toSqlDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
