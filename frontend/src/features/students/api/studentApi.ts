import { apiClient } from '../../../services/apiClient';
import { Student } from '../../../types';
import { BatchUpdateStatusPayload } from '../types/student.types';

export const studentApi = {
  /**
   * Fetch all students with optional search/filter parameters
   */
  getStudents: async (params?: Record<string, string>): Promise<Student[]> => {
    return apiClient<Student[]>('/students', { params });
  },

  /**
   * Fetch a single student dossier by ID
   */
  getStudentById: async (id: string): Promise<Student> => {
    return apiClient<Student>(`/students/${id}`);
  },

  /**
   * Enroll a new student
   */
  createStudent: async (data: Partial<Student>): Promise<Student> => {
    return apiClient<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update student details
   */
  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    return apiClient<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete student record
   */
  deleteStudent: async (id: string): Promise<void> => {
    return apiClient<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Batch update status
   */
  batchUpdateStatus: async (payload: BatchUpdateStatusPayload): Promise<void> => {
    return apiClient<void>('/students/batch-status', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
