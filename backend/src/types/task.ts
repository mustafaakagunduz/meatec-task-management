import { TaskStatus } from '../generated/prisma';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TasksListResponse {
  tasks: TaskResponse[];
  total: number;
}