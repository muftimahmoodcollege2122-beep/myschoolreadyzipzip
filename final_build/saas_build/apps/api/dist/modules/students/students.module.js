"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsModule = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const students_controller_1 = require("./students.controller");
const audit_service_1 = require("../../common/audit/audit.service");
const plan_guard_1 = require("../../common/guards/plan.guard");
const cache_service_1 = require("../../common/cache/cache.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const prisma_service_1 = require("../../database/prisma.service");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [students_controller_1.StudentsController],
        providers: [students_service_1.StudentsService, audit_service_1.AuditService, plan_guard_1.PlanGuard, cache_service_1.CacheService, event_publisher_service_1.EventPublisher, prisma_service_1.PrismaService],
        exports: [students_service_1.StudentsService],
    })
], StudentsModule);
//# sourceMappingURL=students.module.js.map