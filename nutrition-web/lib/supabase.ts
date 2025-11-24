import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
    },
  }
);

// Проверка переменных окружения при использовании (не при импорте)
export function validateSupabaseEnv() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не заданы в переменных окружения"
    );
  }
}

