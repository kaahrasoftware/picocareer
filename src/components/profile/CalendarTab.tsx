
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { EventsSidebar } from "./calendar/EventsSidebar";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: events = [], refetch } = useSessionEvents();
  const { session } = useAuthSession();
  const isMentor = profile.id === session?.user.id && profile.user_type === 'mentor';

  // Handle date parameter from URL and session ID
  useEffect(() => {
    const fetchSessionDate = async () => {
      const dateParam = searchParams.get('date');
      const sessionId = searchParams.get('sessionId');

      // If we have a session ID, fetch the session date
      if (sessionId) {
        console.log('Fetching session date for ID:', sessionId);
        try {
          const { data: sessionData, error } = await supabase
            .from('mentor_sessions')
            .select('scheduled_at')
            .eq('id', sessionId)
            .single();

          if (error) {
            console.error('Error fetching session:', error);
          } else if (sessionData?.scheduled_at) {
            const sessionDate = new Date(sessionData.scheduled_at);
            console.log('Setting calendar to session date:', sessionDate);
            setSelectedDate(sessionDate);
            return; // Exit early, don't process date param
          }
        } catch (error) {
          console.error('Error fetching session date:', error);
        }
      }

      // Fallback to date parameter if no session ID or session fetch failed
      if (dateParam) {
        // Parse date in YYYY-MM-DD format
        const parsedDate = new Date(dateParam + 'T00:00:00');
        
        // Validate the date
        if (!isNaN(parsedDate.getTime())) {
          console.log('Setting calendar to URL date:', parsedDate);
          setSelectedDate(parsedDate);
        }
      }
    };

    fetchSessionDate();
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-auto">
          <CalendarContainer
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availability={[]}
            events={events}
          />
        </div>
        <div className="w-full lg:w-auto">
          <EventsSidebar
            date={selectedDate}
            events={events}
            isMentor={isMentor}
            onEventDelete={() => refetch()}
          />
        </div>
      </div>
    </div>
  );
}
