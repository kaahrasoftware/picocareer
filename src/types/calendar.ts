import { Database } from "@/types/database/database.types";

export type Availability = Database["public"]["Tables"]["mentor_availability"]["Row"];

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
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
      id: string;
      type: string;
      duration: number;
    };
  };
}