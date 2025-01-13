import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/database/profiles";

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          return null;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        return profile;
      } catch (error: any) {
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('session_expired')) {
          const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
          localStorage.removeItem(key);
          queryClient.clear();
          
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
  });

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error: error as Error | null }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileSession() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileSession must be used within a ProfileProvider");
  }
  return context;
}