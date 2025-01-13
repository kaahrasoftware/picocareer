import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: any | null;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
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
    staleTime: 1000 * 60 * 5, // Consider session data fresh for 5 minutes
  });

  return (
    <AuthContext.Provider value={{ session, isError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthSession must be used within an AuthProvider');
  }
  return context;
}