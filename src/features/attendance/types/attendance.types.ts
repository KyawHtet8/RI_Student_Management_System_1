export * from '../../../types';

export interface SaveAttendancePayload {
  date: string;
  courseId: string;
  records: Array<{
    studentId: string;
    status: 'Present' | 'Late' | 'Absent' | 'Excused';
    remarks?: string;
  }>;
}
