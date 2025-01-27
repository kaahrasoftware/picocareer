import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wurdmlkfkzuivvwxjmxk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTE4MzgsImV4cCI6MjA0OTQyNzgzOH0.x4jgZjedKprq19f2A7QpMrWRHfan3f24Th6sfoy-2eg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'picocareer_auth_token',
    flowType: 'pkce',
    onAuthStateChange: (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Handle session expiration
        if (!session && event === 'TOKEN_REFRESHED') {
          // Clear auth data
          const key = `sb-${SUPABASE_URL.split('//')[1]}-auth-token`;
          localStorage.removeItem(key);
          
          // Redirect to auth page
          window.location.href = '/auth';
        }
      }
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'picocareer-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  // Add retry configuration
  db: {
    schema: 'public',
  },
  // Add error handling for fetch operations
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache',
      },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        
        // Handle session expiration specifically
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('session_expired')) {
          // Clear auth data
          const key = `sb-${SUPABASE_URL.split('//')[1]}-auth-token`;
          localStorage.removeItem(key);
          
          // Redirect to auth page
          window.location.href = '/auth?error=session_expired';
        }
        
        console.error('Supabase request failed:', error);
        throw new Error(error.message || 'Failed to fetch data');
      }
      return response;
    }).catch(async (error) => {
      console.error('Network error:', error);
      // Retry the request up to 3 times with exponential backoff
      for (let i = 0; i < 3; i++) {
        try {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Cache-Control': 'no-cache',
            },
          });
          if (retryResponse.ok) {
            return retryResponse;
          }
        } catch (retryError) {
          console.error(`Retry ${i + 1} failed:`, retryError);
        }
      }
      throw error;
    });
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