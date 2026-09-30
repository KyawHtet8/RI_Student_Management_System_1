import React, { createContext, useContext, useState } from 'react';
import { apiClient, ApiError } from '../services/apiClient';

interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
// Keep the short-lived Basic credential in the tab session only. This is still
// an MVP authentication mechanism; production should use an HTTP-only cookie.
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_username';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(AUTH_TOKEN_KEY));
  const [username, setUsername] = useState(() => sessionStorage.getItem(AUTH_USER_KEY));

  const login = async (nextUsername: string, password: string) => {
    const basicToken = `Basic ${btoa(`${nextUsername}:${password}`)}`;
    await apiClient<{ username: string }>('/auth/login', { authToken: basicToken });
    sessionStorage.setItem(AUTH_TOKEN_KEY, basicToken);
    sessionStorage.setItem(AUTH_USER_KEY, nextUsername);
    setToken(basicToken);
    setUsername(nextUsername);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(token), username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) return <>{children}</>;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error) {
      setError(error instanceof ApiError && error.status === 401
        ? 'Invalid superuser credentials.'
        : 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">NextSMS</p>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Superuser sign in</h1>
          <p className="mt-2 text-sm text-neutral-500">Sign in to manage students, courses, and attendance.</p>
        </div>
        <label className="mb-4 block text-sm font-medium text-neutral-700">
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-indigo-500" autoComplete="username" required />
        </label>
        <label className="mb-5 block text-sm font-medium text-neutral-700">
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-indigo-500" autoComplete="current-password" required />
        </label>
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={isLoading} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
};
