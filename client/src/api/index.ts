import axios from 'axios';
import type { AxiosError } from 'axios';
import type {
  TaskListResponse,
  TaskSingleResponse,
  CreateTaskInput,
  UpdateTaskInput,
  ApiError,
} from '@/types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- Error mapping ---
export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  
  if (axiosError?.response) {
    const { status, data } = axiosError.response;
    switch (status) {
      case 400:
        return data?.detail || 'Bad request.';
      case 404:
        return data?.detail || 'The item you are looking for does not exist.';
      case 422:
        if (data?.errors?.length) {
          return data.errors.map((e) => e.message).join('. ');
        }
        return 'Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      default:
        return data?.detail || `Server error (${status}).`;
    }
  }
  
  if (axiosError?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  if (axiosError?.message === 'Network Error') {
    return 'Cannot connect to server. Check your internet connection.';
  }
  
  return 'An unexpected error occurred.';
}

// --- Task API ---
export const taskApi = {
  async getAll(): Promise<TaskListResponse> {
    const res = await apiClient.get<TaskListResponse>('/api/tasks');
    return res.data;
  },

  async getById(id: number): Promise<TaskSingleResponse> {
    const res = await apiClient.get<TaskSingleResponse>(`/api/tasks/${id}`);
    return res.data;
  },

  async create(input: CreateTaskInput): Promise<TaskSingleResponse> {
    const res = await apiClient.post<TaskSingleResponse>('/api/tasks', input);
    return res.data;
  },

  async update(id: number, input: UpdateTaskInput): Promise<TaskSingleResponse> {
    const res = await apiClient.put<TaskSingleResponse>(`/api/tasks/${id}`, input);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  },
};
