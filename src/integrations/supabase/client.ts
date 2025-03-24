
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wurdmlkfkzuivvwxjmxk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTE4MzgsImV4cCI6MjA0OTQyNzgzOH0.x4jgZjedKprq19f2A7QpMrWRHfan3f24Th6sfoy-2eg";

// Create a consistent storage key specific to the app
const AUTH_STORAGE_KEY = 'picocareer_auth_token';

// Configure the Supabase client with optimized settings
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: AUTH_STORAGE_KEY,
    flowType: 'pkce',
    // Adding debounce and throttling for auth requests to avoid rate limiting
    debug: false,
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
  db: {
    schema: 'public',
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

// Cache control to prevent multiple simultaneous auth requests
let isRefreshingToken = false;
let lastRefreshTime = 0;

// Helper function to throttle auth operations
export const throttledAuthOperation = async (operation: () => Promise<any>) => {
  const now = Date.now();
  const minInterval = 2000; // 2 seconds between auth operations
  
  if (now - lastRefreshTime < minInterval) {
    console.log('Throttling auth operation to prevent rate limiting');
    await new Promise(resolve => setTimeout(resolve, minInterval));
  }
  
  try {
    lastRefreshTime = Date.now();
    return await operation();
  } catch (error) {
    console.error('Auth operation failed:', error);
    throw error;
  }
};
