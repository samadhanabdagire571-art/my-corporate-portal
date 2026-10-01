import { createContext } from 'react';
import { User, AuthResponse } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isTeamLeader: boolean;
  isEmployee: boolean;
  isIntern: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
