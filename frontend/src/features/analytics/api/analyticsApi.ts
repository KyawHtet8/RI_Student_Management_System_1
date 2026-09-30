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
  term?: string;
  department?: string;
  generatedAt?: string;
}

export const analyticsApi = {
  getSystemAnalytics: async (params?: { term?: string; department?: string }): Promise<SystemAnalytics> => {
    return apiClient<SystemAnalytics>('/analytics/overview', { params });
  },

  getAuditLogs: async (): Promise<ActivityLog[]> => {
    return apiClient<ActivityLog[]>('/audit-logs');
  },
};
