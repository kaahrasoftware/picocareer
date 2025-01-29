import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const supabaseUrl = 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MjQxNDAsImV4cCI6MjAyMDUwMDE0MH0.SGxXyVlxrKhz4A3L7K-KgNWlmYl9RDzH28QF1ZQqZ5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear local storage
    const key = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
    localStorage.removeItem(key);
    
    // Show toast notification
    toast({
      title: "Signed Out",
      description: "You have been signed out of your account.",
      variant: "default",
    });
    
    // Redirect to auth page if not already there
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }
});