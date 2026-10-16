export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponse {
  data: Task[];
  total: number;
}

export interface TaskSingleResponse {
  data: Task;
}

export interface CreateTaskInput {
  title: string;
  completed?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
}

export interface ApiError {
  title: string;
  status: number;
  detail?: string;
  request_id: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}
