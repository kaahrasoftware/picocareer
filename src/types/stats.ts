import { Json } from "@/integrations/supabase/types";

export interface Stats {
  mentees: string;
  connected: string;
  recordings: string;
}

export const parseStats = (stats: Json): Stats => {
  if (typeof stats === 'string') {
    try {
      return JSON.parse(stats);
    } catch {
      return { mentees: '0', connected: '0', recordings: '0' };
    }
  }
  
  if (typeof stats === 'object' && stats !== null) {
    return {
      mentees: String(stats.mentees || '0'),
      connected: String(stats.connected || '0'),
      recordings: String(stats.recordings || '0')
    };
  }
  
  return { mentees: '0', connected: '0', recordings: '0' };
};