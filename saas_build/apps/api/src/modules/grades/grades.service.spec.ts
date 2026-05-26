import { Test, TestingModule } from '@nestjs/testing';
import { GradesService } from './grades.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { EventPublisher } from '../../events/event-publisher.service';

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
  let service: GradesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: EventPublisher, useValue: mockEvents },
      ],
    }).compile();
    service = module.get<GradesService>(GradesService);
    jest.clearAllMocks();
  });

  it('createGrade rejects if teacher not assigned', async () => {
    mockPrisma.classSubject.findFirst.mockResolvedValue(null);
    await expect(service.createGrade({ classSubjectId: 'cs1', studentId: 's1', score: 80, maxScore: 100, academicYear: '2024', term: 'Term1', assessmentType: 'MIDTERM', title: 'Mid' } as any, 'tenant-1', 'teacher-1'))
      .rejects.toThrow('not assigned');
  });

  it('getStudentReportCard throws if no grades', async () => {
    mockPrisma.grade.findMany.mockResolvedValue([]);
    await expect(service.getStudentReportCard('student-1', 'tenant-1', '2024', 'Term1'))
      .rejects.toThrow('No grades found');
  });
});
