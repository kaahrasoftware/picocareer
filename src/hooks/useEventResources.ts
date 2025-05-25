
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventResource, EventResourceFormData } from "@/types/event-resources";

export function useEventResources(eventId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['event-resources', eventId],
    queryFn: async (): Promise<EventResource[]> => {
      const { data, error } = await supabase
        .from('event_resources')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const addResourceMutation = useMutation({
    mutationFn: async (resourceData: EventResourceFormData) => {
      const { data, error } = await supabase
        .from('event_resources')
        .insert({
          ...resourceData,
          event_id: eventId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      toast({
        title: "Success",
        description: "Resource added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding resource:', error);
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, ...resourceData }: Partial<EventResource> & { id: string }) => {
      const { data, error } = await supabase
        .from('event_resources')
        .update(resourceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating resource:', error);
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    },
  });

  return {
    resources,
    isLoading,
    addResource: addResourceMutation.mutate,
    updateResource: updateResourceMutation.mutate,
    deleteResource: deleteResourceMutation.mutate,
    isAdding: addResourceMutation.isPending,
    isUpdating: updateResourceMutation.isPending,
    isDeleting: deleteResourceMutation.isPending,
  };
}
