
import { useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { router } from "./routes";
import { useLoading } from "@/context/LoadingContext";
import { useToast } from "@/hooks/use-toast";

/**
 * AppRoutes component that renders the application routes
 * with enhanced handling of route transitions, loading states, and errors
 */
export function AppRoutes() {
  // Get the routes configuration from the router object
  const routes = router.routes;
  const location = useLocation();
  const { startLoading, stopLoading, updateProgress } = useLoading();
  const { toast } = useToast();
  
  // Handle route transitions with loading indicators
  useEffect(() => {
    // Start loading when route changes
    startLoading('Loading page...');
    
    // Simulate progressive loading for better UX
    const progressInterval = setInterval(() => {
      updateProgress(prev => Math.min(95, prev + Math.random() * 5));
    }, 100);
    
    // Complete loading after a short delay
    const loadingTimer = setTimeout(() => {
      clearInterval(progressInterval);
      updateProgress(100);
      
      // Add a small delay to show the completed progress
      setTimeout(() => {
        stopLoading();
      }, 300);
    }, 800);
    
    return () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimer);
    };
  }, [location.pathname, startLoading, stopLoading, updateProgress]);
  
  // Handle route errors
  useEffect(() => {
    const handleRouteError = () => {
      toast({
        title: "Navigation Error",
        description: "There was a problem loading the page. Please try again.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('error', handleRouteError);
    return () => {
      window.removeEventListener('error', handleRouteError);
    };
  }, [toast]);
  
  // Render the routes using useRoutes hook
  const element = useRoutes(routes);
  
  return element;
}
