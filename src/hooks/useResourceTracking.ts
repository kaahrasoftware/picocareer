
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
      console.log(`🔍 Tracking ${interactionType} for resource:`, resourceId);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Add browser metadata
        const enrichedMetadata = {
          ...metadata,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || null,
        };

        console.log('📊 Inserting interaction with data:', {
          resource_id: resourceId,
          profile_id: user?.id || null,
          interaction_type: interactionType,
          metadata: enrichedMetadata,
        });

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
        
        // Update the resource counters manually if trigger doesn't work
        await updateResourceCounters(resourceId, interactionType);
        
        return data;
      } catch (error) {
        console.error('❌ Failed to track interaction:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate resource queries to refresh counters
      queryClient.invalidateQueries({ queryKey: ['event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['event-resource-stats'] });
    },
    onError: (error) => {
      console.error('❌ Failed to track interaction:', error);
      // Don't show toast for tracking failures as it's a background operation
    },
  });

  const updateResourceCounters = async (resourceId: string, interactionType: 'view' | 'download') => {
    try {
      console.log(`🔄 Manually updating ${interactionType} counter for resource:`, resourceId);
      
      if (interactionType === 'view') {
        const { error } = await supabase.rpc('increment', {
          table_name: 'event_resources',
          row_id: resourceId,
          column_name: 'view_count'
        });
        
        if (error) {
          // Fallback: update directly
          const { error: updateError } = await supabase
            .from('event_resources')
            .update({ 
              view_count: supabase.raw('view_count + 1'),
              last_viewed_at: new Date().toISOString()
            })
            .eq('id', resourceId);
          
          if (updateError) {
            console.error('❌ Failed to update view count:', updateError);
          }
        }
      } else if (interactionType === 'download') {
        const { error } = await supabase.rpc('increment', {
          table_name: 'event_resources',
          row_id: resourceId,
          column_name: 'download_count'
        });
        
        if (error) {
          // Fallback: update directly
          const { error: updateError } = await supabase
            .from('event_resources')
            .update({ 
              download_count: supabase.raw('download_count + 1'),
              last_downloaded_at: new Date().toISOString()
            })
            .eq('id', resourceId);
          
          if (updateError) {
            console.error('❌ Failed to update download count:', updateError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating resource counters:', error);
    }
  };

  const trackView = (resourceId: string, metadata?: Record<string, any>) => {
    console.log('👁️ Tracking view for resource:', resourceId);
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'view',
      metadata,
    });
  };

  const trackDownload = (resourceId: string, metadata?: Record<string, any>) => {
    console.log('⬇️ Tracking download for resource:', resourceId);
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
