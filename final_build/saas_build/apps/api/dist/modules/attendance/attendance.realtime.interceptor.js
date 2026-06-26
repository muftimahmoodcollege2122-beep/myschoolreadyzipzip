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
var AttendanceRealtimeInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRealtimeInterceptor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const realtime_service_1 = require("../../realtime/realtime.service");
let AttendanceRealtimeInterceptor = AttendanceRealtimeInterceptor_1 = class AttendanceRealtimeInterceptor {
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.logger = new common_1.Logger(AttendanceRealtimeInterceptor_1.name);
    }
    async afterBulkMark(tenantId, records, markedByName) {
        const events = await Promise.all(records.map(async (r) => {
            const student = await this.prisma.student.findFirst({
                where: { id: r.studentId },
                include: { user: { include: { profile: true } } },
            });
            return {
                studentId: r.studentId,
                studentName: student ? `${student.user.profile?.firstName} ${student.user.profile?.lastName}` : r.studentId,
                rollNumber: student?.rollNumber ?? '',
                status: r.status,
                sectionId: r.sectionId,
                date: r.date,
                markedByName,
            };
        }));
        await this.realtime.onAttendanceMarked(tenantId, events);
    }
};
exports.AttendanceRealtimeInterceptor = AttendanceRealtimeInterceptor;
exports.AttendanceRealtimeInterceptor = AttendanceRealtimeInterceptor = AttendanceRealtimeInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_service_1.RealtimeService])
], AttendanceRealtimeInterceptor);
//# sourceMappingURL=attendance.realtime.interceptor.js.map