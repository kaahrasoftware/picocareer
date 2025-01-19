import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables with fallback to the project ID from config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wurdmlkfkzuivvwxjmxk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});