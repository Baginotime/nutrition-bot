// nutrition-web/lib/supabase.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Простые проверки, чтобы не ловить тихие баги
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set in environment variables');
}
if (!anonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables');
}

// Функция, если нужно где-то создавать свой клиент
export function createClient() {
  return createSupabaseClient(supabaseUrl, anonKey);
}

// Готовый общий клиент — им будем пользоваться в API-роутах
export const supabase = createSupabaseClient(supabaseUrl, anonKey);
