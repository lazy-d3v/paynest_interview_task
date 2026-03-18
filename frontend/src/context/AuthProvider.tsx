import { useState, useEffect, type ReactNode } from 'react';
import type { User, LoginResponse } from '../services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading] = useState(false);

  useEffect(() => {
    // Synchronize if needed or perform other side effects
  }, []);

  const login = (data: LoginResponse) => {
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
