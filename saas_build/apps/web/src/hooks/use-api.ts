'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { PaginatedResponse, Student, Invoice, Teacher, Exam, DashboardStats } from '../types';

const qs = (p: Record<string, any>) => new URLSearchParams(Object.entries(p).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)])).toString();

export const useDashboard = (schoolId: string) =>
  useQuery({ queryKey: ['dashboard', schoolId], queryFn: () => apiClient.get<DashboardStats>(`/dashboard?schoolId=${schoolId}`), staleTime: 5*60*1000 });

export const useStudents = (params: any = {}) =>
  useQuery({ queryKey: ['students', params], queryFn: () => apiClient.get<PaginatedResponse<Student>>(`/students?${qs(params)}`) });

export const useStudent = (id: string) =>
  useQuery({ queryKey: ['student', id], queryFn: () => apiClient.get<Student>(`/students/${id}`), enabled: !!id });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post<Student>('/students', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }) });
};

export const useAttendance = (sectionId: string, date: string) =>
  useQuery({ queryKey: ['attendance', sectionId, date], queryFn: () => apiClient.get(`/attendance/section/${sectionId}?date=${date}`), enabled: !!sectionId && !!date });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/attendance', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }) });
};

export const useOutstandingFees = (schoolId: string) =>
  useQuery({ queryKey: ['fees','outstanding',schoolId], queryFn: () => apiClient.get<Invoice[]>(`/fees/outstanding?schoolId=${schoolId}`), enabled: !!schoolId });

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: any) => apiClient.post('/fees/payments', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['fees'] }) });
};

export const useTeachers = (params: any = {}) =>
  useQuery({ queryKey: ['teachers', params], queryFn: () => apiClient.get<PaginatedResponse<Teacher>>(`/teachers?${qs(params)}`) });

export const useExams = (sectionId?: string, academicYear?: string) =>
  useQuery({ queryKey: ['exams', sectionId, academicYear], queryFn: () => apiClient.get<Exam[]>(`/exams?${qs({ sectionId, academicYear })}`) });

export const useExamResults = (examId: string) =>
  useQuery({ queryKey: ['exam-results', examId], queryFn: () => apiClient.get(`/exams/${examId}/results`), enabled: !!examId });

export const useNotifications = (page = 1) =>
  useQuery({ queryKey: ['notifications', page], queryFn: () => apiClient.get(`/notifications?page=${page}&limit=20`), refetchInterval: 30000 });
