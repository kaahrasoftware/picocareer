
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventResourceFormData } from '@/types/event-resources';

export function useEventResourceMutations(eventId: string) {
  const queryClient = useQueryClient();

  const addResource = useMutation({
    mutationFn: async (data: EventResourceFormData) => {
      const { data: resource, error } = await supabase
        .from('event_resources')
        .insert({
          ...data,
          event_id: eventId,
        })
        .select()
        .single();

      if (error) throw error;
      return resource;
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
    mutationFn: async (data: { id: string } & Partial<EventResourceFormData>) => {
      const { id, ...updateData } = data;
      const { data: resource, error } = await supabase
        .from('event_resources')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return resource;
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
    addResource: addResource.mutate,
    updateResource: updateResource.mutate,
    deleteResource: deleteResource.mutate,
    isAdding: addResource.isPending,
    isUpdating: updateResource.isPending,
    isDeleting: deleteResource.isPending,
  };
}
