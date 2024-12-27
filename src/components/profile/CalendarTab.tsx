import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MentorAvailabilityForm } from "./calendar/MentorAvailabilityForm";
import { EventList } from "./calendar/EventList";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { CalendarEvent } from "@/types/calendar";
import { useNavigate } from "react-router-dom";

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [cancellationNote, setCancellationNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get initial session and listen for auth changes
  const { data: session, isLoading: isSessionLoading, error: sessionError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return null;
        }
        return session;
      } catch (error) {
        console.error('Session error:', error);
        navigate("/auth");
        return null;
      }
    },
    retry: false
  });

  // Then, get the user's profile type only if we have a session
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Get mentor availability
  const { data: availability = [], isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['mentor_availability', session?.user?.id, selectedDate],
    queryFn: async () => {
      if (!session?.user?.id || !selectedDate) return [];

      const { data, error } = await supabase
        .from('mentor_availability')
        .select('date_available, start_time, end_time, is_available')
        .eq('profile_id', session.user.id)
        .eq('date_available', format(selectedDate, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!selectedDate && profile?.user_type === 'mentor',
  });

  // Get calendar events using our custom hook
  const { data: events = [], isLoading: isEventsLoading } = useSessionEvents(selectedDate, session?.user?.id);

  const handleCancelSession = async () => {
    if (!selectedSession?.session_details) return;

    try {
      // Update the session status in the database
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled',
          notes: cancellationNote 
        })
        .eq('id', selectedSession.session_details.id);

      if (error) throw error;

      // Create notifications for both mentor and mentee
      const notifications = [
        {
          profile_id: selectedSession.session_details.mentor.id,
          title: 'Session Cancelled',
          message: `Session with ${selectedSession.session_details.mentee.full_name} has been cancelled. Note: ${cancellationNote}`,
          type: 'session_cancelled' as const
        },
        {
          profile_id: selectedSession.session_details.mentee.id,
          title: 'Session Cancelled',
          message: `Session with ${selectedSession.session_details.mentor.full_name} has been cancelled. Note: ${cancellationNote}`,
          type: 'session_cancelled' as const
        }
      ];

      // Insert notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      // Send cancellation emails
      const { error: emailError } = await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: selectedSession.session_details.id,
          type: 'cancellation'
        }
      });

      if (emailError) {
        console.error('Error sending cancellation emails:', emailError);
      }

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled and notifications have been sent.",
      });

      // Close the dialog and reset state
      setSelectedSession(null);
      setCancellationNote("");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });

    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isMentor = profile?.user_type === 'mentor';
  const isLoading = isSessionLoading || isProfileLoading || isEventsLoading || isAvailabilityLoading;

  if (sessionError) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please sign in to view your calendar.</p>
      </div>
    );
  }

  // Function to determine if a date has availability set
  const hasAvailability = (date: Date) => {
    if (!date) return false;
    const formattedDate = format(date, 'yyyy-MM-dd');
    return availability?.some(slot => 
      slot.date_available === formattedDate && slot.is_available
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedSession(event);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Calendar</h2>
        {isMentor && (
          <Button 
            onClick={() => setShowAvailabilityForm(true)}
            className="flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            Set Availability
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border bg-kahra-darker"
            modifiers={{
              hasAvailability: (date) => hasAvailability(date)
            }}
            modifiersStyles={{
              hasAvailability: {
                border: '2px solid #22c55e',
                borderRadius: '4px'
              }
            }}
          />
          
          {selectedDate && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">
                Events for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Sessions
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Webinars
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  Holidays
                </Badge>
                {isMentor && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    Available
                  </Badge>
                )}
              </div>
              <EventList 
                events={events} 
                availability={availability} 
                isMentor={isMentor}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </div>

        {showAvailabilityForm && isMentor && (
          <MentorAvailabilityForm 
            onClose={() => setShowAvailabilityForm(false)}
            onSuccess={() => {
              setShowAvailabilityForm(false);
              toast({
                title: "Availability set",
                description: "Your availability has been updated successfully.",
              });
              queryClient.invalidateQueries({ queryKey: ['mentor_availability'] });
            }}
          />
        )}
      </div>

      <Dialog open={!!selectedSession} onOpenChange={() => {
        setSelectedSession(null);
        setCancellationNote("");
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              View session details and manage your booking
            </DialogDescription>
          </DialogHeader>

          {selectedSession?.session_details && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Session Type</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.session_details.session_type.type}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Duration</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.session_details.session_type.duration} minutes
                </p>
              </div>

              <div>
                <h4 className="font-medium">Participants</h4>
                <p className="text-sm text-muted-foreground">
                  Mentor: {selectedSession.session_details.mentor.full_name}<br />
                  Mentee: {selectedSession.session_details.mentee.full_name}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Status</h4>
                <Badge 
                  variant={selectedSession.status === 'cancelled' ? 'destructive' : 'default'}
                  className="mt-1"
                >
                  {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                </Badge>
              </div>

              {selectedSession.status !== 'cancelled' && (
                <>
                  <Textarea
                    placeholder="Please provide a reason for cancellation..."
                    value={cancellationNote}
                    onChange={(e) => setCancellationNote(e.target.value)}
                    className="h-24"
                  />
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSession}
                      disabled={!cancellationNote.trim()}
                    >
                      Cancel Session
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}