export * from '../../../types';

export interface StudentFilterParams {
  searchTerm?: string;
  department?: string;
  year?: string;
  status?: string;
}

export interface BatchUpdateStatusPayload {
  ids: string[];
  status: string;
}
