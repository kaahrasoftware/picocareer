
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "@/components/event/EventCard";
import { EventHeader } from "@/components/event/EventHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Event() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: registrationCounts } = useQuery({
    queryKey: ['event-registrations-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id, id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((registration) => {
        if (registration.event_id) {
          counts[registration.event_id] = (counts[registration.event_id] || 0) + 1;
        }
      });

      return counts;
    },
  });

  const { data: userRegistrations } = useQuery({
    queryKey: ['user-event-registrations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('profile_id', user.id);

      if (error) throw error;
      return data?.map(r => r.event_id) || [];
    },
    enabled: !!user?.id,
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('You must be logged in to register');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          profile_id: user.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || user.email || '',
          'current academic field/position': '',
          student_or_professional: 'student'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for the event!",
      });
      queryClient.invalidateQueries({ queryKey: ['event-registrations-count'] });
      queryClient.invalidateQueries({ queryKey: ['user-event-registrations'] });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events.",
        variant: "destructive",
      });
      return;
    }

    if (userRegistrations?.includes(eventId)) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this event.",
      });
      return;
    }

    registerMutation.mutate(eventId);
  };

  const handleViewDetails = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsDetailsOpen(true);
    }
  };

  const filteredEvents = events?.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <EventHeader />
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    registrations_count: registrationCounts?.[event.id] || 0
                  }}
                  onRegister={handleRegister}
                  onViewDetails={handleViewDetails}
                  isRegistering={registerMutation.isPending}
                  isRegistered={userRegistrations?.includes(event.id) || false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search criteria."
                  : "No events have been added yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Start Time</h3>
                  <p>{new Date(selectedEvent.start_time).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">End Time</h3>
                  <p>{new Date(selectedEvent.end_time).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Platform</h3>
                  <p>{selectedEvent.platform}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Event Type</h3>
                  <p>{selectedEvent.event_type}</p>
                </div>
              </div>

              {selectedEvent.organized_by && (
                <div>
                  <h3 className="font-semibold">Organized By</h3>
                  <p>{selectedEvent.organized_by}</p>
                </div>
              )}

              {selectedEvent.facilitator && (
                <div>
                  <h3 className="font-semibold">Facilitator</h3>
                  <p>{selectedEvent.facilitator}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold">Description</h3>
                <div className="prose prose-sm max-w-none mt-2" 
                  dangerouslySetInnerHTML={{ __html: selectedEvent.description }} 
                />
              </div>

              {selectedEvent.meeting_link && (
                <div>
                  <h3 className="font-semibold">Meeting Link</h3>
                  <a 
                    href={selectedEvent.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedEvent.meeting_link}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
