"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimetableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TimetableService = class TimetableService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSlot(dto, tenantId) {
        const conflict = await this.prisma.timetableSlot.findFirst({ where: { teacherId: dto.teacherId, tenantId, dayOfWeek: dto.dayOfWeek, academicYear: dto.academicYear, OR: [{ startTime: { lte: dto.startTime }, endTime: { gt: dto.startTime } }, { startTime: { lt: dto.endTime }, endTime: { gte: dto.endTime } }] } });
        if (conflict)
            throw new common_1.ConflictException('Teacher has a conflicting slot');
        return this.prisma.timetableSlot.create({ data: { ...dto, tenantId, effectiveFrom: new Date(dto.effectiveFrom) }, include: { section: { include: { class: true } }, classSubject: { include: { subject: true } }, teacher: { include: { user: { include: { profile: true } } } } } });
    }
    async getSectionTimetable(sectionId, tenantId, academicYear) {
        const slots = await this.prisma.timetableSlot.findMany({ where: { sectionId, tenantId, academicYear }, include: { classSubject: { include: { subject: true } }, teacher: { include: { user: { include: { profile: true } } } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
        const days = {};
        for (const s of slots) {
            if (!days[s.dayOfWeek])
                days[s.dayOfWeek] = [];
            days[s.dayOfWeek].push(s);
        }
        const names = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return Object.entries(days).map(([d, slots]) => ({ day: +d, dayName: names[+d], slots }));
    }
    async getTeacherTimetable(teacherId, tenantId, academicYear) {
        return this.prisma.timetableSlot.findMany({ where: { teacherId, tenantId, academicYear }, include: { section: { include: { class: true } }, classSubject: { include: { subject: true } } }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    }
    async deleteSlot(id, tenantId) {
        const s = await this.prisma.timetableSlot.findFirst({ where: { id, tenantId } });
        if (!s)
            throw new common_1.NotFoundException('Slot not found');
        await this.prisma.timetableSlot.delete({ where: { id } });
    }
};
exports.TimetableService = TimetableService;
exports.TimetableService = TimetableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimetableService);
//# sourceMappingURL=timetable.service.js.map