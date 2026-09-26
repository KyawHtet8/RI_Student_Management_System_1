import { Student, Course, Enrollment, AttendanceEntry, ActivityLog, LetterGrade } from '../types';
import { INITIAL_STUDENTS, INITIAL_COURSES, INITIAL_ENROLLMENTS, INITIAL_ATTENDANCE, GRADE_POINTS } from '../data/mockData';

const KEYS = {
  STUDENTS: 'sms_students_data_v1',
  COURSES: 'sms_courses_data_v1',
  ENROLLMENTS: 'sms_enrollments_data_v1',
  ATTENDANCE: 'sms_attendance_data_v1',
  LOGS: 'sms_activity_logs_v1',
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load students from localStorage', e);
  }
  return INITIAL_STUDENTS;
};

export const saveStudents = (students: Student[]) => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
};

export const getStoredCourses = (): Course[] => {
  try {
    const raw = localStorage.getItem(KEYS.COURSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load courses from localStorage', e);
  }
  return INITIAL_COURSES;
};

export const saveCourses = (courses: Course[]) => {
  try {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses to localStorage', e);
  }
};

export const getStoredEnrollments = (): Enrollment[] => {
  try {
    const raw = localStorage.getItem(KEYS.ENROLLMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load enrollments from localStorage', e);
  }
  return INITIAL_ENROLLMENTS;
};

export const saveEnrollments = (enrollments: Enrollment[]) => {
  try {
    localStorage.setItem(KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  } catch (e) {
    console.error('Failed to save enrollments to localStorage', e);
  }
};

export const getStoredAttendance = (): AttendanceEntry[] => {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load attendance from localStorage', e);
  }
  return INITIAL_ATTENDANCE;
};

export const saveAttendance = (records: AttendanceEntry[]) => {
  try {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendance to localStorage', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      title: 'System Initialized',
      details: 'Student Management System database synchronized.',
      type: 'system',
    },
  ];
};

export const saveLogs = (logs: ActivityLog[]) => {
  try {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 50))); // Keep last 50 logs
  } catch (e) {
    console.error('Failed to save logs', e);
  }
};

export const calculateStudentGPA = (
  studentId: string,
  enrollments: Enrollment[],
  courses: Course[]
): number => {
  const studentEnrollments = enrollments.filter(
    (e) => e.studentId === studentId && e.grade !== 'In Progress'
  );

  if (studentEnrollments.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  studentEnrollments.forEach((e) => {
    const course = courses.find((c) => c.id === e.courseId);
    const credits = course ? course.credits : 3;
    const pts = GRADE_POINTS[e.grade];

    if (pts !== null && pts !== undefined) {
      totalPoints += pts * credits;
      totalCredits += credits;
    }
  });

  if (totalCredits === 0) return 0.0;
  return Number((totalPoints / totalCredits).toFixed(2));
};

export const exportStudentsToCSV = (students: Student[]) => {
  const headers = [
    'Student ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Department',
    'Major',
    'Academic Year',
    'Status',
    'GPA',
    'Tuition Status',
    'Advisor',
    'Enrollment Date',
  ];

  const rows = students.map((s) => [
    `"${s.studentId}"`,
    `"${s.firstName}"`,
    `"${s.lastName}"`,
    `"${s.email}"`,
    `"${s.phone}"`,
    `"${s.department}"`,
    `"${s.major}"`,
    `"${s.year}"`,
    `"${s.status}"`,
    s.gpa.toFixed(2),
    `"${s.tuitionStatus}"`,
    `"${s.advisor}"`,
    `"${s.enrollmentDate}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `students_roster_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAllDataJSON = (
  students: Student[],
  courses: Course[],
  enrollments: Enrollment[],
  attendance: AttendanceEntry[]
) => {
  const data = {
    exportedAt: new Date().toISOString(),
    system: 'Student Management System',
    version: '1.0.0',
    students,
    courses,
    enrollments,
    attendance,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sms_system_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const resetAllData = () => {
  localStorage.removeItem(KEYS.STUDENTS);
  localStorage.removeItem(KEYS.COURSES);
  localStorage.removeItem(KEYS.ENROLLMENTS);
  localStorage.removeItem(KEYS.ATTENDANCE);
  localStorage.removeItem(KEYS.LOGS);
};
