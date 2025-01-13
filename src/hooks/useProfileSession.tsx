import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, ReactNode } from "react";

const ProfileContext = createContext<ReturnType<typeof useProfileSessionHook> | null>(null);

function useProfileSessionHook() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isError: sessionError } = useQuery({
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

  return { session, sessionError, queryClient };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profile = useProfileSessionHook();
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

export function useProfileSession() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileSession must be used within a ProfileProvider");
  }
  return context;
}