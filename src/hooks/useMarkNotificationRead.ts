
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      notificationId, 
      read,
      allUnread = false // New parameter to mark all as read
    }: { 
      notificationId?: string; 
      read?: boolean;
      allUnread?: boolean;
    }) => {
      try {
        let result;
        
        // Handle marking all unread notifications as read
        if (allUnread) {
          const { error } = await supabase
            .from('notifications')
            .update({ 
              read: true, 
              updated_at: new Date().toISOString() 
            })
            .eq('read', false);
            
          if (error) throw error;
          result = { success: true, action: 'all_marked_read' };
          
        } else if (notificationId) {
          // Handle single notification update
          const { error } = await supabase
            .from('notifications')
            .update({ 
              read: read, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', notificationId);

          if (error) throw error;
          result = { success: true, notificationId, read };
        } else {
          throw new Error('Invalid parameters: Either notificationId or allUnread must be provided');
        }

        return result;
      } catch (error) {
        console.error('Error updating notification status:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate notifications queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      if (data.action === 'all_marked_read') {
        toast({
          title: "All notifications marked as read",
          description: "Your notifications have been updated",
          variant: "default",
        });
      }
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
