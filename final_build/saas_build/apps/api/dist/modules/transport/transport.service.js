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
var TransportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let TransportService = TransportService_1 = class TransportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TransportService_1.name);
    }
    async resolveSchoolId(tenantId, schoolId) {
        if (schoolId && UUID_RE.test(schoolId))
            return schoolId;
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
        return school?.id;
    }
    async listRoutes(tenantId, schoolId, page = 1, limit = 20) {
        const resolved = await this.resolveSchoolId(tenantId, schoolId);
        const where = { tenantId, ...(resolved && { schoolId: resolved }) };
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = await Promise.all([
            this.prisma.transportRoute.findMany({ where, skip, take: Number(limit), orderBy: { routeNo: 'asc' } }),
            this.prisma.transportRoute.count({ where }),
        ]);
        return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    }
    async createRoute(tenantId, schoolId, dto) {
        const resolved = await this.resolveSchoolId(tenantId, schoolId);
        return this.prisma.transportRoute.create({
            data: {
                tenantId,
                schoolId: resolved,
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
    async updateRoute(tenantId, id, dto) {
        const route = await this.prisma.transportRoute.findFirst({ where: { id, tenantId } });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        return this.prisma.transportRoute.update({
            where: { id },
            data: { name: dto.name, vehicleNo: dto.vehicleNo, driverName: dto.driverName, driverPhone: dto.driverPhone, capacity: dto.capacity ? Number(dto.capacity) : undefined, status: dto.status, fee: dto.fee ? Number(dto.fee) : undefined },
        });
    }
    async deleteRoute(tenantId, id) {
        const route = await this.prisma.transportRoute.findFirst({ where: { id, tenantId } });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        await this.prisma.transportRoute.delete({ where: { id } });
        return { success: true };
    }
    async getStats(tenantId) {
        const [totalRoutes, activeRoutes, totalCapacity] = await Promise.all([
            this.prisma.transportRoute.count({ where: { tenantId } }),
            this.prisma.transportRoute.count({ where: { tenantId, status: 'ACTIVE' } }),
            this.prisma.transportRoute.aggregate({ where: { tenantId, status: 'ACTIVE' }, _sum: { capacity: true } }),
        ]);
        return { totalRoutes, activeRoutes, totalCapacity: totalCapacity._sum.capacity ?? 0 };
    }
};
exports.TransportService = TransportService;
exports.TransportService = TransportService = TransportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransportService);
//# sourceMappingURL=transport.service.js.map