import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Users, 
  Clock, 
  MapPin, 
  User, 
  X, 
  GraduationCap, 
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Course, Student, Enrollment, LetterGrade } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface CoursesViewProps {
  courses?: Course[];
  students?: Student[];
  enrollments?: Enrollment[];
  onAddCourse?: (course: Partial<Course>) => void;
  onEnrollStudent?: (studentId: string, courseId: string) => void;
  onDropEnrollment?: (enrollmentId: string) => void;
  onDropCourse?: (enrollmentId: string) => void;
  onUpdateGrade?: (enrollmentId: string, newGrade: LetterGrade) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses = [],
  students = [],
  enrollments = [],
  onAddCourse,
  onEnrollStudent,
  onDropEnrollment,
  onDropCourse,
  onUpdateGrade,
}) => {
  const handleDrop = (enrollmentId: string) => {
    if (onDropCourse) onDropCourse(enrollmentId);
    else if (onDropEnrollment) onDropEnrollment(enrollmentId);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState<Course | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [studentToEnrollId, setStudentToEnrollId] = useState('');

  // New course form state
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    code: '',
    name: '',
    department: 'Computer Science',
    credits: 3,
    instructor: '',
    room: 'Hall A',
    schedule: 'Mon / Wed 10:00 - 11:30 AM',
    semester: 'Fall 2026',
    maxCapacity: 35,
  });

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.code.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q) && !c.instructor.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedDept !== 'All' && c.department !== selectedDept) {
      return false;
    }
    return true;
  });

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.code || !newCourse.name || !newCourse.instructor) return;
    onAddCourse(newCourse);
    setShowAddCourseModal(false);
    setNewCourse({
      code: '',
      name: '',
      department: 'Computer Science',
      credits: 3,
      instructor: '',
      room: 'Hall A',
      schedule: 'Mon / Wed 10:00 - 11:30 AM',
      semester: 'Fall 2026',
      maxCapacity: 35,
    });
  };

  // Roster calculations for selectedCourseForRoster
  const currentRosterEnrollments = selectedCourseForRoster
    ? enrollments.filter((e) => e.courseId === selectedCourseForRoster.id)
    : [];

  const enrolledStudentIds = new Set(currentRosterEnrollments.map((e) => e.studentId));
  const eligibleStudentsToEnroll = students.filter((s) => !enrolledStudentIds.has(s.id));

  return (
    <div className="space-y-5">
      {/* Top Filter & Actions Header */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code, title, instructor..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:bg-white focus:border-indigo-500 transition-all"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddCourseModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredCourses.map((course) => {
          const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
          const enrolledCount = courseEnrollments.length;
          const capacityPercent = Math.min(100, Math.round((enrolledCount / course.maxCapacity) * 100));

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-neutral-900 text-white rounded">
                    {course.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {course.credits} Credits
                  </span>
                </div>

                <h4 className="font-bold text-neutral-900 text-sm mb-1 leading-snug line-clamp-2">
                  {course.name}
                </h4>
                <p className="text-xs text-neutral-500 mb-3">{course.department}</p>

                <div className="space-y-1.5 text-xs text-neutral-600 mb-4 bg-neutral-50/80 p-3 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium text-neutral-800 truncate">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600 truncate">{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600 truncate">{course.room}</span>
                  </div>
                </div>
              </div>

              <div>
                {/* Capacity Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Class Enrollment</span>
                    <span className="font-bold text-neutral-800">
                      {enrolledCount} / {course.maxCapacity} seats
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPercent > 90 ? 'bg-rose-500' : capacityPercent > 60 ? 'bg-indigo-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* View Roster Button */}
                <button
                  onClick={() => setSelectedCourseForRoster(course)}
                  className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
                >
                  <Users className="w-3.5 h-3.5 text-neutral-600" />
                  <span>View Enrolled Students ({enrolledCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* COURSE ROSTER MODAL */}
      {selectedCourseForRoster && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Roster Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-900 text-white flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono text-xs px-2 py-0.5 bg-neutral-800 rounded font-semibold text-indigo-300">
                  {selectedCourseForRoster.code}
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-1 leading-snug truncate">{selectedCourseForRoster.name}</h3>
                <p className="text-xs text-neutral-400 truncate">
                  Instructor: {selectedCourseForRoster.instructor} • Room: {selectedCourseForRoster.room}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourseForRoster(null)}
                className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              {/* Quick Enroll Bar */}
              {eligibleStudentsToEnroll.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <select
                    value={studentToEnrollId}
                    onChange={(e) => setStudentToEnrollId(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-hidden text-xs"
                  >
                    <option value="">Enroll an existing student into this course...</option>
                    {eligibleStudentsToEnroll.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentId} - {s.major})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (studentToEnrollId) {
                        onEnrollStudent(studentToEnrollId, selectedCourseForRoster.id);
                        setStudentToEnrollId('');
                      }
                    }}
                    disabled={!studentToEnrollId}
                    className="w-full sm:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    Enroll Student
                  </button>
                </div>
              )}

              {/* Roster Table */}
              {currentRosterEnrollments.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                  <p>No students enrolled in this course yet.</p>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar sm:overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="p-3 whitespace-nowrap min-w-[170px]">Student</th>
                          <th className="p-3 whitespace-nowrap min-w-[90px]">Academic Year</th>
                          <th className="p-3 whitespace-nowrap min-w-[100px]">Grade</th>
                          <th className="p-3 whitespace-nowrap min-w-[80px]">Attendance</th>
                          <th className="p-3 text-right whitespace-nowrap min-w-[60px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {currentRosterEnrollments.map((enr) => {
                          const student = students.find((s) => s.id === enr.studentId);
                          if (!student) return null;
                          return (
                            <tr key={enr.id} className="hover:bg-neutral-50">
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}`}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-7 h-7 rounded-full object-cover bg-neutral-200 shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-neutral-900">{student.firstName} {student.lastName}</p>
                                    <p className="text-[10px] text-neutral-400 font-mono">{student.studentId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-neutral-600 whitespace-nowrap">{student.year}</td>
                              <td className="p-3 whitespace-nowrap">
                                <select
                                  value={enr.grade}
                                  onChange={(e) => onUpdateGrade(enr.id, e.target.value as LetterGrade)}
                                  className="px-2 py-1 bg-white border border-neutral-200 rounded font-bold text-neutral-900 text-xs"
                                >
                                  {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F', 'In Progress'].map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3 font-semibold text-neutral-800 whitespace-nowrap">{enr.attendanceRate}%</td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleDrop(enr.id)}
                                  className="text-rose-600 hover:text-rose-800 p-1.5 rounded-md hover:bg-rose-50"
                                  title="Drop from class"
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
                </div>
              )}
            </div>

            <div className="p-3.5 sm:p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button
                onClick={() => setSelectedCourseForRoster(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl p-4 sm:p-6 my-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 mb-4">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                Add New Academic Course
              </h3>
              <button onClick={() => setShowAddCourseModal(false)} className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CS-350"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg uppercase font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Credit Units *</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Department</label>
                <select
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Instructor *</label>
                  <input
                    type="text"
                    required
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    placeholder="e.g. Dr. John von Neumann"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={newCourse.room}
                    onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                    placeholder="e.g. Tech Lab 204"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Schedule</label>
                  <input
                    type="text"
                    value={newCourse.schedule}
                    onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                    placeholder="e.g. Tue / Thu 10:00 - 11:30 AM"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={newCourse.maxCapacity}
                    onChange={(e) => setNewCourse({ ...newCourse, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
