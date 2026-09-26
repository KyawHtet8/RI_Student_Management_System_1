import { apiClient } from '../../../services/apiClient';
import { AttendanceEntry } from '../../../types';
import { SaveAttendancePayload } from '../types/attendance.types';

export const attendanceApi = {
  getRecordsByCourseAndDate: async (courseId: string, date: string): Promise<AttendanceEntry[]> => {
    return apiClient<AttendanceEntry[]>('/attendance', {
      params: { courseId, date },
    });
  },

  saveAttendanceSheet: async (payload: SaveAttendancePayload): Promise<AttendanceEntry[]> => {
    return apiClient<AttendanceEntry[]>('/attendance/batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
