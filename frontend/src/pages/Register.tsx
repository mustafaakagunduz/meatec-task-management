import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { customToast } from '../utils/toast';
import { registerUser, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import AuthHeader from '../components/AuthHeader';

const RegisterSchema = z.object({
  username: z
    .string()
    .min(1, 'usernameRequired')
    .min(3, 'usernameMinLength')
    .max(20, 'usernameMaxLength')
    .regex(/^[a-zA-Z0-9_]+$/, 'usernameInvalid'),
  password: z
    .string()
    .min(1, 'passwordRequired')
    .min(6, 'passwordMinLength')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&"])[A-Za-z\d@$!%*?&"]+$/, 'passwordRequirements'),
  confirmPassword: z
    .string()
    .min(1, 'confirmPasswordRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsNotMatch',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

const Register: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  // Watch form values for real-time validation
  const watchedUsername = watch('username', '');
  const watchedPassword = watch('password', '');
  const watchedConfirmPassword = watch('confirmPassword', '');

  // Username validation checks
  const usernameChecks = {
    length: watchedUsername.length >= 3 && watchedUsername.length <= 20,
    chars: watchedUsername.length > 0 && /^[a-zA-Z0-9_]+$/.test(watchedUsername)
  };

  // Password validation checks
  const passwordChecks = {
    length: watchedPassword.length >= 6,
    lowercase: /[a-z]/.test(watchedPassword),
    uppercase: /[A-Z]/.test(watchedPassword),
    number: /\d/.test(watchedPassword),
    special: /[@$!%*?&"]/.test(watchedPassword)
  };

  // Confirm password validation
  const confirmPasswordValid = watchedConfirmPassword.length > 0 && watchedPassword === watchedConfirmPassword;

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      customToast.success(t('auth.registerSuccess'));
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.includes('Username already exists') ? 
        t('auth.usernameExists') : 
        error;
      customToast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.username')}
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 sm:text-sm"
                placeholder={t('auth.username')}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {t(`auth.${errors.username.message}`)}
                </p>
              )}
              <div className="mt-2 text-xs">
                <ul className="space-y-1">
                  <li className={`transition-colors duration-200 ${
                    usernameChecks.length 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {usernameChecks.length ? '✓' : '•'} {t('auth.usernameLength')}
                  </li>
                  <li className={`transition-colors duration-200 ${
                    usernameChecks.chars 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {usernameChecks.chars ? '✓' : '•'} {t('auth.usernameChars')}
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 sm:text-sm"
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {t(`auth.${errors.password.message}`)}
                </p>
              )}
              <div className="mt-2 text-xs">
                <ul className="space-y-1">
                  <li className={`transition-colors duration-200 ${
                    passwordChecks.length 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {passwordChecks.length ? '✓' : '•'} {t('auth.passwordMin6')}
                  </li>
                  <li className={`transition-colors duration-200 ${
                    passwordChecks.lowercase 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {passwordChecks.lowercase ? '✓' : '•'} {t('auth.passwordLowercase')}
                  </li>
                  <li className={`transition-colors duration-200 ${
                    passwordChecks.uppercase 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {passwordChecks.uppercase ? '✓' : '•'} {t('auth.passwordUppercase')}
                  </li>
                  <li className={`transition-colors duration-200 ${
                    passwordChecks.number 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {passwordChecks.number ? '✓' : '•'} {t('auth.passwordNumber')}
                  </li>
                  <li className={`transition-colors duration-200 ${
                    passwordChecks.special 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {passwordChecks.special ? '✓' : '•'} {t('auth.passwordSpecial')}
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.confirmPassword')}
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 sm:text-sm"
                  placeholder={t('auth.confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {t(`auth.${errors.confirmPassword.message}`)}
                </p>
              )}
              <div className="mt-2 text-xs">
                <ul className="space-y-1">
                  <li className={`transition-colors duration-200 ${
                    confirmPasswordValid 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {confirmPasswordValid ? '✓' : '•'} {t('auth.passwordsMatch')}
                  </li>
                </ul>
              </div>
            </div>
          </div>


          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </div>
              ) : (
                t('auth.registerButton')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Register;