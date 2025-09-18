import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskItem from '../../components/TaskItem';
import taskSlice, { Task } from '../../store/slices/taskSlice';
import authSlice from '../../store/slices/authSlice';
import * as toast from '../../utils/toast';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'tasks.taskUpdated': 'Task updated successfully',
        'tasks.taskDeleted': 'Task deleted successfully',
        'tasks.deleteTask': 'Delete Task',
        'tasks.deleteConfirm': 'Are you sure you want to delete this task?',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
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

describe('TaskItem Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnToggleExpand = jest.fn();
  
  const mockPendingTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING',
    userId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockCompletedTask: Task = {
    ...mockPendingTask,
    id: 2,
    status: 'COMPLETED'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTaskItem = (task: Task, isExpanded = false, storeState = {}) => {
    const store = createMockStore(storeState);
    return render(
      <Provider store={store}>
        <TaskItem 
          task={task} 
          onEdit={mockOnEdit} 
          isExpanded={isExpanded}
          onToggleExpand={mockOnToggleExpand}
        />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render pending task correctly', () => {
      renderTaskItem(mockPendingTask);
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('1/1/2024')).toBeInTheDocument();
      
      // Pending task should not have checkmark
      const checkbox = screen.getByRole('button', { name: '' }); // Status toggle button
      expect(checkbox).not.toHaveClass('bg-green-500');
    });

    it('should render completed task correctly', () => {
      renderTaskItem(mockCompletedTask);
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toHaveClass('line-through');
      
      // Completed task should have checkmark
      const statusButton = screen.getByRole('button', { name: '' });
      expect(statusButton).toHaveClass('bg-green-500');
    });

    it('should render task without description', () => {
      const taskWithoutDescription = { ...mockPendingTask, description: null };
      renderTaskItem(taskWithoutDescription);
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should show description when expanded', () => {
      renderTaskItem(mockPendingTask, true);
      
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should hide description when collapsed', () => {
      renderTaskItem(mockPendingTask, false);
      
      // Description should be in DOM but visually hidden
      const description = screen.queryByText('Test Description');
      expect(description).toBeInTheDocument();
      expect(description?.parentElement).toHaveClass('max-h-0');
    });
  });

  describe('Interactions', () => {
    it('should toggle expansion when clicking card area', () => {
      renderTaskItem(mockPendingTask);
      
      const taskCard = screen.getByText('Test Task').closest('div');
      if (taskCard) {
        fireEvent.click(taskCard);
        expect(mockOnToggleExpand).toHaveBeenCalledWith(1);
      }
    });

    it('should not toggle expansion when clicking buttons', () => {
      renderTaskItem(mockPendingTask, true);
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      expect(mockOnToggleExpand).not.toHaveBeenCalled();
      expect(mockOnEdit).toHaveBeenCalledWith(mockPendingTask);
    });

    it('should call onEdit when edit button is clicked', () => {
      renderTaskItem(mockPendingTask, true);
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockPendingTask);
    });
  });

  describe('Status Toggle', () => {
    it('should toggle status from pending to completed', async () => {
      const store = createMockStore();
      const mockDispatch = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      
      // Mock the dispatch method
      store.dispatch = mockDispatch;
      
      render(
        <Provider store={store}>
          <TaskItem 
            task={mockPendingTask} 
            onEdit={mockOnEdit} 
            isExpanded={false}
            onToggleExpand={mockOnToggleExpand}
          />
        </Provider>
      );
      
      const statusButton = screen.getByRole('button', { name: '' });
      fireEvent.click(statusButton);
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should be disabled when loading', () => {
      renderTaskItem(mockPendingTask, false, { tasks: { loading: true } });
      
      const statusButton = screen.getByRole('button', { name: '' });
      expect(statusButton).toBeDisabled();
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete confirmation modal when delete button is clicked', () => {
      renderTaskItem(mockPendingTask, true);
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this task?')).toBeInTheDocument();
    });

    it('should close delete modal when cancel is clicked', () => {
      renderTaskItem(mockPendingTask, true);
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
    });

    it('should close delete modal when escape key is pressed', () => {
      renderTaskItem(mockPendingTask, true);
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
    });

    it('should close delete modal when clicking backdrop', () => {
      renderTaskItem(mockPendingTask, true);
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      const backdrop = screen.getByText('Delete Task').closest('.fixed');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
      }
    });

    it('should show loading state in delete modal', () => {
      renderTaskItem(mockPendingTask, true, { tasks: { loading: true } });
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Expanded State', () => {
    it('should show action buttons when expanded', () => {
      renderTaskItem(mockPendingTask, true);
      
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('should hide action buttons when collapsed', () => {
      renderTaskItem(mockPendingTask, false);
      
      const editButton = screen.queryByTitle('Edit');
      const deleteButton = screen.queryByTitle('Delete');
      
      // Buttons exist but are visually hidden
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      expect(editButton?.parentElement).toHaveClass('opacity-0');
      expect(deleteButton?.parentElement).toHaveClass('opacity-0');
    });

    it('should hide date when expanded', () => {
      renderTaskItem(mockPendingTask, true);
      
      const dateElement = screen.getByText('1/1/2024');
      expect(dateElement).toHaveClass('opacity-0');
    });

    it('should show date when collapsed', () => {
      renderTaskItem(mockPendingTask, false);
      
      const dateElement = screen.getByText('1/1/2024');
      expect(dateElement).toHaveClass('opacity-100');
    });
  });

  describe('Styling', () => {
    it('should apply correct border color for pending task', () => {
      renderTaskItem(mockPendingTask);
      
      const taskCard = screen.getByText('Test Task').closest('div');
      expect(taskCard).toHaveClass('border-l-red-700');
    });

    it('should apply correct border color for completed task', () => {
      renderTaskItem(mockCompletedTask);
      
      const taskCard = screen.getByText('Test Task').closest('div');
      expect(taskCard).toHaveClass('border-l-green-500');
    });

    it('should apply strikethrough for completed task title', () => {
      renderTaskItem(mockCompletedTask);
      
      const title = screen.getByText('Test Task');
      expect(title).toHaveClass('line-through');
    });
  });
});