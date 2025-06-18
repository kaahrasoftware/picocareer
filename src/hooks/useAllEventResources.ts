
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventResource } from "@/types/event-resources";

interface EventResourceWithEvent extends EventResource {
  events: {
    id: string;
    title: string;
    start_time: string;
    organized_by: string;
  };
}

export function useAllEventResources() {
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['all-event-resources'],
    queryFn: async (): Promise<EventResourceWithEvent[]> => {
      const { data, error } = await supabase
        .from('event_resources')
        .select(`
          *,
          events!inner(
            id,
            title,
            start_time,
            organized_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Group resources by event
  const resourcesByEvent = resources?.reduce((acc, resource) => {
    const eventId = resource.events.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: resource.events,
        resources: []
      };
    }
    acc[eventId].resources.push(resource);
    return acc;
  }, {} as Record<string, { event: any; resources: EventResourceWithEvent[] }>);

  return {
    resources,
    resourcesByEvent: resourcesByEvent || {},
    isLoading,
    error
  };
}
