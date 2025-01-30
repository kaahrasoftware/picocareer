import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wurdmlkfkzuivvwxjmxk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTE4MzgsImV4cCI6MjA0OTQyNzgzOH0.x4jgZjedKprq19f2A7QpMrWRHfan3f24Th6sfoy-2eg";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'picocareer-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 1, // Reduce from default 2 to 1 to help with rate limits
    },
  },
  db: {
    schema: 'public',
  },
  // Add retry configuration with exponential backoff
  fetch: async (url, options = {}) => {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000; // Start with 1 second delay
    const MAX_DELAY = 10000; // Maximum delay of 10 seconds

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        // If we hit rate limit, wait and retry
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
          console.warn(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }

        // For other client errors, throw them to be handled by error boundary
        if (!response.ok) {
          const error = await response.json();
          console.error('Supabase request failed:', error);
          throw new Error(error.message || 'Failed to fetch data');
        }

        return response;
      } catch (error) {
        // On last attempt, throw the error
        if (attempt === MAX_RETRIES - 1) {
          throw error;
        }

        // Otherwise wait and retry
        const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
        console.error(`Error on attempt ${attempt + 1}, retrying in ${delay}ms:`, error);
        await sleep(delay);
      }
    }

    throw new Error('Max retries exceeded');
  },
});

// Add health check function
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};
