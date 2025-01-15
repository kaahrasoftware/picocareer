import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const queryClient = useQueryClient();

  const { data: session, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_IN') {
      queryClient.setQueryData(['auth-session'], newSession);
    } 
    else if (event === 'SIGNED_OUT') {
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    session,
    sessionError,
    queryClient
  };
}