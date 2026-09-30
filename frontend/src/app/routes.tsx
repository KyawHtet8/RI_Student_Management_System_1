import React, { useState } from 'react';
import { useAppStore } from './store';
import { useAuth } from './auth';
import { Student, StudentStatus } from '../types';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { StudentList } from '../features/students';
import { StudentModal } from '../features/students';
import { StudentDetailModal } from '../features/students';
import { CoursesView } from '../features/courses';
import { AttendanceView } from '../features/attendance';
import { AnalyticsView, SettingsView } from '../features/analytics';
import { CheckCircle2, AlertCircle, Info, Radio, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AppRoutes: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    term,
    setTerm,
    students,
    courses,
    enrollments,
    attendance,
    logs,
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
    exportDataJSON,
    importDataJSON,
    exportRosterCSV,
    resetToDefaults,
  } = useAppStore();
  const { username, logout } = useAuth();

  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const handleSaveStudent = async (formData: Partial<Student>) => {
    try {
      if (studentToEdit) {
        await updateStudent(studentToEdit.id, formData);
        showToast(`Updated record for ${formData.firstName || studentToEdit.firstName}`);
      } else {
        await createStudent(formData);
        showToast(`Enrolled new student: ${formData.firstName} ${formData.lastName}`);
      }
      setIsAddModalOpen(false);
      setStudentToEdit(null);
    } catch {
      showToast('Error processing student request', 'error');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      if (selectedStudentDetail?.id === id) {
        setSelectedStudentDetail(null);
      }
      showToast('Student record archived');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to archive student record', 'error');
    }
  };

  const handleBatchStatus = async (ids: string[], status: StudentStatus) => {
    try {
      await batchUpdateStudentStatus(ids, status);
      showToast(`Updated ${ids.length} student(s) to ${status}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update student status', 'error');
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    try {
      await batchDeleteStudents(ids);
      showToast(`Archived ${ids.length} students`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to archive students', 'error');
    }
  };

  return (
    <div className="app-shell min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans antialiased">
      {/* Top Banner indicating architecture status */}
      <div className="bg-[#171b2d] text-neutral-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-indigo-900/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Radio className={`w-3.5 h-3.5 ${serverConnected ? 'text-cyan-300 animate-pulse' : 'text-amber-300'}`} />
            {serverConnected ? 'Spring Boot REST Connected' : 'Modular Monolith Architecture Ready'}
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400 hidden sm:inline">Feature-Driven Domain Layer (Students, Courses, Attendance, Analytics)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
          <span className="hidden sm:inline">API Endpoint: <span className="text-cyan-300">/api/v1/*</span></span>
          <span className="font-sans text-neutral-300">{username}</span>
          <button onClick={logout} className="inline-flex items-center gap-1 rounded px-1.5 py-1 font-sans text-neutral-400 hover:bg-white/10 hover:text-white" title="Sign out">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      {/* Global Application Header */}
      <Header
        activeTerm={term}
        onTermChange={setTerm}
        studentsCount={students.length}
        logs={logs}
        onExportCSV={() => {
          exportRosterCSV();
          showToast('Student roster exported as CSV');
        }}
        onEnrollClick={() => {
          setStudentToEdit(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentCount={students.length}
        courseCount={courses.length}
      />

      {/* View Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <StudentList
                students={students}
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsAddModalOpen(true);
                }}
                onDeleteStudent={handleDeleteStudent}
                onBatchUpdateStatus={handleBatchStatus}
                onBatchDelete={handleBatchDelete}
                searchQuery={globalSearch}
                onSearchChange={setGlobalSearch}
              />
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <CoursesView
                courses={courses}
                students={students}
                enrollments={enrollments}
                onEnrollStudent={enrollStudentInCourse}
                onDropCourse={dropCourseEnrollment}
                onUpdateGrade={updateEnrollmentGrade}
                onAddCourse={async (c) => {
                  const created = await createCourse(c);
                  showToast(`Created course ${c.code}`);
                  return created;
                }}
              />
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <AttendanceView
                courses={courses}
                students={students}
                enrollments={enrollments}
                attendanceRecords={attendance}
                onSaveAttendance={async (date, courseId, entries) => {
                  await saveAttendanceSheet(date, courseId, entries);
                  showToast('Saved attendance roster');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <AnalyticsView
                students={students}
                courses={courses}
                enrollments={enrollments}
                term={term}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <SettingsView
                students={students}
                courses={courses}
                enrollments={enrollments}
                attendance={attendance}
                logs={logs}
                onExportCSV={() => {
                  exportRosterCSV();
                  showToast('Student roster exported as CSV');
                }}
                onExportJSON={() => {
                  const data = exportDataJSON();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `university-sis-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  showToast('Exported SIS Database Backup');
                }}
                onImportJSON={(data) => {
                  importDataJSON(JSON.stringify(data));
                  showToast('Restored SIS database from backup');
                }}
                onResetData={() => {
                  resetToDefaults();
                  showToast('Reset system to campus defaults');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enroll/Edit Student Modal Dialog */}
      <StudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
        existingCount={students.length}
      />

      {/* Student Academic Record & Transcript Modal Dialog */}
      {selectedStudentDetail && (
        <StudentDetailModal
          student={selectedStudentDetail}
          enrollments={enrollments.filter((e) => e.studentId === selectedStudentDetail.id)}
          courses={courses}
          attendance={attendance.filter((a) => a.studentId === selectedStudentDetail.id)}
          onClose={() => setSelectedStudentDetail(null)}
          onEdit={(s) => {
            setSelectedStudentDetail(null);
            setStudentToEdit(s);
            setIsAddModalOpen(true);
          }}
          onEnrollCourse={(courseId) => enrollStudentInCourse(selectedStudentDetail.id, courseId)}
          onDropCourse={dropCourseEnrollment}
          onUpdateGrade={updateEnrollmentGrade}
          onAddNote={(note) => {
            updateStudent(selectedStudentDetail.id, {
              notes: [...(selectedStudentDetail.notes || []), note],
            });
            setSelectedStudentDetail((prev) =>
              prev ? { ...prev, notes: [...(prev.notes || []), note] } : null
            );
          }}
        />
      )}

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 text-white shadow-xl text-xs font-medium border border-neutral-800"
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
