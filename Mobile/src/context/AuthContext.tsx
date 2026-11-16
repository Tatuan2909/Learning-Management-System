import React, { createContext, useContext, useState } from 'react';
import { AuthUser } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<AuthUser>;
  logout: () => void;
  setUserDirectly: (u: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (identifier: string, pass: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const payload = {
        email: identifier.trim(),
        password: pass
      };

      const res = await api.post<AuthUser>('/auth/login', payload);

      // Mobile app is designated exclusively for Teachers & Students
      if (res.role === 'ADMIN') {
        api.setTokens(null, null);
        throw new Error('Tài khoản Quản trị viên chỉ được phép đăng nhập trên giao diện Web.');
      }

      api.setTokens(res.token, res.refreshToken);
      setUser(res);
      setToken(res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch {}
    api.setTokens(null, null);
    setUser(null);
    setToken(null);
  };

  const setUserDirectly = (u: AuthUser) => {
    if (u.role === 'ADMIN') return;
    setUser(u);
    setToken(u.token);
    api.setTokens(u.token, u.refreshToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUserDirectly }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
