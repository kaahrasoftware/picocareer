
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Handles authentication-based navigation logic
 * This component runs on every route change to ensure proper auth flows
 */
export function AuthNavigationHandler() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) return;

    const currentPath = location.pathname;
    const isAuthPage = currentPath === '/auth';
    const isAuthenticated = !!session?.user;

    console.log('AuthNavigationHandler:', { currentPath, isAuthPage, isAuthenticated, loading });

    // If user is not authenticated and not on auth page, redirect to auth
    // But don't redirect if they're already being redirected by useAuthState
    if (!isAuthenticated && !isAuthPage) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth', { replace: true });
      return;
    }

    // If user is authenticated and on auth page, redirect to home
    // But use navigate instead of window.location to avoid refresh loops
    if (isAuthenticated && isAuthPage) {
      console.log('User authenticated on auth page, redirecting to home');
      navigate('/', { replace: true });
      return;
    }
  }, [session, loading, location.pathname, navigate]);

  return null;
}
