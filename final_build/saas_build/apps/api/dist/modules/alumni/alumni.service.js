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
var AlumniService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlumniService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let AlumniService = AlumniService_1 = class AlumniService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AlumniService_1.name);
    }
    async create(dto, tenantId) {
        return this.prisma.alumni.create({ data: { tenantId, schoolId: dto.schoolId, firstName: dto.firstName, lastName: dto.lastName, email: dto.email, phone: dto.phone, graduationYear: dto.graduationYear, className: dto.className, currentOccupation: dto.currentOccupation, currentCompany: dto.currentCompany, currentCity: dto.currentCity, country: dto.country, linkedIn: dto.linkedIn, photoUrl: dto.photoUrl, notes: dto.notes } });
    }
    async findAll(tenantId, schoolId, year, search, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = { tenantId, ...(schoolId && { schoolId }), ...(year && { graduationYear: year }), ...(search && { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { currentOccupation: { contains: search, mode: 'insensitive' } }] }) };
        const [data, total] = await Promise.all([this.prisma.alumni.findMany({ where, orderBy: { graduationYear: 'desc' }, skip, take: limit }), this.prisma.alumni.count({ where })]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async findOne(id, tenantId) {
        const a = await this.prisma.alumni.findFirst({ where: { id, tenantId } });
        if (!a)
            throw new common_1.NotFoundException('Alumni not found');
        return a;
    }
    async update(id, dto, tenantId) {
        return this.prisma.alumni.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
    }
    async verify(id, tenantId, verifiedById) {
        return this.prisma.alumni.update({ where: { id }, data: { isVerified: true, verifiedById } });
    }
    async delete(id, tenantId) {
        return this.prisma.alumni.delete({ where: { id } });
    }
    async getStats(tenantId, schoolId) {
        const where = { tenantId, ...(schoolId && { schoolId }) };
        const [total, verified, byYear, byOccupation] = await Promise.all([
            this.prisma.alumni.count({ where }),
            this.prisma.alumni.count({ where: { ...where, isVerified: true } }),
            this.prisma.alumni.groupBy({ by: ['graduationYear'], where, _count: true, orderBy: { graduationYear: 'desc' } }),
            this.prisma.alumni.groupBy({ by: ['currentOccupation'], where: { ...where, currentOccupation: { not: null } }, _count: true, orderBy: { _count: { currentOccupation: 'desc' } }, take: 10 }),
        ]);
        return { total, verified, byYear, byOccupation };
    }
};
exports.AlumniService = AlumniService;
exports.AlumniService = AlumniService = AlumniService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlumniService);
//# sourceMappingURL=alumni.service.js.map