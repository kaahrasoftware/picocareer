
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EnhancedEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: "Coffee Time" | "Hackathon" | "Panel" | "Webinar" | "Workshop";
  platform: string;
  status: "Rejected" | "Pending" | "Approved";
  thumbnail_url?: string;
  meeting_link?: string;
  max_attendees?: number;
  organized_by?: string;
  facilitator?: string;
  timezone: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  resources_count: number;
  registrations_count: number;
}

export interface EventFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: "Coffee Time" | "Hackathon" | "Panel" | "Webinar" | "Workshop";
  platform: string;
  meeting_link?: string;
  max_attendees?: number;
  organized_by?: string;
  facilitator?: string;
  timezone: string;
  thumbnail_url?: string;
}

export function useEventManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-management'],
    queryFn: async (): Promise<EnhancedEvent[]> => {
      // Get events with resource and registration counts
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get resource counts
      const { data: resourceCounts, error: resourceError } = await supabase
        .from('event_resources')
        .select('event_id, id')
        .not('event_id', 'is', null);

      if (resourceError) throw resourceError;

      // Get registration counts
      const { data: registrationCounts, error: registrationError } = await supabase
        .from('event_registrations')
        .select('event_id, id')
        .not('event_id', 'is', null);

      if (registrationError) throw registrationError;

      // Count resources and registrations by event
      const resourceCountsMap: Record<string, number> = {};
      const registrationCountsMap: Record<string, number> = {};

      resourceCounts?.forEach(item => {
        if (item.event_id) {
          resourceCountsMap[item.event_id] = (resourceCountsMap[item.event_id] || 0) + 1;
        }
      });

      registrationCounts?.forEach(item => {
        if (item.event_id) {
          registrationCountsMap[item.event_id] = (registrationCountsMap[item.event_id] || 0) + 1;
        }
      });

      // Enhance events with counts
      return eventsData?.map(event => ({
        ...event,
        resources_count: resourceCountsMap[event.id] || 0,
        registrations_count: registrationCountsMap[event.id] || 0,
      })) || [];
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<EventFormData> & { id: string }) => {
      // Ensure event_type is properly typed
      const updateData: any = { ...eventData };
      if (updateData.event_type && typeof updateData.event_type === 'string') {
        const validTypes = ["Coffee Time", "Hackathon", "Panel", "Webinar", "Workshop"];
        if (!validTypes.includes(updateData.event_type)) {
          updateData.event_type = "Webinar"; // Default fallback
        }
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-management'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-management'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .in('id', eventIds);

      if (error) throw error;
    },
    onSuccess: (_, eventIds) => {
      queryClient.invalidateQueries({ queryKey: ['events-management'] });
      toast({
        title: "Success",
        description: `${eventIds.length} events deleted successfully`,
      });
    },
    onError: (error) => {
      console.error('Error bulk deleting events:', error);
      toast({
        title: "Error",
        description: "Failed to delete events",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ eventIds, status }: { eventIds: string[]; status: string }) => {
      // Ensure status is properly typed
      const validStatuses = ["Rejected", "Pending", "Approved"];
      const finalStatus = validStatuses.includes(status) ? status : "Pending";

      const { error } = await supabase
        .from('events')
        .update({ status: finalStatus })
        .in('id', eventIds);

      if (error) throw error;
    },
    onSuccess: (_, { eventIds, status }) => {
      queryClient.invalidateQueries({ queryKey: ['events-management'] });
      toast({
        title: "Success",
        description: `${eventIds.length} events marked as ${status.toLowerCase()}`,
      });
    },
    onError: (error) => {
      console.error('Error updating event status:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    },
  });

  return {
    events,
    isLoading,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
