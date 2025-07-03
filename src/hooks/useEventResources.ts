
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventResource } from "@/types/event-resources";

export function useEventResources(eventId: string) {
  return useQuery({
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
}
