"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const grades_service_1 = require("./grades.service");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const event_publisher_service_1 = require("../../events/event-publisher.service");
const mockPrisma = {
    grade: { findMany: jest.fn(), create: jest.fn(), upsert: jest.fn() },
    classSubject: { findFirst: jest.fn() },
    studentEnrollment: { findMany: jest.fn() },
    outboxEvent: { create: jest.fn() },
    $transaction: jest.fn(cb => cb(mockPrisma)),
};
const mockAudit = { log: jest.fn() };
const mockEvents = { publish: jest.fn() };
describe('GradesService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                grades_service_1.GradesService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: audit_service_1.AuditService, useValue: mockAudit },
                { provide: event_publisher_service_1.EventPublisher, useValue: mockEvents },
            ],
        }).compile();
        service = module.get(grades_service_1.GradesService);
        jest.clearAllMocks();
    });
    it('createGrade rejects if teacher not assigned', async () => {
        mockPrisma.classSubject.findFirst.mockResolvedValue(null);
        await expect(service.createGrade({ classSubjectId: 'cs1', studentId: 's1', score: 80, maxScore: 100, academicYear: '2024', term: 'Term1', assessmentType: 'MIDTERM', title: 'Mid' }, 'tenant-1', 'teacher-1'))
            .rejects.toThrow('not assigned');
    });
    it('getStudentReportCard throws if no grades', async () => {
        mockPrisma.grade.findMany.mockResolvedValue([]);
        await expect(service.getStudentReportCard('student-1', 'tenant-1', '2024', 'Term1'))
            .rejects.toThrow('No grades found');
    });
});
//# sourceMappingURL=grades.service.spec.js.map