import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask } from '../store/slices/taskSlice';
import { RootState, AppDispatch } from '../store';
import { customToast } from '../utils/toast';
import type { Task } from '../store/slices/taskSlice';

const TaskSchema = z.object({
  title: z.string().min(1, 'taskTitleRequired'),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof TaskSchema>;

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.tasks);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(TaskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
    } : {},
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        await dispatch(updateTask({ id: task.id, ...data, status: task.status })).unwrap();
        customToast.success(t('tasks.taskUpdated'));
      } else {
        await dispatch(createTask({ ...data, status: 'PENDING' })).unwrap();
        customToast.success(t('tasks.taskCreated'));
      }
      onClose();
    } catch (error: any) {
      customToast.error(error);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-amber-50/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-md border border-amber-200/50 dark:border-gray-600/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-amber-900 dark:text-white">
              {task ? t('tasks.editTask') : t('tasks.newTask')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-amber-700 dark:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-amber-800 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white bg-yellow-50/80 dark:bg-gray-700/80 text-amber-900 dark:text-white placeholder-amber-700/70 dark:placeholder-gray-400"
                placeholder={t('tasks.taskTitle')}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {t(`tasks.${errors.title.message}`)}
                </p>
              )}
            </div>

            <div>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-amber-800 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white bg-yellow-50/80 dark:bg-gray-700/80 text-amber-900 dark:text-white placeholder-amber-700/70 dark:placeholder-gray-400 resize-none"
                placeholder={t('tasks.taskDescription')}
              />
            </div>


            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:scale-105 text-amber-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:scale-105 text-amber-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : (task ? t('tasks.updateTaskButton') : t('tasks.createTaskButton'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;