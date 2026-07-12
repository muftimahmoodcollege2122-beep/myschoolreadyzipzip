'use client';
/**
 * Central React Query hooks file — every API call in the web app goes through here.
 * Pattern: useXxx() for GET queries, useCreateXxx()/useUpdateXxx()/useDeleteXxx() for mutations.
 * All hooks automatically handle: loading state, error state, cache invalidation.
 * Organized by module: students, teachers, fees, attendance, grades, exams,
 * notifications, dashboard, library, transport, events, billing, AI, alumni, etc.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { PaginatedResponse, Student, Invoice, Teacher, Exam, DashboardStats, TeacherPerformance } from '../types';

const qs = (p: Record<string, any>) => new URLSearchParams(Object.entries(p).filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>[k,String(v)])).toString();

// ── Dashboard ───────────────────────────────────────────────────────────────
export const useDashboard = (schoolId: string) =>
  useQuery({ queryKey: ['dashboard', schoolId], queryFn: () => apiClient.get<DashboardStats>(`/dashboard?schoolId=${schoolId}`), staleTime: 5*60*1000 });

export const useTeacherPerformance = () =>
  useQuery({ queryKey: ['teacher-performance'], queryFn: () => apiClient.get<TeacherPerformance[]>('/reports/teacher-performance'), staleTime: 5*60*1000 });

// ── My Profile (role-based self-lookup) ──────────────────────────────────────
export const useMyStudent = () =>
  useQuery({ queryKey: ['my-student'], queryFn: () => apiClient.get('/students/me'), retry: false, staleTime: 5*60*1000 });

export const useMyTeacher = () =>
  useQuery({ queryKey: ['my-teacher'], queryFn: () => apiClient.get('/teachers/me'), retry: false, staleTime: 5*60*1000 });

export const useTeacherSchedule = (teacherId: string) =>
  useQuery({ queryKey: ['teacher-schedule', teacherId], queryFn: () => apiClient.get(`/teachers/${teacherId}/schedule`), enabled: !!teacherId, staleTime: 10*60*1000 });

export const useSectionTimetable = (sectionId: string) =>
  useQuery({ queryKey: ['section-timetable', sectionId], queryFn: () => apiClient.get(`/timetable/section/${sectionId}`), enabled: !!sectionId, staleTime: 10*60*1000 });

export const useTeacherTimetable = (teacherId: string) =>
  useQuery({ queryKey: ['teacher-timetable', teacherId], queryFn: () => apiClient.get(`/timetable/teacher/${teacherId}`), enabled: !!teacherId, staleTime: 10*60*1000 });

// ── Students ────────────────────────────────────────────────────────────────
export const useStudents = (params: any = {}) =>
  useQuery({ queryKey: ['students', params], queryFn: () => apiClient.get<PaginatedResponse<Student>>(`/students?${qs(params)}`) });

export const useStudent = (id: string) =>
  useQuery({ queryKey: ['student', id], queryFn: () => apiClient.get<Student>(`/students/${id}`), enabled: !!id });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post<Student>('/students', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }) });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => apiClient.put<Student>(`/students/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }) });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/students/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }) });
};

export const useStudentGrades = (studentId: string) =>
  useQuery({ queryKey: ['student-grades', studentId], queryFn: () => apiClient.get(`/grades/student/${studentId}`), enabled: !!studentId });

export const useStudentAttendance = (studentId: string) =>
  useQuery({ queryKey: ['student-attendance', studentId], queryFn: () => apiClient.get(`/attendance/student/${studentId}`), enabled: !!studentId });

// ── Teachers ────────────────────────────────────────────────────────────────
export const useTeachers = (params: any = {}) =>
  useQuery({ queryKey: ['teachers', params], queryFn: () => apiClient.get<PaginatedResponse<Teacher>>(`/teachers?${qs(params)}`) });

export const useCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/teachers', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }) });
};

// ── Attendance ──────────────────────────────────────────────────────────────
export const useAttendance = (sectionId: string, date: string) =>
  useQuery({ queryKey: ['attendance', sectionId, date], queryFn: () => apiClient.get(`/attendance/section/${sectionId}?date=${date}`), enabled: !!sectionId && !!date });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/attendance', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }) });
};

export const useAttendanceReport = (sectionId: string, from: string, to: string) =>
  useQuery({ queryKey: ['attendance-report', sectionId, from, to], queryFn: () => apiClient.get(`/attendance/section/${sectionId}/report?from=${from}&to=${to}`), enabled: !!sectionId && !!from && !!to });

// ── Fees ─────────────────────────────────────────────────────────────────────
export const useOutstandingFees = (schoolId: string) =>
  useQuery({ queryKey: ['fees','outstanding',schoolId], queryFn: () => apiClient.get<Invoice[]>(`/fees/outstanding`), staleTime: 2*60*1000 });

export const useStudentFees = (studentId: string) =>
  useQuery({ queryKey: ['fees','student',studentId], queryFn: () => apiClient.get<Invoice[]>(`/fees/student/${studentId}`), enabled: !!studentId });

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/fees/payments', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['fees'] }) });
};

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/fees/invoices', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['fees'] }) });
};

export const useFeeRevenue = () =>
  useQuery({ queryKey: ['fees','revenue'], queryFn: () => apiClient.get('/fees/revenue'), staleTime: 5*60*1000 });

// ── Exams ────────────────────────────────────────────────────────────────────
export const useExams = (sectionId?: string, academicYear?: string) =>
  useQuery({ queryKey: ['exams', sectionId, academicYear], queryFn: () => apiClient.get<Exam[]>(`/exams?${qs({ sectionId, academicYear })}`) });

export const useExamResults = (examId: string) =>
  useQuery({ queryKey: ['exam-results', examId], queryFn: () => apiClient.get(`/exams/${examId}/results`), enabled: !!examId });

export const useCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/exams', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }) });
};

// ── Grades ───────────────────────────────────────────────────────────────────
export const useGradebook = (sectionId: string) =>
  useQuery({ queryKey: ['gradebook', sectionId], queryFn: () => apiClient.get(`/grades/section/${sectionId}/gradebook`), enabled: !!sectionId });

export const useReportCard = (studentId: string) =>
  useQuery({ queryKey: ['report-card', studentId], queryFn: () => apiClient.get(`/grades/student/${studentId}/report-card`), enabled: !!studentId });

export const useSubmitGrade = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/grades', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['gradebook'] }) });
};

// ── Notifications ─────────────────────────────────────────────────────────────
function hasAuthToken() {
  if (typeof window === 'undefined') return false;
  try {
    const s = localStorage.getItem('auth-storage');
    return !!(s && JSON.parse(s)?.state?.accessToken);
  } catch { return false; }
}

export const useNotifications = (page = 1) =>
  useQuery({ queryKey: ['notifications', page], queryFn: () => apiClient.get(`/notifications?page=${page}&limit=20`), refetchInterval: 30000, enabled: hasAuthToken(), retry: false });

export const useUnreadCount = () =>
  useQuery({ queryKey: ['notifications-unread'], queryFn: () => apiClient.get('/notifications/unread-count'), refetchInterval: 30000, enabled: hasAuthToken(), retry: false });

// ── School Data ───────────────────────────────────────────────────────────────
export const useClasses = () =>
  useQuery({ queryKey: ['classes'], queryFn: () => apiClient.get('/school/classes'), staleTime: 10*60*1000 });

export const useSections = (classId?: string) =>
  useQuery({ queryKey: ['sections', classId], queryFn: () => apiClient.get(`/school/sections?${qs({ classId })}`), staleTime: 10*60*1000 });

export const useSubjects = () =>
  useQuery({ queryKey: ['subjects'], queryFn: () => apiClient.get('/school/subjects'), staleTime: 10*60*1000 });

export const useStaff = (params: any = {}) =>
  useQuery({ queryKey: ['staff', params], queryFn: () => apiClient.get(`/school/staff?${qs(params)}`) });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/staff', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }) });
};

export const useEvents = (upcoming = false) =>
  useQuery({ queryKey: ['events', upcoming], queryFn: () => apiClient.get(`/school/events?upcoming=${upcoming}`), staleTime: 5*60*1000 });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/events', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/school/events/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};

export const useAnnouncements = (page = 1) =>
  useQuery({ queryKey: ['announcements', page], queryFn: () => apiClient.get(`/school/announcements?page=${page}&limit=20`) });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/announcements', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }) });
};

export const useSchoolInfo = () =>
  useQuery({ queryKey: ['school-info'], queryFn: () => apiClient.get('/school/info'), staleTime: 10*60*1000 });

export const useUpdateSchoolInfo = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.put('/school/info', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['school-info'] }) });
};

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/classes', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }) });
};

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/sections', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['sections'] }) });
};

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/subjects', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }) });
};

// ── Library ──────────────────────────────────────────────────────────────────
export const useLibraryBooks = (params: any = {}) =>
  useQuery({ queryKey: ['library-books', params], queryFn: () => apiClient.get(`/library/books?${qs(params)}`) });

export const useLibraryStats = () =>
  useQuery({ queryKey: ['library-stats'], queryFn: () => apiClient.get('/library/stats'), staleTime: 5*60*1000 });

export const useLibraryCategories = () =>
  useQuery({ queryKey: ['library-categories'], queryFn: () => apiClient.get('/library/categories'), staleTime: 10*60*1000 });

export const useBookIssues = (returned?: boolean, page = 1) =>
  useQuery({ queryKey: ['book-issues', returned, page], queryFn: () => apiClient.get(`/library/issues?${qs({ returned: returned?.toString(), page })}`) });

export const useCreateBook = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/library/books', dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-books'] }); qc.invalidateQueries({ queryKey: ['library-stats'] }); } });
};

export const useIssueBook = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ bookId, ...dto }: any) => apiClient.post(`/library/books/${bookId}/issue`, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-books'] }); qc.invalidateQueries({ queryKey: ['book-issues'] }); qc.invalidateQueries({ queryKey: ['library-stats'] }); } });
};

export const useReturnBook = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (issueId: string) => apiClient.post(`/library/issues/${issueId}/return`, {}), onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-books'] }); qc.invalidateQueries({ queryKey: ['book-issues'] }); qc.invalidateQueries({ queryKey: ['library-stats'] }); } });
};

// ── Transport ─────────────────────────────────────────────────────────────────
export const useTransportRoutes = (params: any = {}) =>
  useQuery({ queryKey: ['transport-routes', params], queryFn: () => apiClient.get(`/transport/routes?${qs(params)}`) });

export const useTransportStats = () =>
  useQuery({ queryKey: ['transport-stats'], queryFn: () => apiClient.get('/transport/stats'), staleTime: 5*60*1000 });

export const useCreateRoute = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/transport/routes', dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport-routes'] }); qc.invalidateQueries({ queryKey: ['transport-stats'] }); } });
};

export const useUpdateRoute = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => apiClient.put(`/transport/routes/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['transport-routes'] }) });
};

export const useDeleteRoute = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/transport/routes/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport-routes'] }); qc.invalidateQueries({ queryKey: ['transport-stats'] }); } });
};

// ── Timetable ─────────────────────────────────────────────────────────────────
export const useTimetable = (sectionId: string) =>
  useQuery({ queryKey: ['timetable', sectionId], queryFn: () => apiClient.get(`/timetable?sectionId=${sectionId}`), enabled: !!sectionId, staleTime: 10*60*1000 });

// ── Analytics ─────────────────────────────────────────────────────────────────
export const useAnalytics = () =>
  useQuery({ queryKey: ['analytics'], queryFn: () => apiClient.get('/dashboard'), staleTime: 5*60*1000 });

// ── Question Bank ─────────────────────────────────────────────────────────────
export const useQuestionBanks = () =>
  useQuery({ queryKey: ['qbanks'], queryFn: () => apiClient.get('/question-bank/banks'), staleTime: 5*60*1000 });

export const useQuestions = (params: any = {}) =>
  useQuery({ queryKey: ['questions', params], queryFn: () => apiClient.get(`/question-bank/questions?${qs(params)}`) });

export const useCreateQuestionBank = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/question-bank/banks', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['qbanks'] }) });
};

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/question-bank/questions', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }) });
};

export const useGeneratePaper = () =>
  useMutation({ mutationFn: (dto: any) => apiClient.post('/question-bank/generate-paper', dto) });

// ── Finance ───────────────────────────────────────────────────────────────────
export const useFinanceDashboard = () =>
  useQuery({ queryKey: ['fin-dashboard'], queryFn: () => apiClient.get('/finance/dashboard'), staleTime: 5*60*1000 });

export const useExpenses = (params: any = {}) =>
  useQuery({ queryKey: ['expenses', params], queryFn: () => apiClient.get(`/finance/expenses?${qs(params)}`) });

export const useCashbook = (params: any = {}) =>
  useQuery({ queryKey: ['cashbook', params], queryFn: () => apiClient.get(`/finance/cashbook?${qs(params)}`) });

export const useBudgets = (params: any = {}) =>
  useQuery({ queryKey: ['budgets', params], queryFn: () => apiClient.get(`/finance/budgets?${qs(params)}`) });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/finance/expenses', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
};

export const useApproveExpense = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.put(`/finance/expenses/${id}/approve`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
};

export const useCreateCashEntry = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/finance/cashbook', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['cashbook'] }) });
};

export const useSetBudget = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/finance/budgets', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }) });
};

// ── Discounts & Scholarships ─────────────────────────────────────────────────
export const useScholarships = () =>
  useQuery({ queryKey: ['scholarships'], queryFn: () => apiClient.get('/discounts/scholarships'), staleTime: 10*60*1000 });

export const useScholarshipGrants = () =>
  useQuery({ queryKey: ['sch-grants'], queryFn: () => apiClient.get('/discounts/scholarships/grants') });

export const useDiscounts = () =>
  useQuery({ queryKey: ['discounts'], queryFn: () => apiClient.get('/discounts'), staleTime: 10*60*1000 });

export const useInstallmentPlans = () =>
  useQuery({ queryKey: ['installment-plans'], queryFn: () => apiClient.get('/discounts/installment-plans') });

export const useCreateScholarship = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/discounts/scholarships', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['scholarships'] }) });
};

export const useGrantScholarship = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/discounts/scholarships/grant', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['sch-grants'] }) });
};

export const useCreateDiscount = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/discounts', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }) });
};

// ── Student Records ──────────────────────────────────────────────────────────
export const useStudentBehaviors = (studentId?: string) =>
  useQuery({ queryKey: ['behaviors', studentId], queryFn: () => apiClient.get(`/student-records/behavior?${qs({ studentId })}`), enabled: !!studentId });

export const useStudentMedical = (studentId?: string) =>
  useQuery({ queryKey: ['medical', studentId], queryFn: () => apiClient.get(`/student-records/medical?${qs({ studentId })}`), enabled: !!studentId });

export const useStudentAchievements = (studentId?: string) =>
  useQuery({ queryKey: ['achievements', studentId], queryFn: () => apiClient.get(`/student-records/achievements?${qs({ studentId })}`), enabled: !!studentId });

export const useCreateBehavior = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/student-records/behavior', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['behaviors'] }) });
};

export const useCreateAchievement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/student-records/achievements', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['achievements'] }) });
};

// ── HR Extended ──────────────────────────────────────────────────────────────
export const useLessonPlans = (params: any = {}) =>
  useQuery({ queryKey: ['lesson-plans', params], queryFn: () => apiClient.get(`/hr/lesson-plans?${qs(params)}`) });

export const useSubstitutions = () =>
  useQuery({ queryKey: ['substitutions'], queryFn: () => apiClient.get('/hr/substitutions') });

export const useTrainingRecords = () =>
  useQuery({ queryKey: ['training'], queryFn: () => apiClient.get('/hr/training') });

export const useCreateLessonPlan = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/hr/lesson-plans', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson-plans'] }) });
};

export const useApproveLessonPlan = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.put(`/hr/lesson-plans/${id}/approve`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson-plans'] }) });
};

export const useCreateSubstitution = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/hr/substitutions', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['substitutions'] }) });
};

// ── Content ──────────────────────────────────────────────────────────────────
export const useBlogPosts = (params: any = {}) =>
  useQuery({ queryKey: ['blog-posts', params], queryFn: () => apiClient.get(`/content/posts?${qs(params)}`) });

export const useGalleryAlbums = () =>
  useQuery({ queryKey: ['gallery-albums'], queryFn: () => apiClient.get('/content/albums'), staleTime: 5*60*1000 });

export const useCreateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/content/posts', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-posts'] }) });
};

export const usePublishBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.put(`/content/posts/${id}`, { status: 'PUBLISHED' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-posts'] }) });
};

export const useCreateGalleryAlbum = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/content/albums', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery-albums'] }) });
};

// ── Security ─────────────────────────────────────────────────────────────────
export const useLoginHistory = (params: any = {}) =>
  useQuery({ queryKey: ['login-history', params], queryFn: () => apiClient.get(`/security/login-history?${qs(params)}`), staleTime: 2*60*1000 });

export const useIpRestrictions = () =>
  useQuery({ queryKey: ['ip-restrictions'], queryFn: () => apiClient.get('/security/ip-restrictions') });

export const useSuspiciousActivities = () =>
  useQuery({ queryKey: ['suspicious'], queryFn: () => apiClient.get('/security/suspicious-activities') });

export const useSecurityDashboard = () =>
  useQuery({ queryKey: ['security-dashboard'], queryFn: () => apiClient.get('/security/dashboard'), staleTime: 2*60*1000 });

export const useAddIpRestriction = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/security/ip-restrictions', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['ip-restrictions'] }) });
};

// ── Support Tickets ──────────────────────────────────────────────────────────
export const useSupportTickets = (params: any = {}) =>
  useQuery({ queryKey: ['tickets', params], queryFn: () => apiClient.get(`/support-tickets?${qs(params)}`) });

export const useTicketStats = () =>
  useQuery({ queryKey: ['ticket-stats'], queryFn: () => apiClient.get('/support-tickets/stats'), staleTime: 2*60*1000 });

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/support-tickets', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }) });
};

export const useRespondToTicket = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => apiClient.post(`/support-tickets/${id}/respond`, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); qc.invalidateQueries({ queryKey: ['ticket'] }); } });
};

export const useUpdateTicketStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: any) => apiClient.put(`/support-tickets/${id}/status`, { status }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); qc.invalidateQueries({ queryKey: ['ticket'] }); } });
};

// ── AI Analytics ─────────────────────────────────────────────────────────────
export const useAiAnalytics = (type: string) =>
  useQuery({ queryKey: ['ai-analytics', type], queryFn: () => apiClient.get(`/ai-analytics/${type}`), staleTime: 10*60*1000 });

export const useAiPrediction = () =>
  useMutation({ mutationFn: (dto: any) => apiClient.post('/ai-analytics/predict', dto) });

// ── Alumni ───────────────────────────────────────────────────────────────────
export const useAlumni = (params: any = {}) =>
  useQuery({ queryKey: ['alumni', params], queryFn: () => apiClient.get(`/alumni?${qs(params)}`) });

export const useCreateAlumni = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/alumni', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['alumni'] }) });
};

export const useAlumniStats = () =>
  useQuery({ queryKey: ['alumni-stats'], queryFn: () => apiClient.get('/alumni/stats'), staleTime: 10*60*1000 });

// ── Forms ────────────────────────────────────────────────────────────────────
export const useForms = () =>
  useQuery({ queryKey: ['forms'], queryFn: () => apiClient.get('/forms'), staleTime: 10*60*1000 });

export const useFormResponses = (formId: string) =>
  useQuery({ queryKey: ['form-responses', formId], queryFn: () => apiClient.get(`/forms/${formId}/responses`), enabled: !!formId });

export const useCreateForm = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/forms', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['forms'] }) });
};

export const useSubmitFormResponse = () =>
  useMutation({ mutationFn: ({ formId, ...dto }: any) => apiClient.post(`/forms/${formId}/submit`, dto) });

// ── LMS ─────────────────────────────────────────────────────────────────────
export const useLmsCourses = () =>
  useQuery({ queryKey: ['lms-courses'], queryFn: () => apiClient.get('/school/lms'), staleTime: 5*60*1000 });

export const useCreateLmsCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/school/lms', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['lms-courses'] }) });
};

export const useUpdateLmsCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => apiClient.put(`/school/lms/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['lms-courses'] }) });
};

export const useDeleteLmsCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/school/lms/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['lms-courses'] }) });
};

// ── Website Settings ─────────────────────────────────────────────────────────
export const useWebsiteSettings = () =>
  useQuery({ queryKey: ['website-settings'], queryFn: () => apiClient.get('/school/website-settings'), staleTime: 5*60*1000 });

export const useSaveWebsiteSettings = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.put('/school/website-settings', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['website-settings'] }) });
};

// ── Generic School Section CRUD ───────────────────────────────────────────────
export const useSchoolSection = (section: string) =>
  useQuery({ queryKey: ['school-section', section], queryFn: () => apiClient.get(`/school/section/${section}`), staleTime: 2*60*1000 });

export const useCreateSchoolItem = (section: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post(`/school/section/${section}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['school-section', section] }) });
};

export const useUpdateSchoolItem = (section: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...dto }: any) => apiClient.put(`/school/section/${section}/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['school-section', section] }) });
};

export const useDeleteSchoolItem = (section: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/school/section/${section}/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['school-section', section] }) });
};

// ── Delete Announcement ───────────────────────────────────────────────────────
export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/school/announcements/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }) });
};

// ── Payment Gateway ───────────────────────────────────────────────────────────
export const usePlanPrices = () =>
  useQuery({ queryKey: ['plan-prices'], queryFn: () => apiClient.get('/payments/plans'), staleTime: 60 * 60 * 1000 });

export const useInitiatePayment = () =>
  useMutation({ mutationFn: (dto: { method: string; plan: string; tenantId: string; email: string; schoolName: string; phone?: string }) => apiClient.post('/payments/initiate', dto) });

export const useVerifyPayment = () =>
  useMutation({ mutationFn: (dto: { paymentId: string; transactionId: string; screenshot?: string }) => apiClient.post('/payments/verify', dto) });

export const usePendingPayments = () =>
  useQuery({ queryKey: ['pending-payments'], queryFn: () => apiClient.get('/payments/admin/pending'), staleTime: 30 * 1000 });

export const useApprovePayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.post(`/payments/admin/approve/${id}`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-payments'] }) });
};

// ── Portal-specific hooks (Teacher / Student / Parent) ────────────────────────
export const usePortalAnnouncements = (slug: string) =>
  useQuery({ queryKey: ['portal-notices', slug], queryFn: () => apiClient.get(`/school/announcements?tenantSlug=${slug}&limit=10`), enabled: !!slug, staleTime: 5 * 60 * 1000 });

export const useMyLeaveRequests = () =>
  useQuery({ queryKey: ['my-leave-requests'], queryFn: () => apiClient.get('/hr/leave-requests/my'), staleTime: 2 * 60 * 1000 });

export const useSubmitLeaveRequest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/hr/leave-requests', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['my-leave-requests'] }) });
};

export const useTeacherStats = (slug: string) =>
  useQuery({ queryKey: ['teacher-stats', slug], queryFn: () => apiClient.get(`/dashboard/stats?tenantSlug=${slug}`), enabled: !!slug, staleTime: 5 * 60 * 1000 });
// ── Missing hooks ─────────────────────────────────────────────────────────────
export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/finance/budgets', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }) });
};

export const useSubmitLessonPlan = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.put(`/hr/lesson-plans/${id}/submit`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson-plans'] }) });
};
