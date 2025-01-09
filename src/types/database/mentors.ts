import { Json } from "./auth";

export interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

export interface MentorsTables {
  mentor_availability: {
    Row: {
      id: string
      profile_id: string
      start_time: string
      end_time: string
      timezone: string
      is_available: boolean | null
      created_at: string
      updated_at: string
      date_available: string
    }
    Insert: {
      id?: string
      profile_id: string
      start_time: string
      end_time: string
      timezone: string
      is_available?: boolean | null
      created_at?: string
      updated_at?: string
      date_available: string
    }
    Update: {
      id?: string
      profile_id?: string
      start_time?: string
      end_time?: string
      timezone?: string
      is_available?: boolean | null
      created_at?: string
      updated_at?: string
      date_available?: string
    }
  }
  mentor_session_types: {
    Row: {
      id: string
      profile_id: string
      type: string
      duration: number
      price: number
      description: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      profile_id: string
      type: string
      duration: number
      price: number
      description?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      profile_id?: string
      type?: string
      duration?: number
      price?: number
      description?: string | null
      created_at?: string
      updated_at?: string
    }
  }
  mentor_sessions: {
    Row: {
      id: string
      mentor_id: string
      mentee_id: string
      session_type_id: string
      scheduled_at: string
      status: string
      notes: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      mentor_id: string
      mentee_id: string
      session_type_id: string
      scheduled_at: string
      status?: string
      notes?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      mentor_id?: string
      mentee_id?: string
      session_type_id?: string
      scheduled_at?: string
      status?: string
      notes?: string | null
      created_at?: string
      updated_at?: string
    }
  }
}