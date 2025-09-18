import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../../pages/Login';
import authSlice from '../../store/slices/authSlice';
import * as toast from '../../utils/toast';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.loginTitle': 'Sign In',
        'auth.loginSubtitle': 'Please sign in to your account',
        'auth.username': 'Username',
        'auth.password': 'Password',
        'auth.loginButton': 'Sign In',
        'auth.loginSuccess': 'Login successful',
        'auth.invalidCredentials': 'Invalid username or password',
        'auth.usernameRequired': 'Username is required',
        'auth.passwordRequired': 'Password is required',
        'auth.hidePassword': 'Hide password',
        'auth.showPassword': 'Show password',
        'auth.dontHaveAccount': "Don't have an account?",
        'auth.register': 'Sign up',
        'common.loading': 'Loading...'
      };
      return translations[key] || key;
    }
  })
}));

// Mock AuthHeader component
jest.mock('../../components/AuthHeader', () => {
  return function MockAuthHeader() {
    return <div data-testid="auth-header">Auth Header</div>;
  };
});

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
      auth: authSlice
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        ...initialState.auth
      }
    }
  });
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = (storeState = {}) => {
    const store = createMockStore(storeState);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      renderLogin();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to your account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should render auth header', () => {
      renderLogin();
      expect(screen.getByTestId('auth-header')).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderLogin();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when username is empty', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });
    });

    it('should show validation error when password is empty', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show validation errors for both fields when both are empty', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when fields are filled', async () => {
      renderLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      // First trigger validation errors
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });

      // Then fill the fields
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Try to submit again
      fireEvent.click(submitButton);

      // Validation errors should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('Password');
      const toggleButton = screen.getByTitle('Show password');

      expect(passwordInput).toHaveAttribute('type', 'password');

      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByTitle('Hide password')).toBeInTheDocument();

      fireEvent.click(screen.getByTitle('Hide password'));

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(screen.getByTitle('Show password')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call login action with form data when form is submitted', async () => {
      const store = createMockStore();
      const mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.resolve()
      });
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful login', async () => {
      const store = createMockStore();
      const mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.resolve()
      });
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.customToast.success).toHaveBeenCalledWith('Login successful');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show error toast on login failure', async () => {
      const store = createMockStore();
      const mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.reject('Invalid credentials')
      });
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.customToast.error).toHaveBeenCalledWith('Invalid username or password');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state when login is in progress', () => {
      renderLogin({ auth: { loading: true } });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      renderLogin({ auth: { loading: true } });

      const submitButton = screen.getByRole('button', { name: /loading/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Authentication State', () => {
    it('should redirect to dashboard when already authenticated', () => {
      renderLogin({ auth: { isAuthenticated: true } });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in username field', () => {
      renderLogin();

      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput).toHaveValue('testuser');
    });

    it('should allow typing in password field', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('should submit form when Enter key is pressed', async () => {
      const store = createMockStore();
      const mockDispatch = jest.fn().mockReturnValue({
        unwrap: () => Promise.resolve()
      });
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });
});