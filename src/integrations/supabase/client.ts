import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Exponential backoff retry strategy
const getRetryDelay = (retryCount: number) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
    fetch: (url, options = {}) => {
      const retryCount = (options as any)._retryCount || 0;
      
      return fetch(url, options).then(async (response) => {
        if (response.status === 429) {
          if (retryCount < 3) {
            const retryAfter = response.headers.get('Retry-After');
            const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : getRetryDelay(retryCount);
            
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            return fetch(url, {
              ...options,
              _retryCount: retryCount + 1,
            });
          }
        }
        return response;
      });
    },
  },
});

// Health check function to verify Supabase connection
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
};