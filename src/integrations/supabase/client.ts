import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

const supabaseUrl = 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MjQxNDAsImV4cCI6MjAyMDUwMDE0MH0.SGxXyVlxrKhz4A3L7K-KgNWlmYl9RDzH28QF1ZQqZ5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'X-Client-Info': 'supabase-js-web',
      'Cache-Control': 'no-cache'
    }
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    // Clear auth data
    const key = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
    localStorage.removeItem(key);
    
    // Redirect to auth page if not already there
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }
});

export default supabase;