// nutrition-web/lib/supabase.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Отдельная функция, которую мы импортируем в page.tsx
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
