import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wurdmlkfkzuivvwxjmxk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTE4MzgsImV4cCI6MjA0OTQyNzgzOH0.x4jgZjedKprq19f2A7QpMrWRHfan3f24Th6sfoy-2eg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important: Set this to false to prevent auto sign-in
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'picocareer_auth_token',
    flowType: 'pkce',
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
});

// Set up auth state change listener with improved error handling
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    if (event === 'SIGNED_OUT') {
      // Clear all auth-related storage
      localStorage.removeItem('picocareer_auth_token');
      localStorage.removeItem('supabase.auth.token');
      
      // Clear any cached data
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (error) {
          console.error('Error clearing cache:', error);
        }
      }
      
      // Redirect to auth page
      window.location.href = '/auth';
    }
    
    // Handle token refresh errors
    if (event === 'TOKEN_REFRESHED') {
      if (!session) {
        console.log('Token refresh failed, redirecting to auth');
        window.location.href = '/auth';
      }
    }

    // Handle email confirmation
    const params = new URLSearchParams(window.location.search);
    const isEmailConfirmation = params.get('type') === 'email_confirmation';
    
    if (event === 'SIGNED_IN' && isEmailConfirmation) {
      console.log('Email confirmed, redirecting to confirmation page');
      window.location.href = '/auth/confirm';
    }
  });

  // Add error event listener for failed requests
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('session_not_found')) {
      console.log('Session error detected, cleaning up...');
      localStorage.removeItem('picocareer_auth_token');
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/auth';
    }
  });
}

// Export a helper function to check session validity
export const checkAndRefreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Invalid session');
    }
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    localStorage.removeItem('picocareer_auth_token');
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/auth';
    return null;
  }
};