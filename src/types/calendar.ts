import { Event } from "@/components/profile/calendar/EventList";

export interface BookedSession {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  mentor: {
    id: string;
    full_name: string;
  };
  mentee: {
    id: string;
    full_name: string;
  };
  session_type: {
    type: string;
    duration: number;
  };
}

export interface CalendarState {
  selectedDate: Date | undefined;
  showAvailabilityForm: boolean;
}

export interface UseCalendarEventsProps {
  selectedDate: Date | undefined;
  session: any;
}