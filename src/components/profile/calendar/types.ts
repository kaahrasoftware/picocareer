export type CalendarViewType = "day" | "week" | "month";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: 'session';
  status?: string;
  session_details?: any;
}