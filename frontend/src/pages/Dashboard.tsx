import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { customToast } from '../utils/toast';
import { logout } from '../store/slices/authSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { RootState, AppDispatch } from '../store';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES, Language } from '../i18n';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'COMPLETED' | 'PENDING'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
    }
  }, [isAuthenticated, dispatch]);

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
    setIsLangDropdownOpen(false);
  };

  const currentLanguage = LANGUAGES[i18n.language as Language] || LANGUAGES.en;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };

    const handleOpenTaskForm = () => {
      setShowTaskForm(true);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('openTaskForm', handleOpenTaskForm);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('openTaskForm', handleOpenTaskForm);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    customToast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;

  return (
    <div className="min-h-screen grid-pattern text-gray-900 dark:text-white">
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-amber-800 dark:text-blue-400">
                {t('common.appTitle')}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="text-sm">
                <p className="text-amber-800 dark:text-gray-300">
                  {t('common.welcome')}, {user.username}
                </p>
              </div>
              
              {/* Language Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300 text-amber-700 dark:text-gray-300"
                  title={t('settings.language')}
                >
                  <span className="text-sm font-medium">{currentLanguage.name}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLangDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-amber-50/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-amber-200 dark:border-gray-700 py-2 z-50">
                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => changeLanguage(code as Language)}
                        className={`w-full px-4 py-2 text-left hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors text-amber-800 dark:text-gray-300 ${
                          i18n.language === code ? 'bg-amber-100 dark:bg-blue-900/20 text-amber-900 dark:text-blue-400' : ''
                        }`}
                      >
                        <span className="text-sm">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300 text-amber-700 dark:text-gray-300"
                title={theme === 'light' ? t('settings.darkMode') : t('settings.lightMode')}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300 text-amber-700 dark:text-gray-300"
                title={t('auth.logout')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div 
                onClick={() => setTaskFilter('all')}
                className={`group bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer relative ${
                  taskFilter === 'all' 
                    ? 'border-amber-400 dark:border-blue-400' 
                    : 'border-gray-200/50 dark:border-gray-600/50'
                }`}
              >
                <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 -rotate-12 opacity-8 dark:opacity-5 pointer-events-none">
                  <svg className="h-32 w-32 text-amber-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div className="p-4 text-center relative z-10 h-16 flex items-center justify-center">
                  <div className="relative">
                    <div className="text-xl font-bold text-amber-700 dark:text-gray-300 transition-all duration-300 ease-in-out group-hover:-translate-y-8 group-hover:opacity-0">
                      {t('tasks.title')}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-amber-800 dark:text-white opacity-0 translate-y-8 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
                      {totalTasks}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setTaskFilter('PENDING')}
                className={`group bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer relative ${
                  taskFilter === 'PENDING' 
                    ? 'border-amber-400 dark:border-blue-400' 
                    : 'border-gray-200/50 dark:border-gray-600/50'
                }`}
              >
                <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 -rotate-12 opacity-8 dark:opacity-5 pointer-events-none">
                  <svg className="h-32 w-32 text-amber-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="p-4 text-center relative z-10 h-16 flex items-center justify-center">
                  <div className="relative">
                    <div className="text-xl font-bold text-amber-700 dark:text-gray-300 transition-all duration-300 ease-in-out group-hover:-translate-y-8 group-hover:opacity-0">
                      {t('tasks.pending')}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-amber-800 dark:text-white opacity-0 translate-y-8 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
                      {pendingTasks}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setTaskFilter('COMPLETED')}
                className={`group bg-gradient-to-br from-gray-50/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer relative ${
                  taskFilter === 'COMPLETED' 
                    ? 'border-amber-400 dark:border-blue-400' 
                    : 'border-gray-200/50 dark:border-gray-600/50'
                }`}
              >
                <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 -rotate-12 opacity-8 dark:opacity-5 pointer-events-none">
                  <svg className="h-32 w-32 text-amber-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="p-4 text-center relative z-10 h-16 flex items-center justify-center">
                  <div className="relative">
                    <div className="text-xl font-bold text-amber-700 dark:text-gray-300 transition-all duration-300 ease-in-out group-hover:-translate-y-8 group-hover:opacity-0">
                      {t('tasks.completed')}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-amber-800 dark:text-white opacity-0 translate-y-8 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
                      {completedTasks}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            
            {/* Task List */}
            <div className="mt-12">
              <TaskList filter={taskFilter} />
            </div>
            
            {/* Task Form Modal */}
            {showTaskForm && (
              <TaskForm onClose={() => setShowTaskForm(false)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;