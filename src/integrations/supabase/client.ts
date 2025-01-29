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
      'X-Client-Info': 'supabase-js-web',
      'Cache-Control': 'no-cache'
    },
    fetch: async (url, options = {}) => {
      const headers = {
        ...options.headers,
        'Cache-Control': 'no-cache'
      };

      try {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
          // Clear auth data from localStorage
          const key = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
          localStorage.removeItem(key);
          
          // Sign out from Supabase
          await supabase.auth.signOut();
          
          // Show toast notification
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });

          // Redirect to auth page
          window.location.href = '/auth';
        }
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
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