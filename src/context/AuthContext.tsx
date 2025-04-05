
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: false,
  error: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Log auth state changes for debugging
  useEffect(() => {
    if (authState.error) {
      console.error('Auth state error:', authState.error);
    } else if (!authState.loading) {
      console.log('Auth state updated:', {
        isAuthenticated: !!authState.session,
        user: authState.user?.id 
      });
    }
  }, [authState.session, authState.loading, authState.error]);

  // Invalidate user-related queries when auth state changes
  useEffect(() => {
    if (!authState.loading && authState.session?.user?.id) {
      // Delay query invalidation slightly to ensure we're not in the middle of auth state update
      const timeoutId = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['profile', authState.session?.user?.id] });
        queryClient.invalidateQueries({ queryKey: ['notifications', authState.session?.user?.id] });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [authState.session, authState.loading, queryClient]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
