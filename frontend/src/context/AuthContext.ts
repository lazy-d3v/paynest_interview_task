import { createContext } from 'react';
import type { User, LoginResponse } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
