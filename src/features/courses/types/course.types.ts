export * from '../../../types';

export interface CreateCoursePayload {
  code: string;
  name: string;
  department: string;
  credits: number;
  instructor: string;
  room: string;
  schedule: string;
  semester: string;
  maxCapacity: number;
}

export interface EnrollStudentPayload {
  studentId: string;
  courseId: string;
  semester: string;
}
