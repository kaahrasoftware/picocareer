import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useNotifications(userId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      try {
        console.log('Fetching notifications for user:', userId);
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        console.log('Fetched notifications:', data);
        return data || [];
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again later.",
          variant: "destructive",
        });
        return []; // Return empty array instead of throwing to prevent UI disruption
      }
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}