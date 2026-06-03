import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);
  constructor(private readonly prisma: PrismaService) {}

  private async resolveSchoolId(tenantId: string, schoolId?: string): Promise<string | undefined> {
    if (schoolId && UUID_RE.test(schoolId)) return schoolId;
    const school = await this.prisma.school.findFirst({ where: { tenantId, isActive: true }, select: { id: true } });
    return school?.id;
  }

  async listRoutes(tenantId: string, schoolId: string, page = 1, limit = 20) {
    const resolved = await this.resolveSchoolId(tenantId, schoolId);
    const where: any = { tenantId, ...(resolved && { schoolId: resolved }) };
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.prisma.transportRoute.findMany({ where, skip, take: Number(limit), orderBy: { routeNo: 'asc' } }),
      this.prisma.transportRoute.count({ where }),
    ]);
    return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async createRoute(tenantId: string, schoolId: string, dto: any) {
    const resolved = await this.resolveSchoolId(tenantId, schoolId);
    return this.prisma.transportRoute.create({
      data: {
        tenantId,
        schoolId: resolved!,
        name: dto.name,
        routeNo: dto.routeNo,
        stops: dto.stops ?? [],
        vehicleNo: dto.vehicleNo,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        capacity: Number(dto.capacity ?? 40),
        fee: dto.fee ? Number(dto.fee) : undefined,
        status: 'ACTIVE',
      },
    });
  }

  async updateRoute(tenantId: string, id: string, dto: any) {
    const route = await this.prisma.transportRoute.findFirst({ where: { id, tenantId } });
    if (!route) throw new NotFoundException('Route not found');
    return this.prisma.transportRoute.update({
      where: { id },
      data: { name: dto.name, vehicleNo: dto.vehicleNo, driverName: dto.driverName, driverPhone: dto.driverPhone, capacity: dto.capacity ? Number(dto.capacity) : undefined, status: dto.status, fee: dto.fee ? Number(dto.fee) : undefined },
    });
  }

  async deleteRoute(tenantId: string, id: string) {
    const route = await this.prisma.transportRoute.findFirst({ where: { id, tenantId } });
    if (!route) throw new NotFoundException('Route not found');
    await this.prisma.transportRoute.delete({ where: { id } });
    return { success: true };
  }

  async getStats(tenantId: string) {
    const [totalRoutes, activeRoutes, totalCapacity] = await Promise.all([
      this.prisma.transportRoute.count({ where: { tenantId } }),
      this.prisma.transportRoute.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.transportRoute.aggregate({ where: { tenantId, status: 'ACTIVE' }, _sum: { capacity: true } }),
    ]);
    return { totalRoutes, activeRoutes, totalCapacity: totalCapacity._sum.capacity ?? 0 };
  }
}
