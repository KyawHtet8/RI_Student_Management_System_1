import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Student, AcademicYear, StudentStatus, TuitionStatus } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Partial<Student>) => void;
  studentToEdit?: Student | null;
  existingCount: number;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  existingCount,
}) => {
  const isEditing = !!studentToEdit;

  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    dateOfBirth: '2005-01-01',
    gender: 'Female',
    department: 'Computer Science',
    major: 'Computer Science',
    year: 'Freshman',
    status: 'Active',
    gpa: 3.5,
    advisor: 'Dr. Alan Turing',
    enrollmentDate: new Date().toISOString().slice(0, 10),
    expectedGraduation: '2029-06-15',
    tuitionStatus: 'Paid',
    address: {
      street: '',
      city: 'Boston',
      state: 'MA',
      zip: '02115',
    },
    emergencyContact: {
      name: '',
      relationship: 'Parent',
      phone: '',
    },
    notes: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      setFormData(studentToEdit);
    } else {
      // Auto-generate fresh ID
      const nextIdNum = String(existingCount + 1).padStart(3, '0');
      setFormData({
        studentId: `STU-2026-${nextIdNum}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        avatar: '',
        dateOfBirth: '2005-01-01',
        gender: 'Female',
        department: 'Computer Science',
        major: 'Computer Science',
        year: 'Freshman',
        status: 'Active',
        gpa: 3.5,
        advisor: 'Dr. Alan Turing',
        enrollmentDate: new Date().toISOString().slice(0, 10),
        expectedGraduation: '2029-06-15',
        tuitionStatus: 'Paid',
        address: {
          street: '',
          city: 'Boston',
          state: 'MA',
          zip: '02115',
        },
        emergencyContact: {
          name: '',
          relationship: 'Parent',
          phone: '',
        },
        notes: [],
      });
    }
    setErrors({});
  }, [studentToEdit, existingCount, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName?.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errs.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
      errs.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      errs.email = 'Invalid email address';
    }
    if (!formData.major?.trim()) errs.major = 'Major is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div 
        id="student-form-modal"
        className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-3 sm:my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
              {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                {isEditing ? `Edit: ${studentToEdit?.firstName} ${studentToEdit?.lastName}` : 'Enroll New Student'}
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 truncate">
                {isEditing ? `Student ID: ${studentToEdit?.studentId}` : 'Create an official campus academic profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto text-xs flex-1">
          
          {/* Personal Information Section */}
          <div>
            <h4 className="font-semibold text-neutral-900 text-xs tracking-wider uppercase mb-2.5 sm:mb-3 flex items-center gap-1.5 text-indigo-700">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Maya"
                  className={`w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-hidden focus:bg-white min-h-[38px] ${
                    errors.firstName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-indigo-500'
                  }`}
                />
                {errors.firstName && <p className="text-rose-500 text-[11px] mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Lin"
                  className={`w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-hidden focus:bg-white min-h-[38px] ${
                    errors.lastName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-indigo-500'
                  }`}
                />
                {errors.lastName && <p className="text-rose-500 text-[11px] mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. maya.lin@university.edu"
                  className={`w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-hidden focus:bg-white min-h-[38px] ${
                    errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-indigo-500'
                  }`}
                />
                {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 345-6789"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Gender</label>
                <select
                  value={formData.gender || 'Female'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 cursor-pointer min-h-[38px]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Placement */}
          <div className="pt-3 border-t border-neutral-100">
            <h4 className="font-semibold text-neutral-900 text-xs tracking-wider uppercase mb-2.5 sm:mb-3 flex items-center gap-1.5 text-indigo-700">
              Academic Program & Standing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Department</label>
                <select
                  value={formData.department || DEPARTMENTS[0]}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, major: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 cursor-pointer min-h-[38px]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Major Specialization</label>
                <input
                  type="text"
                  value={formData.major || ''}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Academic Year</label>
                <select
                  value={formData.year || 'Freshman'}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value as AcademicYear })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 cursor-pointer min-h-[38px]"
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Enrollment Status</label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 cursor-pointer min-h-[38px]"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Academic Advisor</label>
                <input
                  type="text"
                  value={formData.advisor || ''}
                  onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Tuition Billing Status</label>
                <select
                  value={formData.tuitionStatus || 'Paid'}
                  onChange={(e) => setFormData({ ...formData, tuitionStatus: e.target.value as TuitionStatus })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 cursor-pointer min-h-[38px]"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial Balance</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact & Emergency */}
          <div className="pt-3 border-t border-neutral-100">
            <h4 className="font-semibold text-neutral-900 text-xs tracking-wider uppercase mb-2.5 sm:mb-3 flex items-center gap-1.5 text-indigo-700">
              Emergency Contact & Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact!, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Helen Lin"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact!, phone: e.target.value },
                    })
                  }
                  placeholder="e.g. +1 (555) 987-6543"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-neutral-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address!, street: e.target.value },
                    })
                  }
                  placeholder="e.g. 500 Memorial Drive, Cambridge, MA 02139"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 min-h-[38px]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg shadow-sm hover:shadow transition-all cursor-pointer min-h-[38px]"
            >
              {isEditing ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
