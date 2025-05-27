
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
      console.log(`🔍 Starting ${interactionType} tracking for resource:`, resourceId);
      console.log('📊 Tracking metadata:', metadata);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user for tracking:', user?.id || 'anonymous');
      
      // Add browser metadata and timestamp
      const enrichedMetadata = {
        ...metadata,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || null,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      console.log('📈 Inserting interaction record...');
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
        console.error('❌ Error tracking interaction:', error);
        throw error;
      }

      console.log('✅ Interaction tracked successfully:', data);
      console.log('🔄 Trigger should now update resource counters automatically');
      return data;
    },
    onSuccess: (data, variables) => {
      console.log(`🎉 ${variables.interactionType} tracking completed for resource:`, variables.resourceId);
      
      // Invalidate resource queries to refresh counters in UI
      queryClient.invalidateQueries({ queryKey: ['event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['event-resource-stats'] });
      
      console.log('🔄 Resource queries invalidated for UI refresh');
    },
    onError: (error, variables) => {
      console.error(`💥 Failed to track ${variables.interactionType} for resource:`, variables.resourceId, error);
      // Don't show toast for tracking failures as it's a background operation
      // But do log it for debugging
    },
  });

  const trackView = (resourceId: string, metadata?: Record<string, any>) => {
    console.log('👁️ Tracking view for resource:', resourceId);
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'view',
      metadata: {
        ...metadata,
        interaction_source: 'view_action'
      },
    });
  };

  const trackDownload = (resourceId: string, metadata?: Record<string, any>) => {
    console.log('⬇️ Tracking download for resource:', resourceId);
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'download',
      metadata: {
        ...metadata,
        interaction_source: 'download_action'
      },
    });
  };

  return {
    trackView,
    trackDownload,
    isTracking: trackInteractionMutation.isPending,
  };
}
