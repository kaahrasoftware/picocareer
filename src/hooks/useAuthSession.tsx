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
        console.log('Fetching auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }
        
        if (!session) {
          console.log('No valid session found');
          return null;
        }
        
        console.log('Valid session found');
        return session;
      } catch (error: any) {
        console.error('Detailed session error:', error);
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('Invalid Refresh Token')) {
          const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
          localStorage.removeItem(key);
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue.",
            variant: "destructive",
          });
          navigate("/auth");
        }
        throw error;
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