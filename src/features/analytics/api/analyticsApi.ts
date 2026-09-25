import { apiClient } from '../../../services/apiClient';
import { ActivityLog } from '../../../types';

export interface SystemAnalytics {
  totalStudents: number;
  averageGPA: number;
  activeCourses: number;
  departmentDistribution: Array<{
    name: string;
    count: number;
    percent: number;
    avgGpa: number;
  }>;
}

export const analyticsApi = {
  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    return apiClient<SystemAnalytics>('/analytics/overview');
  },

  getAuditLogs: async (): Promise<ActivityLog[]> => {
    return apiClient<ActivityLog[]>('/audit-logs');
  },
};
