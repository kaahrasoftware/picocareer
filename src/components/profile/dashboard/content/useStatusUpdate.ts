import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ContentType, ContentStatus } from "../types";

export function useStatusUpdate(contentType: ContentType) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (itemId: string, newStatus: ContentStatus) => {
    try {
      console.log(`Updating ${contentType} status:`, { itemId, newStatus });
      
      const { error } = await supabase
        .from(contentType)
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) {
        console.error(`Error updating ${contentType} status:`, error);
        throw error;
      }

      // Optimistically update the UI
      queryClient.setQueryData(['content-details', contentType], (oldData: any[]) => {
        return oldData?.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        );
      });

      // Then refetch to ensure data consistency
      queryClient.invalidateQueries({ 
        queryKey: ['content-details', contentType]
      });

      toast({
        title: "Status updated",
        description: `${contentType} status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error(`Error updating ${contentType} status:`, error);
      toast({
        title: "Error updating status",
        description: `There was an error updating the ${contentType} status. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return { handleStatusChange };
}