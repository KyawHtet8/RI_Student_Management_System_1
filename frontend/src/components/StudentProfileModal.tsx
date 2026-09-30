import React from 'react';
import { CalendarDays, Mail, MapPin, Pencil, Phone, UserRound, X } from 'lucide-react';
import { Student } from '../types';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

const Detail: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-neutral-800 break-words">{value || 'Not provided'}</p>
  </div>
);

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-3 backdrop-blur-sm sm:p-6">
      <div className="my-4 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#20243a] via-indigo-900 to-indigo-700 px-5 py-6 text-white sm:px-7">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[18px] border-cyan-300/10" />
          <button onClick={onClose} aria-label="Close full profile" className="absolute right-4 top-4 rounded-lg p-2 text-indigo-100 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex items-center gap-4 pr-10">
            <img
              src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}`}
              alt={`${student.firstName} ${student.lastName}`}
              className="h-16 w-16 rounded-2xl border-2 border-white/20 bg-white/10 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">Full student profile</p>
              <h2 className="truncate text-xl font-bold sm:text-2xl">{student.firstName} {student.lastName}</h2>
              <p className="mt-1 font-mono text-xs text-indigo-100">{student.studentId} · {student.status}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-7">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Detail label="GPA" value={student.gpa?.toFixed(2)} />
            <Detail label="Academic year" value={student.year} />
            <Detail label="Department" value={student.department} />
            <Detail label="Tuition" value={student.tuitionStatus} />
          </div>

          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700"><UserRound className="h-4 w-4" /> Personal and academic</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Major" value={student.major} />
              <Detail label="Academic advisor" value={student.advisor} />
              <Detail label="Gender" value={student.gender} />
              <Detail label="Date of birth" value={student.dateOfBirth} />
              <Detail label="Enrollment date" value={student.enrollmentDate} />
              <Detail label="Expected graduation" value={student.expectedGraduation} />
            </div>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700"><Mail className="h-4 w-4" /> Contact information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Email" value={student.email} />
              <Detail label="Phone" value={student.phone} />
              <Detail label="Address" value={student.address && <span className="flex items-start gap-1"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />{student.address.street}, {student.address.city}, {student.address.state} {student.address.zip}</span>} />
              <Detail label="Emergency contact" value={student.emergencyContact && <span className="flex items-start gap-1"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />{student.emergencyContact.name} · {student.emergencyContact.phone}</span>} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700"><CalendarDays className="h-4 w-4" /> Notes</h3>
            {student.notes?.length ? <ul className="space-y-2 text-sm text-neutral-600">{student.notes.map((note, index) => <li key={`${note}-${index}`} className="rounded-lg bg-amber-50 px-3 py-2">{note}</li>)}</ul> : <p className="rounded-xl border border-dashed border-neutral-200 px-3 py-4 text-sm text-neutral-400">No notes recorded.</p>}
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/70 px-4 py-3 sm:px-7">
          <p className="hidden text-xs text-neutral-500 sm:block">Read-only profile view</p>
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200">Close</button>
            <button onClick={() => onEdit(student)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"><Pencil className="h-3.5 w-3.5" /> Edit profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};
