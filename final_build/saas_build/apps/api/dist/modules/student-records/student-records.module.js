"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const student_records_controller_1 = require("./student-records.controller");
const student_records_service_1 = require("./student-records.service");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
let StudentRecordsModule = class StudentRecordsModule {
};
exports.StudentRecordsModule = StudentRecordsModule;
exports.StudentRecordsModule = StudentRecordsModule = __decorate([
    (0, common_1.Module)({ controllers: [student_records_controller_1.StudentRecordsController], providers: [student_records_service_1.StudentRecordsService, prisma_service_1.PrismaService, audit_service_1.AuditService], exports: [student_records_service_1.StudentRecordsService] })
], StudentRecordsModule);
//# sourceMappingURL=student-records.module.js.map