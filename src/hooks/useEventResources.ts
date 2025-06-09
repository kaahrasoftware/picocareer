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
      console.log('Adding resource with data:', resourceData);
      
      const { data, error } = await supabase
        .from('event_resources')
        .insert({
          ...resourceData,
          event_id: eventId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          // Ensure file_size is included in the insert
          file_size: resourceData.file_size || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
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
      console.log('Updating resource with data:', resourceData);
      
      const { data, error } = await supabase
        .from('event_resources')
        .update({
          ...resourceData,
          // Ensure file_size is included in the update
          file_size: resourceData.file_size || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
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
      // Get the resource first to check if we need to delete a file
      const { data: resource, error: fetchError } = await supabase
        .from('event_resources')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from database
      const { error } = await supabase
        .from('event_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete file from storage if it's from our event-resources bucket
      if (resource?.file_url && resource.file_url.includes('event-resources')) {
        try {
          const urlParts = resource.file_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const eventFolder = urlParts[urlParts.length - 2];
          const filePath = `${eventFolder}/${fileName}`;

          await supabase.storage
            .from('event-resources')
            .remove([filePath]);
        } catch (storageError) {
          console.warn('Could not delete file from storage:', storageError);
          // Don't fail the whole operation if storage deletion fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-resources', eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
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
