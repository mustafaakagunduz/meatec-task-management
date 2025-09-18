import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../store/slices/taskSlice';
import { RootState, AppDispatch } from '../store';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import type { Task } from '../store/slices/taskSlice';
import { autoAnimate } from '@formkit/auto-animate';

interface TaskListProps {
  filter: 'all' | 'COMPLETED' | 'PENDING';
}

const TaskList: React.FC<TaskListProps> = ({ filter }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showEditForm, setShowEditForm] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current);
    }
  }, []);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingTask(undefined);
  };

  // Filter and sort tasks based on the filter prop
  const filteredTasks = filter === 'all' 
    ? [...tasks].sort((a, b) => {
        // Sort by status: pending first, completed last
        if (a.status === 'PENDING' && b.status === 'COMPLETED') return -1;
        if (a.status === 'COMPLETED' && b.status === 'PENDING') return 1;
        // If same status, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : tasks.filter(task => task.status === filter);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => dispatch(fetchTasks())}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('common.retry', { defaultValue: 'Retry' })}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-white">
          {filter === 'all' ? t('tasks.title') : t(`tasks.${filter.toLowerCase()}`)} ({filteredTasks.length})
        </h2>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openTaskForm'))}
          className="group bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 dark:text-gray-300"
        >
          <svg className="w-4 h-4 mr-2 text-amber-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('tasks.newTask')}
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-amber-900 dark:text-white">{t('tasks.noTasks')}</h3>
          <p className="mt-2 text-amber-700 dark:text-gray-400">
            {tasks.length === 0 ? t('tasks.noTasksDescription') : `No ${filter.toLowerCase()} tasks found.`}
          </p>
        </div>
      ) : (
        <div ref={parentRef} className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onEdit={handleEdit}
              isExpanded={expandedTaskId === task.id}
              onToggleExpand={(taskId) => setExpandedTaskId(expandedTaskId === taskId ? null : taskId)}
            />
          ))}
        </div>
      )}

      {showEditForm && (
        <TaskForm task={editingTask} onClose={handleCloseEditForm} />
      )}
    </div>
  );
};

export default TaskList;