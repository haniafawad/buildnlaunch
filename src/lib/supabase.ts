import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log for debugging (remove in production)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check Netlify environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
