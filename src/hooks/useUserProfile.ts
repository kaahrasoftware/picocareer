
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export function useUserProfile(session: Session | null) {
  const { toast } = useToast();

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
          toast({
            title: "Error loading profile",
            description: "Please refresh the page or try again later.",
            variant: "destructive",
          });
          throw error;
        }
        
        console.log("useUserProfile - Profile data:", data);
        console.log("useUserProfile - User type:", data?.user_type);
        return data;
      } catch (err) {
        console.error('Error in useUserProfile:', err);
        throw err;
      }
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: (attempt) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
    staleTime: 15000, // 15 seconds
    gcTime: 30000, // 30 seconds
  });
}
