export interface Availability {
  id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  recurring: boolean;
  day_of_week: number | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: 'session' | 'holiday' | 'webinar';
  created_at: string;
  updated_at: string;
  status?: string;
  session_details?: {
    id: string;
    scheduled_at: string;
    status: string;
    mentor_id: string;
    mentee_id: string;
    session_type: {
      duration: number;
      type: string;
    };
  };
}