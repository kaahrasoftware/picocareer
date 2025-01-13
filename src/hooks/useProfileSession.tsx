import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "./useAuthSession";

interface ProfileContextType {
  session: any | null;
  sessionError: any | null;
  queryClient: any;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session: authSession } = useAuthSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ['profile-session', authSession?.user?.id],
    queryFn: async () => {
      if (!authSession?.user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authSession.user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }

      return data;
    },
    enabled: !!authSession?.user?.id,
  });

  return (
    <ProfileContext.Provider value={{ session, sessionError, queryClient }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileSession() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileSession must be used within a ProfileProvider');
  }
  return context;
}