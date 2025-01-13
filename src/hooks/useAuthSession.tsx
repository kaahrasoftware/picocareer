import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createContext, useContext, ReactNode } from "react";

const AuthContext = createContext<ReturnType<typeof useAuthSessionHook> | null>(null);

function useAuthSessionHook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          if (sessionError.message?.includes('Invalid Refresh Token') || 
              sessionError.message?.includes('session_expired')) {
            console.log('Session expired, clearing data...');
            await supabase.auth.signOut();
            localStorage.removeItem('picocareer_auth_token');
            queryClient.removeQueries({ queryKey: ['auth-session'] });
            queryClient.removeQueries({ queryKey: ['profile'] });
            queryClient.removeQueries({ queryKey: ['notifications'] });
            
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please sign in again.",
              variant: "default",
            });
            
            navigate("/auth");
            return null;
          }
          throw sessionError;
        }

        if (!existingSession) {
          queryClient.removeQueries({ queryKey: ['auth-session'] });
          queryClient.removeQueries({ queryKey: ['profile'] });
          queryClient.removeQueries({ queryKey: ['notifications'] });
          localStorage.removeItem('picocareer_auth_token');
          return null;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_OUT') {
              queryClient.removeQueries({ queryKey: ['auth-session'] });
              queryClient.removeQueries({ queryKey: ['profile'] });
              queryClient.removeQueries({ queryKey: ['notifications'] });
              localStorage.removeItem('picocareer_auth_token');
            } else if (event === 'TOKEN_REFRESHED') {
              queryClient.invalidateQueries({ queryKey: ['auth-session'] });
            }
          }
        );

        return existingSession;
      } catch (error: any) {
        console.error('Error in useAuthSession:', error);
        
        await supabase.auth.signOut();
        queryClient.clear();
        
        if (error.message !== 'Auth session missing!') {
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          
          navigate("/auth");
        }
        
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return { session, isError };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthSessionHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthSession must be used within an AuthProvider");
  }
  return context;
}