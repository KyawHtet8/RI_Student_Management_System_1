import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Course, Enrollment, AttendanceEntry, ActivityLog, ViewTab, LetterGrade, StudentStatus } from '../types';
import { INITIAL_STUDENTS, INITIAL_COURSES, INITIAL_ENROLLMENTS, INITIAL_ATTENDANCE } from '../data/mockData';
import { studentApi } from '../features/students/api/studentApi';
import { courseApi } from '../features/courses/api/courseApi';
import { attendanceApi } from '../features/attendance/api/attendanceApi';
import { calculateGPA } from '../shared/utils/formatters';

interface AppStoreContextType {
  // Navigation
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  term: string;
  setTerm: (term: string) => void;

  // Data Collections
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  attendance: AttendanceEntry[];
  logs: ActivityLog[];
  isLoading: boolean;
  serverConnected: boolean;

  // Student Actions
  createStudent: (data: Partial<Student>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  batchUpdateStudentStatus: (ids: string[], status: StudentStatus) => Promise<void>;
  batchDeleteStudents: (ids: string[]) => Promise<void>;

  // Course Actions
  createCourse: (course: Omit<Course, 'id' | 'enrolledCount'>) => Promise<void>;
  enrollStudentInCourse: (studentId: string, courseId: string) => Promise<void>;
  updateEnrollmentGrade: (enrollmentId: string, grade: LetterGrade) => Promise<void>;
  dropCourseEnrollment: (enrollmentId: string) => Promise<void>;

  // Attendance Actions
  saveAttendanceSheet: (date: string, courseId: string, entries: { studentId: string; status: any; remarks?: string }[]) => Promise<void>;

  // System
  addLog: (title: string, details: string, type?: ActivityLog['type']) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  exportRosterCSV: () => void;
  resetToDefaults: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('students');
  const [term, setTerm] = useState('Fall Semester 2026');

  // Core Data state (initialized with resilient fallback)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const cached = localStorage.getItem('university_students');
      return cached ? JSON.parse(cached) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('university_courses');
      return cached ? JSON.parse(cached) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    try {
      const cached = localStorage.getItem('university_enrollments');
      return cached ? JSON.parse(cached) : INITIAL_ENROLLMENTS;
    } catch {
      return INITIAL_ENROLLMENTS;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => {
    try {
      const cached = localStorage.getItem('university_attendance');
      return cached ? JSON.parse(cached) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Domain Architecture Initialized',
      details: 'Modular Monolith store booted with feature-driven API contracts.',
      type: 'system',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);

  // Persistence side-effects
  useEffect(() => {
    try {
      localStorage.setItem('university_students', JSON.stringify(students));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('university_courses', JSON.stringify(courses));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('university_enrollments', JSON.stringify(enrollments));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [enrollments]);

  useEffect(() => {
    try {
      localStorage.setItem('university_attendance', JSON.stringify(attendance));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [attendance]);

  const addLog = (title: string, details: string, type: ActivityLog['type'] = 'system') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title,
      details,
      type,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Attempt backend handshake on mount
  useEffect(() => {
    const attemptHandshake = async () => {
      try {
        setIsLoading(true);
        const remoteStudents = await studentApi.getStudents();
        if (remoteStudents && Array.isArray(remoteStudents)) {
          setStudents(remoteStudents);
          setServerConnected(true);
          addLog('Remote Sync Success', 'Successfully synchronized data from Spring Boot REST API', 'system');
        }
      } catch {
        // Backend offline in standalone client preview - gracefully preserve client local state
        setServerConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    attemptHandshake();
  }, []);

  // Recalculate course enrolled count
  const updatedCourses = courses.map((course) => {
    const count = enrollments.filter((e) => e.courseId === course.id).length;
    return { ...course, enrolledCount: count };
  });

  // Student Actions
  const createStudent = async (data: Partial<Student>) => {
    try {
      await studentApi.createStudent(data);
      setServerConnected(true);
    } catch {
      // Offline fallback
    }

    const newId = `stu-${Date.now()}`;
    const studentCount = students.length + 1;
    const generatedStudentId = `STU-2026-${String(studentCount).padStart(3, '0')}`;

    const newStudent: Student = {
      id: newId,
      studentId: generatedStudentId,
      firstName: data.firstName || 'New',
      lastName: data.lastName || 'Student',
      email: data.email || `${data.firstName?.toLowerCase() || 'student'}@university.edu`,
      phone: data.phone || '+1 (555) 000-0000',
      dateOfBirth: data.dateOfBirth || '2004-01-01',
      gender: data.gender || 'Female',
      department: data.department || 'Computer Science',
      major: data.major || 'Computer Science',
      year: data.year || 'Freshman',
      status: data.status || 'Active',
      gpa: 0.0,
      advisor: data.advisor || 'Dr. Assigned Advisor',
      enrollmentDate: new Date().toISOString().split('T')[0],
      expectedGraduation: '2028-05-15',
      tuitionStatus: data.tuitionStatus || 'Paid',
      address: data.address || { street: '100 University Way', city: 'Cambridge', state: 'MA', zip: '02138' },
      emergencyContact: data.emergencyContact || { name: 'Emergency Contact', relationship: 'Parent', phone: '+1 (555) 999-9999' },
      notes: [],
    };

    setStudents((prev) => [newStudent, ...prev]);
    addLog('Student Enrolled', `Created new academic record for ${newStudent.firstName} ${newStudent.lastName} (${newStudent.studentId})`, 'create');
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    try {
      await studentApi.updateStudent(id, data);
      setServerConnected(true);
    } catch {
      // Offline fallback
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    addLog('Record Updated', `Updated profile record for ${data.firstName || ''} ${data.lastName || ''}`, 'update');
  };

  const deleteStudent = async (id: string) => {
    const student = students.find((s) => s.id === id);
    try {
      await studentApi.deleteStudent(id);
      setServerConnected(true);
    } catch {
      // Offline fallback
    }

    setStudents((prev) => prev.filter((s) => s.id !== id));
    setEnrollments((prev) => prev.filter((e) => e.studentId !== id));
    setAttendance((prev) => prev.filter((a) => a.studentId !== id));
    addLog('Record Archived', `Removed student ${student?.firstName} ${student?.lastName} (${student?.studentId})`, 'delete');
  };

  const batchUpdateStudentStatus = async (ids: string[], status: StudentStatus) => {
    try {
      await studentApi.batchUpdateStatus({ studentIds: ids, status });
    } catch {
      // Offline fallback
    }

    setStudents((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s))
    );
    addLog('Batch Operation', `Bulk updated status to '${status}' for ${ids.length} student(s)`, 'update');
  };

  const batchDeleteStudents = async (ids: string[]) => {
    setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
    setEnrollments((prev) => prev.filter((e) => !ids.includes(e.studentId)));
    setAttendance((prev) => prev.filter((a) => !ids.includes(a.studentId)));
    addLog('Batch Deletion', `Archived ${ids.length} student academic records from registry`, 'delete');
  };

  // Course Actions
  const createCourse = async (courseData: Omit<Course, 'id' | 'enrolledCount'>) => {
    try {
      await courseApi.createCourse(courseData);
    } catch {
      // Offline fallback
    }

    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`,
      enrolledCount: 0,
    };
    setCourses((prev) => [...prev, newCourse]);
    addLog('Course Created', `Added ${newCourse.code}: ${newCourse.name} to course catalog`, 'create');
  };

  const enrollStudentInCourse = async (studentId: string, courseId: string) => {
    const alreadyEnrolled = enrollments.some((e) => e.studentId === studentId && e.courseId === courseId);
    if (alreadyEnrolled) return;

    try {
      await courseApi.enrollStudent({ studentId, courseId, semester: term });
    } catch {
      // Offline fallback
    }

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      courseId,
      semester: term,
      grade: 'In Progress',
      attendanceRate: 100,
      enrolledAt: new Date().toISOString().split('T')[0],
    };

    setEnrollments((prev) => [...prev, newEnrollment]);

    const student = students.find((s) => s.id === studentId);
    const course = courses.find((c) => c.id === courseId);
    addLog('Course Enrollment', `Enrolled ${student?.firstName} ${student?.lastName} into ${course?.code}`, 'create');
  };

  const updateEnrollmentGrade = async (enrollmentId: string, grade: LetterGrade) => {
    try {
      await courseApi.updateGrade(enrollmentId, grade);
    } catch {
      // Offline fallback
    }

    const targetEnrollment = enrollments.find((e) => e.id === enrollmentId);
    const nextEnrollments = enrollments.map((enr) =>
      enr.id === enrollmentId ? { ...enr, grade } : enr
    );
    setEnrollments(nextEnrollments);

    if (targetEnrollment) {
      const studentEnrollments = nextEnrollments.filter((e) => e.studentId === targetEnrollment.studentId);
      const newGPA = calculateGPA(studentEnrollments);
      setStudents((prev) =>
        prev.map((s) => (s.id === targetEnrollment.studentId ? { ...s, gpa: newGPA } : s))
      );
      addLog('Grade Assigned', `Assigned Grade '${grade}' for course enrollment`, 'grade');
    }
  };

  const dropCourseEnrollment = async (enrollmentId: string) => {
    try {
      await courseApi.dropCourse(enrollmentId);
    } catch {
      // Offline fallback
    }

    const target = enrollments.find((e) => e.id === enrollmentId);
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));

    if (target) {
      const remainingEnrollments = enrollments.filter(
        (e) => e.studentId === target.studentId && e.id !== enrollmentId
      );
      const newGPA = calculateGPA(remainingEnrollments);
      setStudents((prev) =>
        prev.map((s) => (s.id === target.studentId ? { ...s, gpa: newGPA } : s))
      );
      addLog('Course Dropped', `Student dropped course registration`, 'delete');
    }
  };

  // Attendance Action
  const saveAttendanceSheet = async (
    date: string,
    courseId: string,
    entries: { studentId: string; status: any; remarks?: string }[]
  ) => {
    try {
      await attendanceApi.saveAttendanceSheet({ date, courseId, records: entries });
    } catch {
      // Offline fallback
    }

    setAttendance((prev) => {
      const filtered = prev.filter((rec) => !(rec.courseId === courseId && rec.date === date));
      const newEntries: AttendanceEntry[] = entries.map((e) => ({
        id: `att-${Date.now()}-${e.studentId}`,
        date,
        courseId,
        studentId: e.studentId,
        status: e.status,
        remarks: e.remarks,
      }));
      return [...filtered, ...newEntries];
    });

    const course = courses.find((c) => c.id === courseId);
    addLog('Attendance Recorded', `Saved roster attendance sheet for ${course?.code} on ${date}`, 'attendance');
  };

  const exportDataJSON = () => {
    return JSON.stringify({ students, courses, enrollments, attendance }, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.students)) setStudents(data.students);
      if (Array.isArray(data.courses)) setCourses(data.courses);
      if (Array.isArray(data.enrollments)) setEnrollments(data.enrollments);
      if (Array.isArray(data.attendance)) setAttendance(data.attendance);
      addLog('System Restore', 'Imported data state from backup archive', 'update');
      return true;
    } catch {
      return false;
    }
  };

  const exportRosterCSV = () => {
    const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Major', 'Department', 'Year', 'GPA', 'Status', 'Tuition'];
    const rows = students.map((s) => [
      s.studentId,
      s.firstName,
      s.lastName,
      s.email,
      s.major,
      s.department,
      s.year,
      s.gpa.toFixed(2),
      s.status,
      s.tuitionStatus,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students-roster-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Export CSV', 'Exported student registry to CSV spreadsheet', 'system');
  };

  const resetToDefaults = () => {
    localStorage.removeItem('university_students');
    localStorage.removeItem('university_courses');
    localStorage.removeItem('university_enrollments');
    localStorage.removeItem('university_attendance');
    setStudents(INITIAL_STUDENTS);
    setCourses(INITIAL_COURSES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    addLog('Reset System', 'Reset system datasets back to campus factory defaults', 'system');
  };

  return (
    <AppStoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        term,
        setTerm,
        students,
        courses: updatedCourses,
        enrollments,
        attendance,
        logs,
        isLoading,
        serverConnected,
        createStudent,
        updateStudent,
        deleteStudent,
        batchUpdateStudentStatus,
        batchDeleteStudents,
        createCourse,
        enrollStudentInCourse,
        updateEnrollmentGrade,
        dropCourseEnrollment,
        saveAttendanceSheet,
        addLog,
        exportDataJSON,
        importDataJSON,
        exportRosterCSV,
        resetToDefaults,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};
