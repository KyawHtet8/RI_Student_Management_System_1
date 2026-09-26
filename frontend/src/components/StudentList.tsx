import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ArrowUpDown, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Trash2, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Check,
  X,
  GraduationCap
} from 'lucide-react';
import { Student, AcademicYear, StudentStatus } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchUpdateStatus: (studentIds: string[], status: StudentStatus) => void;
  onBatchDelete: (studentIds: string[]) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students = [],
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onBatchUpdateStatus,
  onBatchDelete,
  searchQuery = '',
  onSearchChange,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedStanding, setSelectedStanding] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'gpa' | 'year'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    return list
      .filter((s) => {
        // Search query
        const query = (searchQuery || '').trim();
        if (query) {
          const q = query.toLowerCase();
          const matchesName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(q);
          const matchesId = (s.studentId || '').toLowerCase().includes(q);
          const matchesEmail = (s.email || '').toLowerCase().includes(q);
          const matchesMajor = (s.major || '').toLowerCase().includes(q);
          const matchesAdvisor = (s.advisor || '').toLowerCase().includes(q);
          if (!matchesName && !matchesId && !matchesEmail && !matchesMajor && !matchesAdvisor) {
            return false;
          }
        }

        // Department filter
        if (selectedDepartment !== 'All' && s.department !== selectedDepartment) {
          return false;
        }

        // Year filter
        if (selectedYear !== 'All' && s.year !== selectedYear) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'All' && s.status !== selectedStatus) {
          return false;
        }

        // Academic Standing filter
        if (selectedStanding === 'Honors' && s.gpa < 3.75) return false;
        if (selectedStanding === 'Good' && (s.gpa < 2.5 || s.gpa >= 3.75)) return false;
        if (selectedStanding === 'Warning' && s.gpa >= 2.5) return false;

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'name') {
          compare = a.lastName.localeCompare(b.lastName);
        } else if (sortBy === 'id') {
          compare = a.studentId.localeCompare(b.studentId);
        } else if (sortBy === 'gpa') {
          compare = a.gpa - b.gpa;
        } else if (sortBy === 'year') {
          compare = a.year.localeCompare(b.year);
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [students, searchQuery, selectedDepartment, selectedYear, selectedStatus, selectedStanding, sortBy, sortOrder]);

  // Roster Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const avgGPA = total > 0 ? (students.reduce((acc, s) => acc + s.gpa, 0) / total).toFixed(2) : '0.00';
    const honors = students.filter((s) => s.gpa >= 3.75).length;
    return { total, active, avgGPA, honors };
  }, [students]);

  // Bulk selection toggles
  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    onSearchChange('');
    setSelectedDepartment('All');
    setSelectedYear('All');
    setSelectedStatus('All');
    setSelectedStanding('All');
  };

  const getStatusBadgeClass = (status: StudentStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Graduated':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* High-Level Roster Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-neutral-500 truncate">Enrolled Students</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-neutral-500 truncate">Active Standing</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-neutral-500 truncate">Average GPA</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">{stats.avgGPA}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-neutral-500 truncate">Dean's Honor Roll</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">{stats.honors}</p>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by student name, ID, major, or email..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                aria-label="Clear student search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View mode toggle & Sort */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80">
              <button
                id="toggle-table-view"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  viewMode === 'table' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Table View"
                aria-label="Switch to Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                id="toggle-grid-view"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Card Grid View"
                aria-label="Switch to Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2 sm:px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-neutral-700 focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="name">Name</option>
                <option value="id">Student ID</option>
                <option value="gpa">GPA</option>
                <option value="year">Year</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="font-bold text-neutral-500 hover:text-neutral-900 px-1"
                title={`Current: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdown Row (Responsive Grid on Mobile, Flex on Desktop) */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium mb-2 sm:hidden">
            <Filter className="w-3 h-3" /> Filter by:
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium hidden sm:flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Department Filter */}
            <select
              id="dept-filter-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              id="year-filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Years</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
            </select>

            {/* Status Filter */}
            <select
              id="status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* Standing Filter */}
            <select
              id="standing-filter-select"
              value={selectedStanding}
              onChange={(e) => setSelectedStanding(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Standings</option>
              <option value="Honors">Dean's List (GPA ≥ 3.75)</option>
              <option value="Good">Good Standing (2.5 - 3.74)</option>
              <option value="Warning">Warning (&lt; 2.5)</option>
            </select>

            {(selectedDepartment !== 'All' || selectedYear !== 'All' || selectedStatus !== 'All' || selectedStanding !== 'All' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="col-span-2 sm:col-span-1 text-indigo-600 hover:text-indigo-800 font-medium sm:ml-auto flex items-center justify-center sm:justify-start gap-1 py-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Operations Bar (Mobile Responsive) */}
      {selectedIds.length > 0 && (
        <div 
          id="batch-actions-bar"
          className="bg-neutral-900 text-white px-3 sm:px-4 py-2.5 rounded-xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold bg-neutral-800 px-2 py-0.5 rounded text-indigo-300">
              {selectedIds.length}
            </span>
            <span>students selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onBatchUpdateStatus(selectedIds, 'Active')}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white font-medium transition-colors cursor-pointer text-center"
            >
              Mark Active
            </button>
            <button
              onClick={() => onBatchUpdateStatus(selectedIds, 'Graduated')}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white font-medium transition-colors cursor-pointer text-center"
            >
              Mark Graduated
            </button>
            <button
              onClick={() => onBatchDelete(selectedIds)}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 rounded-lg text-white font-medium transition-colors cursor-pointer text-center"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-800">No students found</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
            No student records match the active search query or filter parameters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          {/* Mobile Swipe Hint */}
          <div className="sm:hidden px-3 py-2 bg-neutral-50 border-b border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Scroll horizontally to view all fields</span>
            <span className="font-semibold text-neutral-400">⇄</span>
          </div>

          <div className="overflow-x-auto no-scrollbar sm:overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3 sm:p-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[90px]">Student ID</th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[180px]">Student Name</th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[150px]">Major / Department</th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[80px]">Year</th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[90px]">Status</th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[70px]">GPA</th>
                  <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[80px]">Tuition</th>
                  <th className="p-3 sm:p-3.5 text-right whitespace-nowrap min-w-[90px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isHonorRoll = student.gpa >= 3.75;
                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-neutral-50/70 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="p-3 sm:p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(student.id)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3 sm:p-3.5 font-mono font-medium text-neutral-600 whitespace-nowrap">
                        {student.studentId}
                      </td>

                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}`}
                            alt={`${student.firstName} ${student.lastName}`}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                          />
                          <div>
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="font-semibold text-neutral-900 hover:text-indigo-600 text-left cursor-pointer"
                            >
                              {student.firstName} {student.lastName}
                            </button>
                            <p className="text-[11px] text-neutral-400 font-normal">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <p className="font-medium text-neutral-800">{student.major}</p>
                        <p className="text-[11px] text-neutral-400">{student.department}</p>
                      </td>

                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                          {student.year}
                        </span>
                      </td>

                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadgeClass(student.status)}`}>
                          {student.status}
                        </span>
                      </td>

                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold ${
                            student.gpa >= 3.75 ? 'text-indigo-600' :
                            student.gpa >= 3.0 ? 'text-neutral-900' :
                            student.gpa >= 2.0 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {student.gpa.toFixed(2)}
                          </span>
                          {isHonorRoll && (
                            <Award className="w-3.5 h-3.5 text-amber-500" title="Dean's List" />
                          )}
                        </div>
                      </td>

                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          student.tuitionStatus === 'Paid' ? 'text-emerald-700 bg-emerald-50' :
                          student.tuitionStatus === 'Partial' ? 'text-amber-700 bg-amber-50' :
                          'text-rose-700 bg-rose-50'
                        }`}>
                          {student.tuitionStatus}
                        </span>
                      </td>

                      <td className="p-3 sm:p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-view-${student.id}`}
                            onClick={() => onSelectStudent(student)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-edit-${student.id}`}
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-${student.id}`}
                            onClick={() => setDeleteConfirmId(student.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-neutral-500">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <span>Semester Term: Fall 2026</span>
          </div>
        </div>
      )}

      {/* GRID CARD VIEW */}
      {viewMode === 'grid' && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredStudents.map((student) => {
            const isSelected = selectedIds.includes(student.id);
            return (
              <div
                key={student.id}
                className={`bg-white rounded-xl border p-3.5 sm:p-4 shadow-2xs transition-all relative flex flex-col justify-between ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <img
                        src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}`}
                        alt={`${student.firstName} ${student.lastName}`}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <button 
                          onClick={() => onSelectStudent(student)}
                          className="font-bold text-neutral-900 hover:text-indigo-600 cursor-pointer text-sm truncate block text-left"
                        >
                          {student.firstName} {student.lastName}
                        </button>
                        <p className="text-xs text-neutral-400 font-mono">{student.studentId}</p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(student.id)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-indigo-500 mt-1 shrink-0"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 mb-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Department:</span>
                      <span className="font-medium text-neutral-800 truncate max-w-[170px]">{student.major}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Academic Year:</span>
                      <span className="font-medium text-neutral-700">{student.year}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Cumulative GPA:</span>
                      <span className="font-bold text-neutral-900 font-mono flex items-center gap-1">
                        {student.gpa.toFixed(2)}
                        {student.gpa >= 3.75 && <Award className="w-3.5 h-3.5 text-amber-500" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadgeClass(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer py-1"
                  >
                    View Dossier →
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(student.id)}
                      className="p-1.5 sm:p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-neutral-200 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Remove Student Record?</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Are you sure you want to remove this student? All associated enrollment records and grades will be cleared from the active register.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
