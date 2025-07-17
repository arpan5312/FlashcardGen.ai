import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../supabase'; 

interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ requiresVerification: boolean }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        const { id, email, created_at, user_metadata } = session.user;
        setUser({
          id,
          email: email || '',
          name: user_metadata.name || '',
          isEmailVerified: session.user.email_confirmed_at != null,
          createdAt: new Date(created_at),
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const { id, email, created_at, user_metadata } = session.user;
        setUser({
          id,
          email: email || '',
          name: user_metadata.name || '',
          isEmailVerified: session.user.email_confirmed_at != null,
          createdAt: new Date(created_at),
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    const { user } = data;
    if (!user) {
      setIsLoading(false);
      throw new Error('User not found');
    }

    setUser({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata.name || '',
      isEmailVerified: user.email_confirmed_at != null,
      createdAt: new Date(user.created_at),
    });

    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string): Promise<{ requiresVerification: boolean }> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: 'http://localhost:5173/email-verification', 
      },
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    setIsLoading(false);
    return { requiresVerification: true };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    } else {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    });
    if (error) throw new Error(error.message);
  };

  const verifyEmail = async (token: string) => {
  
  };

  const resendVerification = async () => {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) throw new Error(error.message);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name ?? user.name,
      },
    });
    if (error) throw new Error(error.message);
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerified: !!user?.isEmailVerified,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        verifyEmail,
        resendVerification,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
