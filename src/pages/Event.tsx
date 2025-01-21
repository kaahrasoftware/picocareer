import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";
import { EventHeader } from "@/components/event/EventHeader";
import { EventCard } from "@/components/event/EventCard";
import { EmptyState } from "@/components/event/EmptyState";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar, Clock, Users, Video, Building } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: 'Google Meet' | 'Zoom';
  meeting_link?: string;
  max_attendees?: number;
  thumbnail_url?: string;
  host_id?: string;
  organized_by?: string;
}

export default function Event() {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  // Query for events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', filter],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'Approved')
        .gte('start_time', filter === 'upcoming' ? now : '2000-01-01')
        .lt('start_time', filter === 'upcoming' ? '2100-01-01' : now)
        .order('start_time', { ascending: filter === 'upcoming' });

      if (error) throw error;
      return data as Event[];
    }
  });

  // Query for registrations
  const { data: registrations } = useQuery({
    queryKey: ['event-registrations', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('profile_id', session.user.id);

      if (error) throw error;
      return data.map(r => r.event_id);
    },
    enabled: !!session?.user?.id
  });

  // Query for host details when viewing an event
  const { data: hostProfile } = useQuery({
    queryKey: ['host-profile', viewingEvent?.host_id],
    queryFn: async () => {
      if (!viewingEvent?.host_id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', viewingEvent.host_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!viewingEvent?.host_id
  });

  const handleRegister = async (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleViewDetails = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    if (event) {
      setViewingEvent(event);
    }
  };

  const handleRegistrationSubmit = async (formData: any) => {
    if (!selectedEvent) return;

    setRegistering(selectedEvent.id);
    try {
      // First check if the email is already registered for this event
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', selectedEvent.id)
        .eq('email', formData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You have already registered for this event with this email address.",
          variant: "destructive",
        });
        setSelectedEvent(null);
        return;
      }

      // If no existing registration, proceed with registration
      const { error: insertError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: selectedEvent.id,
          profile_id: session?.user?.id || null,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          "current academic field/position": formData.current_field,
          student_or_professional: formData.student_or_professional,
          "current school/company": formData.current_organization,
          country: formData.country,
          "where did you hear about us": formData.hear_about_us
        });

      if (insertError) throw insertError;

      toast({
        title: "Registration Successful",
        description: "You have been registered for the event",
      });
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Loading events...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <EventHeader filter={filter} onFilterChange={setFilter} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRegistering={registering === event.id}
              isRegistered={registrations?.includes(event.id) || false}
              isPast={filter === 'past'}
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {events?.length === 0 && <EmptyState filter={filter} />}
      </div>

      {/* Registration Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.title || 'Register for Event'}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventRegistrationForm
              eventId={selectedEvent.id}
              onSubmit={handleRegistrationSubmit}
              onCancel={() => setSelectedEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{viewingEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {viewingEvent && (
            <div className="space-y-6">
              {viewingEvent.thumbnail_url && (
                <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
                  <img 
                    src={viewingEvent.thumbnail_url} 
                    alt={viewingEvent.title}
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {hostProfile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      Hosted by {hostProfile.full_name}
                    </div>
                  )}

                  {viewingEvent.organized_by && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4" />
                      Organized by {viewingEvent.organized_by}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(viewingEvent.start_time), 'PPP')}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(viewingEvent.start_time), 'p')} - {format(new Date(viewingEvent.end_time), 'p')}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4" />
                    {viewingEvent.platform}
                  </div>

                  {viewingEvent.max_attendees && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      Maximum {viewingEvent.max_attendees} participants
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {viewingEvent.description}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  className="w-[200px]"
                  onClick={() => {
                    setViewingEvent(null);
                    handleRegister(viewingEvent.id);
                  }}
                  disabled={registering === viewingEvent.id || registrations?.includes(viewingEvent.id) || filter === 'past'}
                >
                  {filter === 'past' 
                    ? "Event Ended"
                    : registering === viewingEvent.id 
                      ? "Registering..." 
                      : registrations?.includes(viewingEvent.id)
                        ? "Registered"
                        : "Register Now"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
