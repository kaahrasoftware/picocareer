import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useNotifications(userId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      console.log('Fetching notifications for user:', userId);
      
      if (!userId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Notifications fetched successfully:', data?.length);
        return data || [];
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}