import { Json } from '@/integrations/supabase/types';

export interface Stats {
  mentees: string;
  connected: string;
  recordings: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  title: string;
  company: string;
  image_url: string;
  bio?: string;
  position?: string;
  education?: string;
  sessions_held?: string;
  stats: Stats;
  created_at?: string;
  user_type?: string;
  top_rated?: boolean;
  skills?: string[];
  tools?: string[];
  keywords?: string[];
  password: string;
  email?: string;
}

// Helper function to parse stats from JSON
export const parseUserStats = (stats: Json): Stats => {
  if (typeof stats === 'string') {
    try {
      return JSON.parse(stats);
    } catch {
      return { mentees: '0', connected: '0', recordings: '0' };
    }
  }
  return stats as Stats;
};