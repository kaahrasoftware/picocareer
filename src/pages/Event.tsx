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
  registrations_count?: number;
}

export default function Event() {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', filter],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          registrations_count:event_registrations(count)
        `)
        .eq('status', 'Approved')
        .gte('start_time', filter === 'upcoming' ? now : '2000-01-01')
        .lt('start_time', filter === 'upcoming' ? '2100-01-01' : now)
        .order('start_time', { ascending: filter === 'upcoming' });

      if (eventsError) throw eventsError;

      return eventsData.map(event => ({
        ...event,
        registrations_count: event.registrations_count[0]?.count || 0
      }));
    }
  });

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
      const { data: existingReg } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('event_id', selectedEvent.id)
        .eq('email', formData.email)
        .maybeSingle();

      if (existingReg) {
        toast({
          title: "Already Registered",
          description: "You have already registered for this specific event with this email address.",
          variant: "destructive"
        });
        setSelectedEvent(null);
        return;
      }

      const { data: registration, error: regError } = await supabase
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
          "where did you hear about us": formData["where did you hear about us"]
        })
        .select()
        .single();

      if (regError) throw regError;

      try {
        const { error: emailError } = await supabase.functions.invoke('send-event-confirmation', {
          body: { registrationId: registration.id }
        });

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
          toast({
            title: "Registration Successful",
            description: "Registered successfully, but there was an issue sending the confirmation email. Please check your registration status in your profile.",
            variant: "default",
          });
        } else {
          toast({
            title: "Registration Successful",
            description: "You have been registered for the event. Check your email for confirmation details.",
            variant: "default",
          });
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        toast({
          title: "Registration Successful",
          description: "Registered successfully, but there was an issue sending the confirmation email. Please check your registration status in your profile.",
          variant: "default",
        });
      }

      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistering(null);
    }
  };

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
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {events?.length === 0 && <EmptyState filter={filter} />}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

      <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {viewingEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(viewingEvent.start_time), 'PPP')}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(viewingEvent.start_time), 'p')} - {format(new Date(viewingEvent.end_time), 'p')}
                    <span className="text-muted-foreground ml-1">({viewingEvent.timezone})</span>
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
                      {viewingEvent.registrations_count} / {viewingEvent.max_attendees} registered
                    </div>
                  )}

                  {viewingEvent.organized_by && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4" />
                      Organized by {viewingEvent.organized_by}
                    </div>
                  )}
                </div>
              </div>

              <div 
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: viewingEvent.description }}
              />

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
