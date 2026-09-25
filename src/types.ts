export type AcademicYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';

export type StudentStatus = 'Active' | 'On Leave' | 'Graduated' | 'Suspended';

export type TuitionStatus = 'Paid' | 'Partial' | 'Overdue';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';

export type LetterGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | 'In Progress';

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2026-001"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  department: string;
  major: string;
  year: AcademicYear;
  status: StudentStatus;
  gpa: number;
  advisor: string;
  enrollmentDate: string;
  expectedGraduation: string;
  tuitionStatus: TuitionStatus;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string[];
}

export interface Course {
  id: string;
  code: string; // e.g. "CS-101"
  name: string;
  department: string;
  credits: number;
  instructor: string;
  room: string;
  schedule: string; // e.g. "Mon/Wed 10:00 - 11:30 AM"
  semester: string; // e.g. "Fall 2026"
  maxCapacity: number;
  enrolledCount: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  semester: string;
  grade: LetterGrade;
  attendanceRate: number; // 0-100%
  enrolledAt: string;
}

export interface AttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  title: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'grade' | 'attendance' | 'system';
}

export type ViewTab = 'students' | 'courses' | 'attendance' | 'analytics' | 'settings';
