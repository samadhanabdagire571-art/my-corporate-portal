import React, { useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../lib/api-client';
import { AuthContext } from './auth-context-base';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('corporate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('corporate_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('corporate_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>('/api/auth/me');
      setUser(userData);
      localStorage.setItem('corporate_user', JSON.stringify(userData));
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      localStorage.removeItem('corporate_token');
      localStorage.removeItem('corporate_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const currentToken = localStorage.getItem('corporate_token');
      if (!currentToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = await api.get<User>('/api/auth/me');
        if (isMounted) {
          setUser(userData);
          localStorage.setItem('corporate_user', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        localStorage.removeItem('corporate_token');
        localStorage.removeItem('corporate_user');
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/login', {
      identifier,
      password,
      rememberMe,
    });

    localStorage.setItem('corporate_token', res.accessToken);
    localStorage.setItem('nexus_token', res.accessToken);
    localStorage.setItem('corporate_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);

    return res;
  };

  const logout = () => {
    api.post('/api/auth/logout').catch(() => {});
    localStorage.removeItem('corporate_token');
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('corporate_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTeamLeader = user?.role === 'TEAM_LEADER';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isIntern = user?.role === 'INTERN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        isAdmin,
        isTeamLeader,
        isEmployee,
        isIntern,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
