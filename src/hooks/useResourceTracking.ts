
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackInteractionParams {
  resourceId: string;
  interactionType: 'view' | 'download';
  metadata?: Record<string, any>;
}

export function useResourceTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackInteractionMutation = useMutation({
    mutationFn: async ({ resourceId, interactionType, metadata = {} }: TrackInteractionParams) => {
      console.log(`Tracking ${interactionType} for resource:`, resourceId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Add browser metadata
      const enrichedMetadata = {
        ...metadata,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || null,
      };

      const { data, error } = await supabase
        .from('event_resource_interactions')
        .insert({
          resource_id: resourceId,
          profile_id: user?.id || null,
          interaction_type: interactionType,
          metadata: enrichedMetadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking interaction:', error);
        throw error;
      }

      console.log('Interaction tracked successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate resource queries to refresh counters
      queryClient.invalidateQueries({ queryKey: ['event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['event-resource-stats'] });
    },
    onError: (error) => {
      console.error('Failed to track interaction:', error);
      // Don't show toast for tracking failures as it's a background operation
    },
  });

  const trackView = (resourceId: string, metadata?: Record<string, any>) => {
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'view',
      metadata,
    });
  };

  const trackDownload = (resourceId: string, metadata?: Record<string, any>) => {
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'download',
      metadata,
    });
  };

  return {
    trackView,
    trackDownload,
    isTracking: trackInteractionMutation.isPending,
  };
}
