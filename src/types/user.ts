import { Json } from '@/integrations/supabase/types';
import { Stats, parseStats } from './stats';

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
  return parseStats(stats);
};