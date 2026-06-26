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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const question_bank_service_1 = require("./question-bank.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let QuestionBankController = class QuestionBankController {
    constructor(svc) {
        this.svc = svc;
    }
    createBank(dto, tid, u) { return this.svc.createBank(dto, tid, u.sub); }
    listBanks(tid, sid, subId) { return this.svc.listBanks(tid, sid, subId); }
    createQuestion(dto, tid, u) { return this.svc.createQuestion(dto, tid, u.sub); }
    listQuestions(tid, bid, t, d, sid, s) { return this.svc.listQuestions(tid, bid, t, d, sid, s); }
    updateQuestion(id, dto, tid) { return this.svc.updateQuestion(id, dto, tid); }
    deleteQuestion(id, tid) { return this.svc.deleteQuestion(id, tid); }
    generatePaper(dto, tid) { return this.svc.generatePaper(dto, tid); }
    getBankStats(id, tid) { return this.svc.getBankStats(id, tid); }
    startExam(examId, tid, u) { return this.svc.startOnlineExam(examId, u.sub, tid); }
    submitAnswer(sid, dto, tid) { return this.svc.submitAnswer(sid, dto.questionId, dto.answer, tid); }
    submitExam(sid, tid) { return this.svc.submitExam(sid, tid); }
    getSession(sid, tid) { return this.svc.getSessionResults(sid, tid); }
};
exports.QuestionBankController = QuestionBankController;
__decorate([
    (0, common_1.Post)('banks'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "createBank", null);
__decorate([
    (0, common_1.Get)('banks'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "listBanks", null);
__decorate([
    (0, common_1.Post)('questions'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Get)('questions'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('bankId')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('difficulty')),
    __param(4, (0, common_1.Query)('subjectId')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "listQuestions", null);
__decorate([
    (0, common_1.Put)('questions/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)('questions/:id'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Post)('generate-paper'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "generatePaper", null);
__decorate([
    (0, common_1.Get)('banks/:id/stats'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "getBankStats", null);
__decorate([
    (0, common_1.Post)('online-exam/:examId/start'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "startExam", null);
__decorate([
    (0, common_1.Post)('online-exam/sessions/:sessionId/answer'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Post)('online-exam/sessions/:sessionId/submit'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "submitExam", null);
__decorate([
    (0, common_1.Get)('online-exam/sessions/:sessionId'),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuestionBankController.prototype, "getSession", null);
exports.QuestionBankController = QuestionBankController = __decorate([
    (0, swagger_1.ApiTags)('Question Bank'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('question-bank'),
    __metadata("design:paramtypes", [question_bank_service_1.QuestionBankService])
], QuestionBankController);
//# sourceMappingURL=question-bank.controller.js.map