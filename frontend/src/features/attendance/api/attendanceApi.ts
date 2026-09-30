import { apiClient } from '../../../services/apiClient';
import { AttendanceEntry } from '../../../types';
import { SaveAttendancePayload } from '../types/attendance.types';

export const attendanceApi = {
  getRecordsByCourseAndDate: async (courseId: string, date: string): Promise<AttendanceEntry[]> => {
    return apiClient<AttendanceEntry[]>(`/attendance/course/${courseId}/date/${date}`);
  },

  getAllRecords: async (): Promise<AttendanceEntry[]> => {
    return apiClient<AttendanceEntry[]>('/attendance');
  },

  saveAttendanceSheet: async (payload: SaveAttendancePayload): Promise<AttendanceEntry[]> => {
    return apiClient<AttendanceEntry[]>('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
