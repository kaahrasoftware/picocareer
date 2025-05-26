
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
        userId: authState.user?.id,
        expiresAt: authState.session?.expires_at
          ? new Date(authState.session.expires_at * 1000).toISOString()
          : null
      });
    }
  }, [authState.session, authState.loading, authState.error]);

  // Handle session expiration and proactive refresh
  useEffect(() => {
    const checkSessionExpiry = () => {
      if (authState.session) {
        const expiresAt = authState.session.expires_at;
        if (expiresAt) {
          const expiryTime = new Date(expiresAt * 1000);
          const now = new Date();
          const timeUntilExpiry = expiryTime.getTime() - now.getTime();
          
          // If session will expire in less than 10 minutes, refresh it
          // This is more aggressive than before (changed from 5 to 10 minutes)
          if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
            console.log('Session about to expire, refreshing token');
            // This will trigger a token refresh through Supabase's autoRefreshToken
            queryClient.invalidateQueries({ queryKey: ['auth-session'] });
          }
        }
      }
    };
    
    // Check session expiry every 30 seconds (increased from every minute)
    const interval = setInterval(checkSessionExpiry, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [authState.session, queryClient]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
