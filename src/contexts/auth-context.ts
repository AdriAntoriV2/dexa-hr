import { createContext } from 'react';
import type { AuthEmployee } from '../types/auth';

export interface AuthContextValue {
  user: AuthEmployee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (companyEmail: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);