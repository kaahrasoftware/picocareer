import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NDU4NTcsImV4cCI6MjAxODUyMTg1N30.xpLHE-PIc9jqpgaEhZXk_zEE8t1c1SAHLzHw9Eqo1Eo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Since we're running in public-only mode
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});