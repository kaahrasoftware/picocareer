import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cmRtbGtma3p1aXZ2d3hqbXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5MDg4NzcsImV4cCI6MjAxODQ4NDg3N30.GBPHJqGkXbShkJVGhBxTjhxZeQqTlqaXQZ_T_D3T_YY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'lovable'
    }
  }
});

// Add error handling utilities
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'An error occurred while accessing the database');
};