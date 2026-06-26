"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const grades_module_1 = require("../grades/grades.module");
const attendance_module_1 = require("../attendance/attendance.module");
const s3_storage_service_1 = require("../../common/storage/s3-storage.service");
const prisma_service_1 = require("../../database/prisma.service");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({ name: 'reports' }),
            grades_module_1.GradesModule,
            attendance_module_1.AttendanceModule,
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService, prisma_service_1.PrismaService, s3_storage_service_1.S3StorageService],
        exports: [reports_service_1.ReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map