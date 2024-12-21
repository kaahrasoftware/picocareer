import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MentorAvailabilityForm } from "./calendar/MentorAvailabilityForm";
import { EventList, Event } from "./calendar/EventList";
import { format } from "date-fns";

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get initial session and user profile
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');
      return session;
    },
    retry: false
  });

  // Get the user's profile type
  const { data: profile } = useQuery({
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

  // Get mentor availability if user is a mentor
  const { data: availability = [] } = useQuery({
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

  // Get booked sessions for the selected date
  const { data: bookedSessions = [] } = useQuery({
    queryKey: ['booked_sessions', selectedDate, session?.user?.id],
    queryFn: async () => {
      if (!selectedDate || !session?.user?.id) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: sessions, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          status,
          mentor:mentor_id(full_name),
          mentee:mentee_id(full_name),
          session_type:session_type_id(type, duration)
        `)
        .or(`mentor_id.eq.${session.user.id},mentee_id.eq.${session.user.id}`)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString());

      if (error) throw error;

      // Convert sessions to calendar events format
      return sessions.map(session => ({
        id: session.id,
        title: `Session with ${session.mentor.full_name === profile?.full_name ? session.mentee.full_name : session.mentor.full_name}`,
        description: `${session.session_type.type} (${session.session_type.duration} minutes)`,
        start_time: session.scheduled_at,
        end_time: new Date(new Date(session.scheduled_at).getTime() + session.session_type.duration * 60000).toISOString(),
        event_type: 'session',
        created_at: session.scheduled_at,
        updated_at: session.scheduled_at
      }));
    },
    enabled: !!selectedDate && !!session?.user?.id,
  });

  const isMentor = profile?.user_type === 'mentor';

  // Function to determine if a date has availability set
  const hasAvailability = (date: Date) => {
    return availability?.some(slot => 
      slot.date_available === format(date, 'yyyy-MM-dd') && slot.is_available
    );
  };

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please sign in to view your calendar.</p>
      </div>
    );
  }

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
                {isMentor && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    Available
                  </Badge>
                )}
              </div>
              <EventList 
                events={bookedSessions} 
                availability={availability} 
                isMentor={isMentor} 
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
    </div>
  );
}