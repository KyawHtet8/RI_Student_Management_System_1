import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Calendar, 
  BookOpen, 
  FileText, 
  UserCheck, 
  Plus, 
  Printer, 
  Edit,
  Trash2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { Student, Course, Enrollment, AttendanceEntry, LetterGrade } from '../types';
import { GRADE_POINTS } from '../data/mockData';

interface StudentDetailModalProps {
  student: Student | null;
  courses: Course[];
  enrollments: Enrollment[];
  attendance: AttendanceEntry[];
  onClose: () => void;
  onEdit: (student: Student) => void;
  onUpdateGrade: (enrollmentId: string, newGrade: LetterGrade) => void;
  onEnrollInCourse: (studentId: string, courseId: string) => void;
  onDropCourse: (enrollmentId: string) => void;
  onAddNote: (studentId: string, noteText: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  courses,
  enrollments,
  attendance,
  onClose,
  onEdit,
  onUpdateGrade,
  onEnrollInCourse,
  onDropCourse,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'attendance' | 'notes'>('overview');
  const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');

  if (!student) return null;

  // Filter enrollments for this student
  const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);
  const enrolledCourseIds = new Set(studentEnrollments.map((e) => e.courseId));
  const availableCourses = courses.filter((c) => !enrolledCourseIds.has(c.id));

