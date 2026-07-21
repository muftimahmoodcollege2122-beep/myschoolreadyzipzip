import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AlumniService {
  private readonly logger = new Logger(AlumniService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, tenantId: string) {
    return this.prisma.alumni.create({ data: { tenantId, schoolId: dto.schoolId, firstName: dto.firstName, lastName: dto.lastName, email: dto.email, phone: dto.phone, graduationYear: dto.graduationYear, className: dto.className, currentOccupation: dto.currentOccupation, currentCompany: dto.currentCompany, currentCity: dto.currentCity, country: dto.country, linkedIn: dto.linkedIn, photoUrl: dto.photoUrl, notes: dto.notes } });
  }

  async findAll(tenantId: string, schoolId?: string, year?: number, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, ...(schoolId && { schoolId }), ...(year && { graduationYear: year }), ...(search && { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { currentOccupation: { contains: search, mode: 'insensitive' } }] }) };
    const [data, total] = await Promise.all([this.prisma.alumni.findMany({ where, orderBy: { graduationYear: 'desc' }, skip, take: limit }), this.prisma.alumni.count({ where })]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const a = await this.prisma.alumni.findFirst({ where: { id, tenantId } });
    if (!a) throw new NotFoundException('Alumni not found');
    return a;
  }

  async update(id: string, dto: any, tenantId: string) {
    return this.prisma.alumni.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async verify(id: string, tenantId: string, verifiedById: string) {
    return this.prisma.alumni.update({ where: { id }, data: { isVerified: true, verifiedById } });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.alumni.delete({ where: { id } });
  }

  async getStats(tenantId: string, schoolId?: string) {
    const where: any = { tenantId, ...(schoolId && { schoolId }) };
    const [total, verified, byYear, byOccupation] = await Promise.all([
      this.prisma.alumni.count({ where }),
      this.prisma.alumni.count({ where: { ...where, isVerified: true } }),
      this.prisma.alumni.groupBy({ by: ['graduationYear'], where, _count: true, orderBy: { graduationYear: 'desc' } }),
      this.prisma.alumni.groupBy({ by: ['currentOccupation'], where: { ...where, currentOccupation: { not: null } }, _count: true, orderBy: { _count: { currentOccupation: 'desc' } }, take: 10 }),
    ]);
    return { total, verified, byYear, byOccupation };
  }
}
