import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify that actual values are present and not placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('YOUR-PROJECT') &&
    supabaseUrl.startsWith('https://')
);

// Fallback dummy credentials during build time so static generation does not crash
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  note?: string | null;
  created_at?: string;
}
