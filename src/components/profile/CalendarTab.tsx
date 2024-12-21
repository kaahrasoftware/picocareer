import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MentorAvailabilityForm } from "./calendar/MentorAvailabilityForm";
import { EventList } from "./calendar/EventList";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: 'session' | 'webinar' | 'holiday';
  created_at: string;
  updated_at: string;
}

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const { toast } = useToast();

  // First, get the authenticated user's session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Finally, get calendar events for the selected date
  const { data: events, isLoading: isEventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar_events', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('end_time', endOfDay.toISOString());

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!selectedDate
  });

  const isMentor = profile?.user_type === 'mentor';
  const isLoading = isSessionLoading || isProfileLoading || isEventsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              </div>
              <EventList events={events || []} />
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
            }}
          />
        )}
      </div>
    </div>
  );
}