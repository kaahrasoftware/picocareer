import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  session: Session | null;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('session_expired')) {
            await handleSessionExpired();
          }
          throw error;
        }

        setSession(initialSession);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setIsError(true);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          await handleSessionExpired();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, toast]);

  const handleSessionExpired = async () => {
    const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    localStorage.removeItem(key);
    queryClient.clear();
    setSession(null);
    
    toast({
      title: "Session Expired",
      description: "Please sign in again to continue.",
      variant: "destructive",
    });
    
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ session, isError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthSession must be used within an AuthProvider");
  }
  return context;
}