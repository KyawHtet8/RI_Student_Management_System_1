import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HelpCircle, 
  Save, 
  Check, 
  Filter,
  UserCheck
} from 'lucide-react';
import { Course, Student, Enrollment, AttendanceEntry, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  courses?: Course[];
  students?: Student[];
  enrollments?: Enrollment[];
  attendance?: AttendanceEntry[];
  attendanceRecords?: AttendanceEntry[];
  onSaveAttendanceBatch?: (records: AttendanceEntry[]) => void;
  onSaveAttendance?: (date: string, courseId: string, entries: { studentId: string; status: AttendanceStatus; remarks?: string }[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  courses = [],
  students = [],
  enrollments = [],
  attendance,
  attendanceRecords,
  onSaveAttendanceBatch,
  onSaveAttendance,
}) => {
  const allAttendance = attendance || attendanceRecords || [];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active course
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Enrolled students in this active course
  const courseEnrollments = useMemo(() => {
    return (enrollments || []).filter((e) => e.courseId === selectedCourseId);
  }, [enrollments, selectedCourseId]);

  const enrolledStudents = useMemo(() => {
    return courseEnrollments
      .map((e) => (students || []).find((s) => s.id === e.studentId))
      .filter((s): s is Student => s !== undefined);
  }, [courseEnrollments, students]);

  // Load existing records for this course + date if already recorded
  React.useEffect(() => {
    const existing = allAttendance.filter(
      (a) => a.courseId === selectedCourseId && a.date === selectedDate
    );
    const statusMap: Record<string, AttendanceStatus> = {};
    const notesMap: Record<string, string> = {};

    enrolledStudents.forEach((student) => {
      const match = existing.find((a) => a.studentId === student.id);
      statusMap[student.id] = match ? match.status : 'Present';
      if (match?.remarks) {
        notesMap[student.id] = match.remarks;
      }
    });

    setLocalStatuses(statusMap);
    setSessionNotes(notesMap);
    setSavedSuccess(false);
  }, [selectedCourseId, selectedDate, allAttendance, enrolledStudents]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [studentId]: status }));
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      next[s.id] = status;
    });
    setLocalStatuses(next);
    setSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    const newRecords: AttendanceEntry[] = enrolledStudents.map((s) => ({
      id: `att-${selectedDate}-${selectedCourseId}-${s.id}`,
      date: selectedDate,
      courseId: selectedCourseId,
      studentId: s.id,
      status: localStatuses[s.id] || 'Present',
      remarks: sessionNotes[s.id] || undefined,
    }));

    if (onSaveAttendance) {
      onSaveAttendance(
        selectedDate,
        selectedCourseId,
        newRecords.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        }))
      );
    } else if (onSaveAttendanceBatch) {
      onSaveAttendanceBatch(newRecords);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Stats calculation
  const totalCount = enrolledStudents.length;
  const presentCount = enrolledStudents.filter((s) => localStatuses[s.id] === 'Present').length;
  const lateCount = enrolledStudents.filter((s) => localStatuses[s.id] === 'Late').length;
  const absentCount = enrolledStudents.filter((s) => localStatuses[s.id] === 'Absent').length;
  const excusedCount = enrolledStudents.filter((s) => localStatuses[s.id] === 'Excused').length;
  const presentRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 100;

  return (
    <div className="space-y-5">
      {/* Selection Control Panel */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 items-stretch lg:items-center justify-between">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Select Course
              </label>
              <select
                id="attendance-course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.instructor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Session Date
              </label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="attendance-date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 lg:pt-0">
            <button
              onClick={() => handleMarkAll('Present')}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Mark All Present
            </button>
            <button
              id="save-attendance-btn"
              onClick={handleSaveAttendance}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Register Saved!' : 'Save Register'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-neutral-200 text-center">
          <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase">Enrolled</p>
          <p className="text-lg sm:text-xl font-bold text-neutral-900 mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-neutral-200 text-center">
          <p className="text-[10px] sm:text-[11px] font-medium text-emerald-600 uppercase">Present</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-neutral-200 text-center">
          <p className="text-[10px] sm:text-[11px] font-medium text-amber-600 uppercase">Late</p>
          <p className="text-lg sm:text-xl font-bold text-amber-700 mt-0.5">{lateCount}</p>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-neutral-200 text-center">
          <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 uppercase">Absent</p>
          <p className="text-lg sm:text-xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-neutral-200 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-medium text-indigo-600 uppercase">Attendance %</p>
          <p className="text-lg sm:text-xl font-bold text-indigo-700 mt-0.5">{presentRate}%</p>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-3.5 sm:p-4 border-b border-neutral-200/80 bg-neutral-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-neutral-900 text-xs sm:text-sm">
              Attendance Sheet: {activeCourse?.code} - {activeCourse?.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500">
              Schedule: {activeCourse?.schedule} • Room: {activeCourse?.room}
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-medium px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-neutral-700">
            Date: {selectedDate}
          </span>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="text-center py-10 sm:py-12 text-neutral-500">
            <UserCheck className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            <p className="text-sm font-semibold text-neutral-700">No students enrolled in this course</p>
            <p className="text-xs text-neutral-400 mt-1">Enroll students from the Courses tab to take attendance.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Scroll Hint */}
            <div className="sm:hidden px-3 py-2 bg-neutral-50 border-b border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Scroll horizontally to mark attendance</span>
              <span className="font-semibold text-neutral-400">⇄</span>
            </div>

            <div className="overflow-x-auto no-scrollbar sm:overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 whitespace-nowrap min-w-[170px]">Student</th>
                    <th className="p-3 whitespace-nowrap min-w-[90px]">Student ID</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[280px]">Attendance Status</th>
                    <th className="p-3 whitespace-nowrap min-w-[180px]">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {enrolledStudents.map((student) => {
                    const currentStatus = localStatuses[student.id] || 'Present';
                    return (
                      <tr key={student.id} className="hover:bg-neutral-50/70">
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}`}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                            />
                            <div>
                              <p className="font-bold text-neutral-900">{student.firstName} {student.lastName}</p>
                              <p className="text-[11px] text-neutral-400">{student.major}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-neutral-600 font-medium whitespace-nowrap">
                          {student.studentId}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center p-1 bg-neutral-100 rounded-lg gap-1 border border-neutral-200/60">
                            {(['Present', 'Late', 'Absent', 'Excused'] as AttendanceStatus[]).map((status) => {
                              const isSelected = currentStatus === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, status)}
                                  className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    isSelected
                                      ? status === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : status === 'Late'
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : status === 'Absent'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-blue-600 text-white shadow-xs'
                                      : 'text-neutral-600 hover:text-neutral-900'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={sessionNotes[student.id] || ''}
                            onChange={(e) =>
                              setSessionNotes({ ...sessionNotes, [student.id]: e.target.value })
                            }
                            placeholder="Optional remark..."
                            className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:bg-white focus:outline-hidden focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
