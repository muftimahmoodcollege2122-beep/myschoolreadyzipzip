import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async createSlot(dto: any, tenantId: string) {
    const conflict = await this.prisma.timetableSlot.findFirst({ where: { teacherId: dto.teacherId, tenantId, dayOfWeek: dto.dayOfWeek, academicYear: dto.academicYear, OR: [{ startTime: { lte: dto.startTime }, endTime: { gt: dto.startTime } }, { startTime: { lt: dto.endTime }, endTime: { gte: dto.endTime } }] } });
    if (conflict) throw new ConflictException('Teacher has a conflicting slot');
    return this.prisma.timetableSlot.create({ data: { ...dto, tenantId, effectiveFrom: new Date(dto.effectiveFrom) }, include: { section: { include: { class: true } }, classSubject: { include: { subject: true } }, teacher: { include: { user: { include: { profile: true } } } } } });
  }

  async getSectionTimetable(sectionId: string, tenantId: string, academicYear: string) {
    const slots = await this.prisma.timetableSlot.findMany({ where: { sectionId, tenantId, academicYear }, include: { classSubject: { include: { subject: true } }, teacher: { include: { user: { include: { profile: true } } } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    const days: Record<number, any[]> = {};
    for (const s of slots) { if (!days[s.dayOfWeek]) days[s.dayOfWeek] = []; days[s.dayOfWeek].push(s); }
    const names = ['', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return Object.entries(days).map(([d, slots]) => ({ day: +d, dayName: names[+d], slots }));
  }

  async getTeacherTimetable(teacherId: string, tenantId: string, academicYear: string) {
    return this.prisma.timetableSlot.findMany({ where: { teacherId, tenantId, academicYear }, include: { section: { include: { class: true } }, classSubject: { include: { subject: true } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
  }

  async deleteSlot(id: string, tenantId: string) {
    const s = await this.prisma.timetableSlot.findFirst({ where: { id, tenantId } });
    if (!s) throw new NotFoundException('Slot not found');
    await this.prisma.timetableSlot.delete({ where: { id } });
  }
}
