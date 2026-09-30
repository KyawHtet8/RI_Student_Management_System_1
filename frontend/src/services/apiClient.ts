/**
 * Centralized API Client Layer
 * Handles base URL configuration, auth token injection (JWT),
 * standard request formatting, and transparent fallback/mocking
 * for development when the backend server is not active.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface RequestOptions extends RequestInit {
  authToken?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { authToken, params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('auth_token') : null);
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = token.startsWith('Basic ')
      ? token
      : `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(response.status, errorData.message || `Request failed with status ${response.status}`, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: unknown) {
    // If it's already an ApiError from non-2xx status, rethrow
    if (error instanceof ApiError) {
      throw error;
    }
    // Network failure or connection refused (e.g. backend offline during standalone frontend preview)
    const message = error instanceof Error ? error.message : 'Network connection failed';
    throw new ApiError(0, message, error);
  }
}
