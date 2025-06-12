
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventManagementGrid } from "./EventManagementGrid";

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  event_type: string;
  max_attendees?: number;
}

export function EventManagementTab() {
  const { session } = useAuthSession();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['user-events', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('author_id', session.user.id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
  };

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Event Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your events and view analytics
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <EventManagementGrid
        events={events}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
