import { Json } from "@/integrations/supabase/types";

export interface Stats {
  mentees: string;
  connected: string;
  recordings: string;
  [key: string]: string; // Add index signature to make it assignable to Json
}

export const parseStats = (stats: Json): Stats => {
  const defaultStats: Stats = { 
    mentees: '0', 
    connected: '0', 
    recordings: '0'
  };
  
  if (!stats) {
    return defaultStats;
  }

  if (typeof stats === 'string') {
    try {
      return { ...defaultStats, ...JSON.parse(stats) };
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