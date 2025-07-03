
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventResource } from "@/types/event-resources";
import { toast } from "sonner";

export function useEventResources(eventId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['event-resources', eventId],
    queryFn: async (): Promise<EventResource[]> => {
      const { data, error } = await supabase
        .from('event_resources')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Transform data to match EventResource interface
      return (data || []).map(item => ({
        ...item,
        resource_type: item.resource_type as EventResource['resource_type'] || 'other',
        access_level: item.access_level as EventResource['access_level'] || 'public'
      }));
    },
    enabled: !!eventId,
  });

  const addResource = useMutation({
    mutationFn: async (resource: Omit<EventResource, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('event_resources')
        .insert([resource])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      toast.success('Resource added successfully');
    },
    onError: (error) => {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    },
  });

  const updateResource = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventResource> & { id: string }) => {
      const { data, error } = await supabase
        .from('event_resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      toast.success('Resource updated successfully');
    },
    onError: (error) => {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('event_resources')
        .delete()
        .eq('id', resourceId);
      
      if (error) throw error;
      return resourceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      toast.success('Resource deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    },
  });

  return {
    ...query,
    addResource,
    updateResource,
    deleteResource,
    isAdding: addResource.isPending,
    isUpdating: updateResource.isPending,
    isDeleting: deleteResource.isPending,
  };
}
