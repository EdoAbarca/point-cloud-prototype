import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginView from '../views/LoginView';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render component with Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginView', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockNavigate.mockClear();
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithRouter(<LoginView />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithRouter(<LoginView />);

    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
    });
  });

  it('submits form successfully and navigates', async () => {
    renderWithRouter(<LoginView />);

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        data: {
          id: 1,
          email: 'test@example.com',
          tokens: {
            access: 'mock-access-token',
            refresh: 'mock-refresh-token',
          },
        },
      }),
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
        })
      );
    });

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
      expect(localStorage.getItem('user_email')).toBe('test@example.com');
      expect(localStorage.getItem('user_id')).toBe('1');
      expect(mockNavigate).toHaveBeenCalledWith('/points');
    });
  });

  it('displays error message when login fails', async () => {
    renderWithRouter(<LoginView />);

    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid email or password',
        data: null,
      }),
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', async () => {
    renderWithRouter(<LoginView />);

    // Mock delayed API response
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  message: 'Login successful',
                  data: {
                    id: 1,
                    email: 'test@example.com',
                    tokens: { access: 'token', refresh: 'token' },
                  },
                }),
              }),
            100
          )
        )
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('handles network errors gracefully', async () => {
    renderWithRouter(<LoginView />);

    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('navigates to register page when clicking create account link', () => {
    renderWithRouter(<LoginView />);

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
