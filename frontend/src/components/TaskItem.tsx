import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask } from '../store/slices/taskSlice';
import { RootState, AppDispatch } from '../store';
import { customToast } from '../utils/toast';
import type { Task } from '../store/slices/taskSlice';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  isExpanded: boolean;
  onToggleExpand: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, isExpanded, onToggleExpand }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.tasks);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle ESC key for delete modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showDeleteConfirm]);

  const handleStatusToggle = async () => {
    try {
      const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
      await dispatch(updateTask({ id: task.id, status: newStatus })).unwrap();
      customToast.success(t('tasks.taskUpdated'));
    } catch (error: any) {
      customToast.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteTask(task.id)).unwrap();
      customToast.success(t('tasks.taskDeleted'));
      setShowDeleteConfirm(false);
    } catch (error: any) {
      customToast.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onToggleExpand(task.id);
  };

  return (
    <div 
      className={`group relative bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 p-4 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${
        task.status === 'COMPLETED'
          ? 'border-l-4 border-l-green-500 dark:border-l-green-400'
          : 'border-l-4 border-l-red-700 dark:border-l-red-500'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        {/* Status Toggle and Title together */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={handleStatusToggle}
            disabled={loading}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
              task.status === 'COMPLETED'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {task.status === 'COMPLETED' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Title - right next to checkbox */}
          <h3 className={`text-lg font-medium ${
            task.status === 'COMPLETED' 
              ? 'text-amber-600 dark:text-gray-400 line-through' 
              : 'text-amber-700 dark:text-white'
          }`}>
            {task.title}
          </h3>
        </div>

        {/* Date - visible by default, hidden when expanded */}
        <div className="flex items-center">
          <span className={`text-xs text-amber-600 dark:text-gray-500 transition-opacity duration-200 ${
            isExpanded ? 'opacity-0' : 'opacity-100'
          }`}>
            {formatDate(task.createdAt)}
          </span>
        </div>

        {/* Actions - Hidden by default, show when expanded in same position as date */}
        <div className={`absolute right-4 flex items-center gap-2 transition-opacity duration-200 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={() => onEdit(task)}
            className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={t('common.edit')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title={t('common.delete')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description section - separate from title line */}
      <div className="ml-9">
        {/* Description below title - Hidden by default, show when expanded */}
        {task.description && (
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-20 mt-1' : 'max-h-0'
          }`}>
            <p className={`text-base text-left transition-opacity duration-300 delay-100 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            } ${
              task.status === 'COMPLETED'
                ? 'text-amber-600 dark:text-gray-500'
                : 'text-amber-700 dark:text-gray-400'
            }`}>
              {task.description}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div className="bg-amber-50/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl max-w-sm w-full p-6 border border-amber-200/50 dark:border-gray-600/50">
            <h3 className="text-lg font-medium text-amber-900 dark:text-white mb-4">
              {t('tasks.deleteTask')}
            </h3>
            <p className="text-amber-700 dark:text-gray-400 mb-6">
              {t('tasks.deleteConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-amber-300 dark:border-gray-600 text-amber-700 dark:text-gray-300 rounded-md hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 transition-colors"
              >
                {loading ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;