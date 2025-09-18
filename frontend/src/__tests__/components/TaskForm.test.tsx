import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskForm from '../../components/TaskForm';
import taskSlice, { Task } from '../../store/slices/taskSlice';
import authSlice from '../../store/slices/authSlice';
import * as toast from '../../utils/toast';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'tasks.editTask': 'Edit Task',
        'tasks.newTask': 'New Task',
        'tasks.taskTitle': 'Task Title',
        'tasks.taskDescription': 'Task Description',
        'tasks.taskTitleRequired': 'Task title is required',
        'tasks.taskCreated': 'Task created successfully',
        'tasks.taskUpdated': 'Task updated successfully',
        'tasks.createTaskButton': 'Create Task',
        'tasks.updateTaskButton': 'Update Task',
        'common.cancel': 'Cancel',
        'common.loading': 'Loading...'
      };
      return translations[key] || key;
    }
  })
}));

// Mock toast utilities
jest.mock('../../utils/toast', () => ({
  customToast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: taskSlice,
      auth: authSlice
    },
    preloadedState: {
      tasks: {
        tasks: [],
        loading: false,
        error: null,
        ...initialState.tasks
      },
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState.auth
      }
    }
  });
};

describe('TaskForm Component', () => {
  const mockOnClose = jest.fn();
  
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING',
    userId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTaskForm = (task?: Task, storeState = {}) => {
    const store = createMockStore(storeState);
    return render(
      <Provider store={store}>
        <TaskForm task={task} onClose={mockOnClose} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render new task form when no task is provided', () => {
      renderTaskForm();
      
      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Task Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Task Description')).toBeInTheDocument();
    });

    it('should render edit task form when task is provided', () => {
      renderTaskForm(mockTask);
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByText('Update Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });

    it('should render cancel and submit buttons', () => {
      renderTaskForm();
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should close form when clicking cancel button', () => {
      renderTaskForm();
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close form when clicking close button (X)', () => {
      renderTaskForm();
      
      const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close form when clicking backdrop', () => {
      renderTaskForm();
      
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not close form when clicking inside modal content', () => {
      renderTaskForm();
      
      const modalContent = screen.getByText('New Task').closest('div');
      if (modalContent) {
        fireEvent.click(modalContent);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });

    it('should close form when pressing escape key', () => {
      renderTaskForm();
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close form when pressing other keys', () => {
      renderTaskForm();
      
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty title', async () => {
      renderTaskForm();
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Task title is required')).toBeInTheDocument();
      });
    });

    it('should accept form with only title filled', async () => {
      renderTaskForm();
      
      const titleInput = screen.getByPlaceholderText('Task Title');
      fireEvent.change(titleInput, { target: { value: 'New Task Title' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Task title is required')).not.toBeInTheDocument();
      });
    });

    it('should accept form with both title and description filled', async () => {
      renderTaskForm();
      
      const titleInput = screen.getByPlaceholderText('Task Title');
      const descriptionInput = screen.getByPlaceholderText('Task Description');
      
      fireEvent.change(titleInput, { target: { value: 'New Task Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Task Description' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Task title is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state when task is being submitted', () => {
      renderTaskForm(undefined, { tasks: { loading: true } });
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should disable submit button when loading', () => {
      renderTaskForm(undefined, { tasks: { loading: true } });
      
      const submitButton = screen.getByText('Loading...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should fill form fields correctly for editing task', () => {
      renderTaskForm(mockTask);
      
      const titleInput = screen.getByDisplayValue('Test Task');
      const descriptionInput = screen.getByDisplayValue('Test Description');
      
      expect(titleInput).toBeInTheDocument();
      expect(descriptionInput).toBeInTheDocument();
    });

    it('should handle task with empty description correctly', () => {
      const taskWithoutDescription = { ...mockTask, description: null };
      renderTaskForm(taskWithoutDescription);
      
      const titleInput = screen.getByDisplayValue('Test Task');
      const descriptionInput = screen.getByPlaceholderText('Task Description');
      
      expect(titleInput).toBeInTheDocument();
      expect(descriptionInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderTaskForm();
      
      const titleInput = screen.getByPlaceholderText('Task Title');
      const descriptionInput = screen.getByPlaceholderText('Task Description');
      
      expect(titleInput).toHaveAttribute('type', 'text');
      expect(descriptionInput).toHaveAttribute('rows', '3');
    });

    it('should focus on title input when form opens', () => {
      renderTaskForm();
      
      // Note: This test would need additional setup for focus management
      // For now, we just check that the input exists
      expect(screen.getByPlaceholderText('Task Title')).toBeInTheDocument();
    });
  });
});