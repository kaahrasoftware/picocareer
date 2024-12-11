import { Json } from "@/integrations/supabase/types";

export interface Stats {
  mentees: string;
  connected: string;
  recordings: string;
}

export const parseStats = (stats: Json): Stats => {
  const defaultStats: Stats = { mentees: '0', connected: '0', recordings: '0' };
  
  if (typeof stats === 'string') {
    try {
      return JSON.parse(stats);
    } catch {
      return defaultStats;
    }
  }
  
  if (typeof stats === 'object' && stats !== null && !Array.isArray(stats)) {
    const jsonStats = stats as Record<string, Json>;
    return {
      mentees: String(jsonStats.mentees || '0'),
      connected: String(jsonStats.connected || '0'),
      recordings: String(jsonStats.recordings || '0')
    };
  }
  
  return defaultStats;
};