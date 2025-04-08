
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      notificationId, 
      read 
    }: { 
      notificationId: string; 
      read: boolean 
    }) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ 
            read, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', notificationId);

        if (error) {
          throw error;
        }

        return { success: true, notificationId, read };
      } catch (error) {
        console.error('Error updating notification status:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate notifications queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Optional: You could also update the cache directly for immediate UI updates
      // but the invalidation above will refresh the data from the server
    },
    onError: (error: any) => {
      console.error('Failed to update notification status:', error);
      
      toast({
        title: "Failed to update notification",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });
}
