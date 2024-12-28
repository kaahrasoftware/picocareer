import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM3MjY0MDAsImV4cCI6MjAxOTMwMjQwMH0.C7LwWXHzZbKyXsMhxqTqms4ks0CHN5g-DQIxAyLzg8g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'picocareer_auth_token'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add error handling for failed requests
supabase.handleError = (error: any) => {
  console.error('Supabase error:', error);
  if (error.status === 401) {
    // Handle authentication errors
    console.error('Authentication error. Please check your API keys and authentication status.');
  }
};