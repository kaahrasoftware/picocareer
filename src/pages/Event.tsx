
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "@/components/event/EventCard";
import { EventHeader } from "@/components/event/EventHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { EventDetailsDialog } from "@/components/event/EventDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventRegistrationForm } from "@/components/forms/event/EventRegistrationForm";

export default function Event() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // First get all events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: false });

      if (eventsError) throw eventsError;

      // Then get registration counts for each event
      const { data: registrationCounts, error: countError } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('status', 'registered');

      if (countError) throw countError;

      // Count registrations per event
      const countMap = registrationCounts?.reduce((acc, reg) => {
        acc[reg.event_id] = (acc[reg.event_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Add registration counts to events
      const eventsWithCounts = eventsData?.map(event => ({
        ...event,
        registrations_count: countMap[event.id] || 0
      })) || [];

      return eventsWithCounts;
    },
  });

  // Fetch user's event registrations only if user is authenticated
  const { data: userRegistrations } = useQuery({
    queryKey: ['user-event-registrations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('profile_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Update registered events set when data loads
  useState(() => {
    if (userRegistrations) {
      const registeredIds = new Set(userRegistrations.map(reg => reg.event_id));
      setRegisteredEvents(registeredIds);
    }
  });

  const handleRegister = async (eventId: string) => {
    // No authentication check - anyone can register
    const event = events?.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowRegistrationDialog(true);
    }
  };

  const handleViewDetails = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowDetailsDialog(true);
    }
  };

  const handleRegistrationSuccess = (eventId: string) => {
    setRegisteredEvents(prev => new Set([...prev, eventId]));
    setShowRegistrationDialog(false);
    
    // Refetch events to update registration counts
    refetch();
    
    toast({
      title: "Registration Successful",
      description: "You have been registered for the event! A confirmation email will be sent to you shortly.",
    });
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
                  event={event}
                  onRegister={handleRegister}
                  onViewDetails={handleViewDetails}
                  isRegistering={registeringEvent === event.id}
                  isRegistered={registeredEvents.has(event.id)}
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

      {/* Event Registration Dialog - No authentication required */}
      {showRegistrationDialog && selectedEvent && (
        <Dialog open={showRegistrationDialog} onOpenChange={(open) => !open && setShowRegistrationDialog(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register for {selectedEvent.title}</DialogTitle>
            </DialogHeader>
            
            <EventRegistrationForm
              eventId={selectedEvent.id}
              onSuccess={() => handleRegistrationSuccess(selectedEvent.id)}
              onCancel={() => setShowRegistrationDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {showDetailsDialog && selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
        />
      )}
    </div>
  );
}
