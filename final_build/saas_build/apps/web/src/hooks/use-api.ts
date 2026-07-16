'use client';
/**
 * Central React Query hooks file — every API call in the web app goes through here.
 * Pattern: useXxx() for GET queries, useCreateXxx()/useUpdateXxx()/useDeleteXxx() for mutations.
 * All hooks automatically handle: loading state, error state, cache invalidation.
 * Organized by module: students, teachers, fees, attendance, grades, exams,
 * notifications, dashboard, timetable, question bank, finance, events, billing.
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

export const useDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/teachers/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }) });
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

export const useEditInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; amount?: number; dueDate?: string; discount?: number; fine?: number; notes?: string }) =>
      apiClient.patch(`/fees/invoices/${id}`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });
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

// ── Security ─────────────────────────────────────────────────────────────────
export const useLoginHistory = (params: any = {}) =>
  useQuery({ queryKey: ['login-history', params], queryFn: () => apiClient.get(`/security/login-history?${qs(params)}`), staleTime: 2*60*1000 });

export const useIpRestrictions = () =>
  useQuery({ queryKey: ['ip-restrictions'], queryFn: () => apiClient.get('/security/ip-restrictions') });

export const useSuspiciousActivities = () =>
  useQuery({ queryKey: ['suspicious'], queryFn: () => apiClient.get('/security/suspicious') });

export const useSecurityDashboard = () =>
  useQuery({ queryKey: ['security-dashboard'], queryFn: () => apiClient.get('/security/dashboard'), staleTime: 2*60*1000 });

export const useAddIpRestriction = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/security/ip-restrictions', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['ip-restrictions'] }) });
};

export const useRemoveIpRestriction = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/security/ip-restrictions/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['ip-restrictions'] }) });
};

export const useResolveSuspicious = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.put(`/security/suspicious/${id}/resolve`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ['suspicious'] }) });
};

export const useSetupMfa = () => useMutation({ mutationFn: () => apiClient.post('/security/mfa/setup', {}) });
export const useEnableMfa = () => useMutation({ mutationFn: (token: string) => apiClient.post('/security/mfa/enable', { token }) });
export const useDisableMfa = () => useMutation({ mutationFn: (token: string) => apiClient.post('/security/mfa/disable', { token }) });

export const useRolesOverview = () =>
  useQuery({ queryKey: ['roles-overview'], queryFn: () => apiClient.get('/school/roles-overview'), staleTime: 5 * 60 * 1000 });

// ── Super Admin: platform-wide tenant management ───────────────────────────────
export const useTenantsList = () =>
  useQuery({ queryKey: ['tenants-list'], queryFn: () => apiClient.get('/tenants'), staleTime: 60 * 1000 });

export const usePlatformSummary = () =>
  useQuery({ queryKey: ['platform-summary'], queryFn: () => apiClient.get('/tenants/summary'), staleTime: 60 * 1000 });

export const useImpersonateTenant = () =>
  useMutation({ mutationFn: (tenantId: string) => apiClient.post(`/auth/impersonate/${tenantId}`, {}) });

export const useSuspendTenant = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.post(`/tenants/${id}/suspend`, {}), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants-list'] }); qc.invalidateQueries({ queryKey: ['platform-summary'] }); } });
};

export const useReactivateTenant = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.post(`/tenants/${id}/reactivate`, {}), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants-list'] }); qc.invalidateQueries({ queryKey: ['platform-summary'] }); } });
};

export const useSchoolStats = () =>
  useQuery({ queryKey: ['school-stats'], queryFn: () => apiClient.get('/school/stats'), staleTime: 5 * 60 * 1000 });

// ── Billing / Subscription ───────────────────────────────────────────────────
export const useBillingSubscription = () =>
  useQuery({ queryKey: ['billing-subscription'], queryFn: () => apiClient.get('/billing/subscription'), staleTime: 60 * 1000 });

export const useBillingCheckout = () =>
  useMutation({ mutationFn: (plan: string) => apiClient.post('/billing/checkout', { plan }) });

export const useBillingPortal = () =>
  useMutation({ mutationFn: () => apiClient.post('/billing/portal', {}) });

// ── Payment Gateway Settings (per-school fee-collection credentials) ──────────
export const usePaymentGatewaySettings = () =>
  useQuery({ queryKey: ['payment-gateway-settings'], queryFn: () => apiClient.get('/school/payment-gateway-settings') });

export const useUpdatePaymentGatewaySettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gateway, ...dto }: any) => apiClient.put(`/school/payment-gateway-settings/${gateway}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-gateway-settings'] }),
  });
};

// ── Notification Settings (SMS / Email) ────────────────────────────────────────
export const useNotificationSettings = () =>
  useQuery({ queryKey: ['notification-settings'], queryFn: () => apiClient.get('/school/notification-settings') });

export const useUpdateNotificationSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ channel, ...dto }: any) => apiClient.put(`/school/notification-settings/${channel}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-settings'] }),
  });
};

// ── Website Settings ─────────────────────────────────────────────────────────
export const useWebsiteSettings = () =>
  useQuery({ queryKey: ['website-settings'], queryFn: () => apiClient.get('/school/website-settings'), staleTime: 5*60*1000 });

export const useSaveWebsiteSettings = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.put('/school/website-settings', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['website-settings'] }) });
};

// ── Website Pages ─────────────────────────────────────────────────────────────
export const useWebsitePages = () =>
  useQuery({ queryKey: ['website-pages'], queryFn: () => apiClient.get('/themes/pages'), staleTime: 60*1000 });

export const useSaveWebsitePage = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (page: any) => apiClient.put('/themes/pages', page), onSuccess: () => qc.invalidateQueries({ queryKey: ['website-pages'] }) });
};

export const useThemePresets = () =>
  useQuery({ queryKey: ['theme-presets'], queryFn: () => apiClient.get('/themes/presets'), staleTime: 60*60*1000 });

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
