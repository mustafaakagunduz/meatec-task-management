import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  total: number;
}

interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
}

interface UpdateTaskData {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
}

interface TasksResponse {
  tasks: Task[];
  total: number;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  total: 0,
};

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('meatec_token');

// Create axios config with auth header
const createAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

// Async thunks
export const fetchTasks = createAsyncThunk<TasksResponse>(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, createAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk<Task, CreateTaskData>(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, createAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create task';
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk<Task, UpdateTaskData>(
  'tasks/updateTask',
  async ({ id, ...taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, taskData, createAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update task';
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk<number, number>(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, createAuthConfig());
      return taskId;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete task';
      return rejectWithValue(message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<TasksResponse>) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.total -= 1;
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;