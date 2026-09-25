import { useState, useMemo } from 'react';
import { Student } from '../../../types';
import { useDebounce } from '../../../shared/hooks';

export function useStudentFilter(students: Student[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const debouncedSearch = useDebounce(searchTerm, 250);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        debouncedSearch.trim() === '' ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.studentId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.major.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesDept = departmentFilter === 'All' || student.department === departmentFilter;
      const matchesYear = yearFilter === 'All' || student.year === yearFilter;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

      return matchesSearch && matchesDept && matchesYear && matchesStatus;
    });
  }, [students, debouncedSearch, departmentFilter, yearFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    yearFilter,
    setYearFilter,
    statusFilter,
    setStatusFilter,
    filteredStudents,
  };
}

export function useBatchSelection(students: Student[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(students.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    handleSelectAll,
    handleToggleSelect,
    clearSelection,
  };
}
