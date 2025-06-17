
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();

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

  // Handle navigation after successful authentication
  useEffect(() => {
    if (!authState.loading && authState.session?.user) {
      // If user just signed in and is on auth page, redirect to home
      if (location.pathname === '/auth') {
        console.log('User authenticated, redirecting from auth page to home');
        navigate('/', { replace: true });
      }
    } else if (!authState.loading && !authState.session && location.pathname !== '/auth') {
      // Only redirect to auth if user is trying to access protected routes
      const protectedRoutes = ['/profile', '/dashboard', '/token-shop', '/mentor-registration'];
      if (protectedRoutes.includes(location.pathname)) {
        console.log('User not authenticated, redirecting to auth page');
        navigate('/auth', { replace: true });
      }
    }
  }, [authState.session, authState.loading, location.pathname, navigate]);

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
          if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
            console.log('Session about to expire, refreshing token');
            // This will trigger a token refresh through Supabase's autoRefreshToken
            queryClient.invalidateQueries({ queryKey: ['auth-session'] });
          }
        }
      }
    };
    
    // Check session expiry every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [authState.session, queryClient]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
