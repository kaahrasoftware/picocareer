import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { EventHeader } from "@/components/event/EventHeader";
import { EventCard } from "@/components/event/EventCard";
import { EmptyState } from "@/components/event/EmptyState";
import { Calendar, Clock, Users, Video, Building } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";

export default function Event() {
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, registrations_count:registrations(count)")
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: registration } = useQuery({
    queryKey: ["event-registration", viewingEvent?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", viewingEvent.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!viewingEvent,
  });

  const isRegistered = !!registration;

  const handleRegistration = async (formData: any) => {
    try {
      const { error } = await supabase.from("registrations").insert({
        event_id: viewingEvent.id,
        ...formData,
      });

      if (error) throw error;

      setViewingEvent(null);
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <EventHeader />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[300px] rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                registrationsCount={event.registrations_count}
                onSelect={() => setViewingEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
        <DialogContent className="max-w-2xl">
          <ScrollArea className="max-h-[80vh]">
            {viewingEvent && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(viewingEvent.start_time), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(viewingEvent.start_time), "h:mm a")} -{" "}
                        {format(new Date(viewingEvent.end_time), "h:mm a")}{" "}
                        ({viewingEvent.timezone})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4" />
                      <span>{viewingEvent.platform}</span>
                    </div>
                    {viewingEvent.organized_by && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4" />
                        <span>{viewingEvent.organized_by}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>
                        {viewingEvent.registrations_count || 0} registered
                        {viewingEvent.max_attendees &&
                          ` / ${viewingEvent.max_attendees} max`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">{viewingEvent.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {viewingEvent.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{viewingEvent.event_type}</Badge>
                      {viewingEvent.facilitator && (
                        <Badge variant="outline">
                          Facilitator: {viewingEvent.facilitator}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {isRegistered ? (
                  <div className="rounded-lg border p-4 text-center space-y-2">
                    <p className="text-sm font-medium">
                      You are registered for this event
                    </p>
                    {viewingEvent.meeting_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(viewingEvent.meeting_link, "_blank")
                        }
                      >
                        Join Meeting
                      </Button>
                    )}
                  </div>
                ) : (
                  <EventRegistrationForm
                    eventId={viewingEvent.id}
                    onSubmit={handleRegistration}
                  />
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}