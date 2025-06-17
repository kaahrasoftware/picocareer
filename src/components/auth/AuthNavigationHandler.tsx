
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const AuthNavigationHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Log auth state changes for debugging
  useEffect(() => {
    if (!loading) {
      console.log('Auth state updated:', {
        isAuthenticated: !!session,
        userId: session?.user?.id,
        currentPath: location.pathname,
        expiresAt: session?.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null
      });
    }
  }, [session, loading, location.pathname]);

  // Handle navigation after successful authentication
  useEffect(() => {
    if (!loading && session?.user) {
      // If user just signed in and is on auth page, redirect to home with page refresh
      if (location.pathname === '/auth') {
        console.log('User authenticated, redirecting from auth page to home with page refresh');
        window.location.href = '/';
      }
    } else if (!loading && !session && location.pathname !== '/auth') {
      // Only redirect to auth if user is trying to access protected routes
      const protectedRoutes = ['/profile', '/dashboard', '/token-shop', '/mentor-registration'];
      if (protectedRoutes.includes(location.pathname)) {
        console.log('User not authenticated, redirecting to auth page');
        navigate('/auth', { replace: true });
      }
    }
  }, [session, loading, location.pathname, navigate]);

  return <>{children}</>;
};
