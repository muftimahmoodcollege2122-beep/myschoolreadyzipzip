export interface User {
  id: string; email: string;
  role: 'SUPER_ADMIN'|'SCHOOL_ADMIN'|'TEACHER'|'STUDENT'|'PARENT'|'ACCOUNTANT';
  tenantId: string;
  profile?: { firstName: string; lastName: string; phone?: string; avatarUrl?: string };
}
export interface Student {
  id: string; rollNumber: string; admissionDate: string; isActive: boolean;
  user: { email: string; profile: { firstName: string; lastName: string; phone?: string } };
  enrollments: Array<{ section: { name: string; class: { name: string } } }>;
}
export interface AttendanceRecord {
  id: string; studentId: string; date: string;
  status: 'PRESENT'|'ABSENT'|'LATE'|'EXCUSED';
  student?: { rollNumber: string; user: { profile: { firstName: string; lastName: string } } };
}
export interface Invoice {
  id: string; invoiceNumber: string; studentId: string; amount: number;
  dueDate: string; status: 'PENDING'|'PAID'|'OVERDUE'|'CANCELLED'; description: string;
  student?: Student;
}
export interface Teacher {
  id: string; employeeId: string; joiningDate: string; isActive: boolean;
  user: { email: string; profile: { firstName: string; lastName: string; phone?: string } };
  department?: { name: string };
}
export interface Exam {
  id: string; title: string; examType: string; startDate: string; endDate: string;
  maxMarks: number; passMarks: number; resultPublished: boolean;
  section: { name: string; class: { name: string } };
}
export interface DashboardStats {
  totalStudents: number; totalTeachers: number; newAdmissionsThisMonth: number;
  attendance: { present: number; absent: number; total: number; rate: number };
  fees: { outstanding: number; invoiceCount: number };
  upcomingExams: Exam[];
}
export interface PaginatedResponse<T> { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number }; }
