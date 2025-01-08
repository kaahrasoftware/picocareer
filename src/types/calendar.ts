export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  profile_id: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  recurring: boolean;
  day_of_week?: number;
  start_date_time?: string;
  end_date_time?: string;
}