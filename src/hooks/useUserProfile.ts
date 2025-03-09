
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useUserProfile(session: Session | null) {
  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      console.log("useUserProfile - Fetching profile for user:", session?.user?.id);
      
      if (!session?.user?.id) {
        console.log("useUserProfile - No user ID, returning null");
        return null;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        
        console.log("useUserProfile - Profile data:", data);
        return data;
      } catch (err) {
        console.error('Error in useUserProfile:', err);
        throw err;
      }
    },
    enabled: !!session?.user?.id,
    retry: 2,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });
}
