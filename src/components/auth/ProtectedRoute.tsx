
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { session, loading } = useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && requireAuth && !session) {
      // Redirect to auth page with the current path as return URL
      navigate(`/auth?tab=signin`, { 
        state: { 
          redirectUrl: location.pathname + location.search 
        },
        replace: true 
      });
    }
  }, [session, loading, requireAuth, navigate, location]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !session) {
    return null;
  }

  return <>{children}</>;
}
