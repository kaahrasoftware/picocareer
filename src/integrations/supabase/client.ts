
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
    // Lower debug level to reduce console noise
    debug: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'picocareer-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 1, // Reduced from 2 to prevent rate limiting
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
const refreshQueue: (() => void)[] = [];

// Helper function to throttle auth operations
export const throttledAuthOperation = async (operation: () => Promise<any>) => {
  const now = Date.now();
  const minInterval = 3000; // 3 seconds between auth operations (reduced from 5s)
  
  if (now - lastRefreshTime < minInterval) {
    console.log('Throttling auth operation to prevent rate limiting');
    await new Promise(resolve => setTimeout(resolve, minInterval));
  }
  
  // If another auth operation is in progress, queue this one
  if (isRefreshingToken) {
    console.log('Auth operation already in progress, queueing this request');
    return new Promise((resolve) => {
      refreshQueue.push(() => {
        operation().then(resolve);
      });
    });
  }
  
  isRefreshingToken = true;
  
  try {
    lastRefreshTime = Date.now();
    const result = await operation();
    return result;
  } catch (error) {
    console.error('Auth operation failed:', error);
    throw error;
  } finally {
    isRefreshingToken = false;
    
    // Process any queued operations
    if (refreshQueue.length > 0) {
      const nextOperation = refreshQueue.shift();
      if (nextOperation) {
        setTimeout(nextOperation, 100); // Process next operation after a small delay
      }
    }
  }
};

// Session persistence helpers
export const getStoredSession = () => {
  try {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  } catch (error) {
    console.error('Error reading stored session:', error);
    return null;
  }
};

// Detect session expiration and try to recover
export const detectSessionExpiration = () => {
  try {
    const storedSession = getStoredSession();
    if (storedSession?.expires_at) {
      const expiresAt = new Date(storedSession.expires_at * 1000);
      const now = new Date();
      
      if (expiresAt < now) {
        console.warn('Session expired, attempting to refresh');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking session expiration:', error);
    return false;
  }
};

// Force a session recovery attempt
export const attemptSessionRecovery = async () => {
  try {
    console.log('Attempting session recovery');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session recovery failed:', error);
      return false;
    }
    
    if (data.session) {
      console.log('Session recovered successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error during session recovery:', error);
    return false;
  }
};
