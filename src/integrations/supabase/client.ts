import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const supabaseUrl = 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MjQxNDAsImV4cCI6MjAyMDUwMDE0MH0.SGxXyVlxrKhz4A3L7K-KgNWlmYl9RDzH28QF1ZQqZ5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    fetch: (...args) => {
      const [url, config] = args;
      if (!config) {
        config = {};
      }
      if (!config.headers) {
        config.headers = {};
      }
      return fetch(...args).then(async (response) => {
        if (response.status === 400) {
          const errorData = await response.json();
          if (
            errorData.code === 'session_expired' ||
            errorData.message?.includes('Invalid Refresh Token') ||
            errorData.message?.includes('Session Expired')
          ) {
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
        }
        return response;
      });
    }
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
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