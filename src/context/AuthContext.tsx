
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';
import { loginUser, logoutUser } from '@/utils/authOperations';
import { useAuthState } from '@/hooks/useAuthState';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isAuthenticated, isAdmin, isModerator, isLoading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await loginUser(email, password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });
      
      // Use navigate instead of window.location for smoother transitions
      navigate('/messages', { replace: true });
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: result.error || "Authentication failed",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    const result = await logoutUser();
    
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out",
      });
      
      // Navigate to login page
      navigate('/', { replace: true });
    } else {
      toast({
        title: "Logout Error",
        description: result.error || "An error occurred during logout",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isModerator,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
