import { apiClient } from '../../../services/apiClient';
import { Course, Enrollment, LetterGrade } from '../../../types';
import { CreateCoursePayload, EnrollStudentPayload } from '../types/course.types';

export const courseApi = {
  getCourses: async (): Promise<Course[]> => {
    return apiClient<Course[]>('/courses');
  },

  getEnrollments: async (): Promise<Enrollment[]> => {
    return apiClient<Enrollment[]>('/enrollments');
  },

  createCourse: async (data: CreateCoursePayload): Promise<Course> => {
    return apiClient<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  enrollStudent: async (payload: EnrollStudentPayload): Promise<Enrollment> => {
    return apiClient<Enrollment>(`/enrollments/courses/${payload.courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGrade: async (enrollmentId: string, grade: LetterGrade): Promise<Enrollment> => {
    return apiClient<Enrollment>(`/enrollments/${enrollmentId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ grade }),
    });
  },

  dropCourse: async (enrollmentId: string): Promise<void> => {
    return apiClient<void>(`/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  },
};
