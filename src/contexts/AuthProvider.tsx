import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  apiRequest,
  getAccessToken,
  getStoredUser,
  saveStoredUser,
  setAccessToken,
} from '../services/api';
import type {
  AuthEmployee,
  CurrentUserResponse,
  LoginResponse,
} from '../types/auth';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getAccessToken();
      const cachedUser = getStoredUser<AuthEmployee>();

      if (!token || !cachedUser || cachedUser.role !== 'HR') {
        logout();
        setIsLoading(false);
        return;
      }

      try {
        const currentUser =
          await apiRequest<CurrentUserResponse>('/auth/me');

        if (
          currentUser.id !== cachedUser.id ||
          currentUser.role !== 'HR'
        ) {
          throw new Error('Saved session is invalid.');
        }

        if (!cancelled) {
          setUser(cachedUser);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(
    async (companyEmail: string, password: string) => {
      const result = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ companyEmail, password }),
      });

      if (result.employee.role !== 'HR') {
        throw new Error('This portal is for HR accounts only.');
      }

      setAccessToken(result.accessToken);

      try {
        const currentUser =
          await apiRequest<CurrentUserResponse>('/auth/me');

        if (
          currentUser.id !== result.employee.id ||
          currentUser.role !== 'HR'
        ) {
          throw new Error('Unable to verify HR account.');
        }

        saveStoredUser(result.employee);
        setUser(result.employee);
      } catch (error) {
        logout();
        throw error;
      }
    },
    [logout],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}