'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { PaginatedResponse, Student, Invoice, Teacher, Exam, DashboardStats } from '../types';

const qs = (p: Record<string, any>) => new URLSearchParams(Object.entries(p).filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>[k,String(v)])).toString();

// ── Dashboard ───────────────────────────────────────────────────────────────
export const useDashboard = (schoolId: string) =>
  useQuery({ queryKey: ['dashboard', schoolId], queryFn: () => apiClient.get<DashboardStats>(`/dashboard?schoolId=${schoolId}`), staleTime: 5*60*1000 });

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
