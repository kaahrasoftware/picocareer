
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Handles authentication-based navigation logic
 * This component runs on every route change to ensure proper auth flows
 */
export function AuthNavigationHandler() {
  const { session, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) return;

    const currentPath = location.pathname;
    const isAuthPage = currentPath === '/auth';
    const isAuthenticated = !!session?.user;

    // If user is on auth page but is already authenticated, redirect to home
    // The redirect will be handled by useAuthState with a page refresh
    if (isAuthPage && isAuthenticated) {
      // Let useAuthState handle the redirect with page refresh
      return;
    }

    // If user is not authenticated and not on auth page, redirect to auth
    if (!isAuthenticated && !isAuthPage) {
      window.location.href = '/auth';
      return;
    }
  }, [session, loading, location.pathname]);

  return null;
}
