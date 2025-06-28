
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
      console.log('Fetching events and registration counts...');
      
      // Use a single query with LEFT JOIN to get events and their registration counts
      const { data: eventsWithCounts, error } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      // Process the data to add registration counts
      const processedEvents = eventsWithCounts?.map(event => {
        const registrations_count = event.event_registrations?.[0]?.count || 0;
        console.log(`Event ${event.title}: ${registrations_count} registrations`);
        
        return {
          ...event,
          registrations_count,
          // Remove the nested event_registrations object to clean up the data
          event_registrations: undefined
        };
      }) || [];

      console.log('Processed events:', processedEvents);
      return processedEvents;
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
    
    // Update the local events data to reflect the new registration count
    // This provides immediate feedback without waiting for refetch
    if (events) {
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, registrations_count: (event.registrations_count || 0) + 1 }
          : event
      );
      // Note: We can't directly update the query cache here, but the refetch below will handle it
    }
    
    // Refetch events to get the latest registration counts from the database
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