  // Filter attendance for this student
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);

  // Calculate total credits
  const totalCredits = studentEnrollments.reduce((acc, e) => {
    const c = courses.find((crs) => crs.id === e.courseId);
    return acc + (c ? c.credits : 0);
  }, 0);

  const handleEnroll = () => {
    if (!selectedCourseToEnroll) return;
    onEnrollInCourse(student.id, selectedCourseToEnroll);
    setSelectedCourseToEnroll('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(student.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handlePrintTranscript = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 z-50 overflow-y-auto">
      <div 
        id="student-detail-modal"
        className="bg-white rounded-2xl max-w-3xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-2 sm:my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col"
      >
        {/* Dossier Header Banner */}
        <div className="bg-neutral-900 text-white p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 pr-8 sm:pr-0">
            <img
              src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}`}
              alt={`${student.firstName} ${student.lastName}`}
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover bg-neutral-800 border-2 border-neutral-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                  {student.firstName} {student.lastName}
                </h3>
                <span className="font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {student.studentId}
                </span>
                <span className={`text-[11px] sm:text-xs px-2 py-0.5 rounded font-medium ${
                  student.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {student.status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 flex items-center gap-2">
                <span>{student.major}</span>
                <span>•</span>
                <span className="text-neutral-400">{student.year}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-2 sm:mt-3 text-[11px] sm:text-xs text-neutral-300">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {student.phone}
                </span>
              </div>
            </div>

            {/* GPA Score Card */}
            <div className="w-full sm:w-auto bg-neutral-800/90 border border-neutral-700 rounded-xl p-2.5 sm:p-3 text-left sm:text-right shrink-0 flex sm:block items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Cumulative GPA</p>
                <p className="text-[10px] text-neutral-400 sm:mt-0.5">{totalCredits} Total Credits</p>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-indigo-300">
                  {student.gpa.toFixed(2)}
                </span>
                {student.gpa >= 3.75 && <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-3 sm:px-6 bg-neutral-50/50 text-xs font-semibold overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 sm:py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-2.5 sm:py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'courses' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Courses & Grades
            <span className="px-1.5 py-0.2 bg-neutral-200 rounded-full text-[10px] font-bold text-neutral-700">
              {studentEnrollments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2.5 sm:py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'attendance' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Attendance Logs
            <span className="px-1.5 py-0.2 bg-neutral-200 rounded-full text-[10px] font-bold text-neutral-700">
              {studentAttendance.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 sm:py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Advising Notes
            <span className="px-1.5 py-0.2 bg-neutral-200 rounded-full text-[10px] font-bold text-neutral-700">
              {student.notes?.length || 0}
            </span>
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto text-xs flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 space-y-2">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2 text-indigo-700">
                    Academic Placement
                  </h4>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Department:</span>
                    <span className="font-semibold text-neutral-800">{student.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Major:</span>
                    <span className="font-semibold text-neutral-800">{student.major}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Academic Advisor:</span>
                    <span className="font-semibold text-neutral-800">{student.advisor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Enrollment Date:</span>
                    <span className="font-semibold text-neutral-800">{student.enrollmentDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Expected Graduation:</span>
                    <span className="font-semibold text-neutral-800">{student.expectedGraduation}</span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 space-y-2">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2 text-indigo-700">
                    Personal & Contact Info
                  </h4>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Date of Birth:</span>
                    <span className="font-semibold text-neutral-800">{student.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Gender:</span>
                    <span className="font-semibold text-neutral-800">{student.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Tuition Status:</span>
                    <span className={`font-semibold ${
                      student.tuitionStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {student.tuitionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Residential Address:</span>
                    <span className="font-semibold text-neutral-800 text-right max-w-[180px]">
                      {student.address.street}, {student.address.city}, {student.address.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200/80">
                <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2 text-indigo-700">
                  Emergency Contact
                </h4>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-neutral-900 text-xs sm:text-sm">{student.emergencyContact.name}</p>
                    <p className="text-neutral-500 text-[11px] sm:text-xs">Relationship: {student.emergencyContact.relationship}</p>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-medium text-neutral-800 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    {student.emergencyContact.phone}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSES & GRADES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {/* Enroll in Course Action Bar */}
              {availableCourses.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <select
                    value={selectedCourseToEnroll}
                    onChange={(e) => setSelectedCourseToEnroll(e.target.value)}
                    className="flex-1 px-3 py-2 sm:py-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-medium focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="">Select course to enroll student...</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name} ({c.credits} Credits)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={!selectedCourseToEnroll}
                    className="px-4 py-2 sm:py-1.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] sm:min-h-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Enroll Course
                  </button>
                </div>
              )}

              {/* Enrolled Courses Table */}
              {studentEnrollments.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <BookOpen className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                  <p>Student is not enrolled in any courses for the current semester.</p>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-x-auto no-scrollbar sm:overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-3 whitespace-nowrap min-w-[140px]">Course</th>
                        <th className="p-3 whitespace-nowrap min-w-[70px]">Credits</th>
                        <th className="p-3 whitespace-nowrap min-w-[110px]">Schedule</th>
                        <th className="p-3 whitespace-nowrap min-w-[80px]">Grade</th>
                        <th className="p-3 whitespace-nowrap min-w-[85px]">Attendance</th>
                        <th className="p-3 text-right whitespace-nowrap min-w-[60px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {studentEnrollments.map((enr) => {
                        const course = courses.find((c) => c.id === enr.courseId);
                        return (
                          <tr key={enr.id} className="hover:bg-neutral-50/70">
                            <td className="p-3 whitespace-nowrap">
                              <p className="font-bold text-neutral-900">{course?.code}</p>
                              <p className="text-neutral-500 text-[11px] truncate max-w-[200px]">{course?.name}</p>
                            </td>
                            <td className="p-3 font-semibold text-neutral-700 whitespace-nowrap">{course?.credits} cr</td>
                            <td className="p-3 text-neutral-500 text-[11px] whitespace-nowrap">{course?.schedule}</td>
                            <td className="p-3 whitespace-nowrap">
                              <select
                                value={enr.grade}
                                onChange={(e) => onUpdateGrade(enr.id, e.target.value as LetterGrade)}
                                className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-bold text-neutral-900 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                              >
                                {Object.keys(GRADE_POINTS).map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-semibold text-neutral-800">{enr.attendanceRate}%</span>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => onDropCourse(enr.id)}
                                className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 cursor-pointer"
                                title="Drop Course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE LOGS */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {studentAttendance.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <UserCheck className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                  <p>No individual attendance events logged yet for this student.</p>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-x-auto no-scrollbar sm:overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-3 whitespace-nowrap min-w-[90px]">Date</th>
                        <th className="p-3 whitespace-nowrap min-w-[90px]">Course</th>
                        <th className="p-3 whitespace-nowrap min-w-[85px]">Status</th>
                        <th className="p-3 whitespace-nowrap min-w-[130px]">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {studentAttendance.map((rec) => {
                        const course = courses.find((c) => c.id === rec.courseId);
                        return (
                          <tr key={rec.id}>
                            <td className="p-3 font-mono text-neutral-700 whitespace-nowrap">{rec.date}</td>
                            <td className="p-3 font-semibold text-neutral-900 whitespace-nowrap">{course?.code || rec.courseId}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                rec.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                                rec.status === 'Absent' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-500 whitespace-nowrap">{rec.remarks || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADVISING NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNoteSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add advisor remark or disciplinary note..."
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 cursor-pointer min-h-[38px]"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-2">
                {(!student.notes || student.notes.length === 0) ? (
                  <p className="text-center py-6 text-neutral-400">No notes recorded yet.</p>
                ) : (
                  student.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 text-neutral-700 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-200 bg-neutral-50/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 text-xs shrink-0">
          <button
            onClick={handlePrintTranscript}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 cursor-pointer min-h-[38px] sm:min-h-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Student Dossier
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(student);
                onClose();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer min-h-[38px] sm:min-h-0"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Student Info
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 sm:py-1.5 border border-neutral-200 bg-white text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 cursor-pointer min-h-[38px] sm:min-h-0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
