// bot/user.ts
import { Context } from 'telegraf';
import { supabaseServer } from '../nutrition-web/bot/supabaseServer';

export type DbUser = {
  id: number;
  telegram_id: string;
  username: string | null;
  first_name: string | null;
  created_at: string;
};

export async function getOrCreateUser(ctx: Context): Promise<DbUser> {
  const from = ctx.from;

  if (!from) {
    throw new Error('ctx.from is undefined');
  }

  const telegramId = String(from.id);
  const username = from.username || null;
  const firstName = from.first_name || null;

  // 1) ищем пользователя по telegram_id
  const { data: existing, error: selectError } = await supabaseServer
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle<DbUser>();

  if (selectError) {
    console.error('Supabase select users error:', selectError);
    throw selectError;
  }

  if (existing) {
    return existing;
  }

  // 2) создаём, если нет
  const { data: created, error: insertError } = await supabaseServer
    .from('users')
    .insert([
      {
        telegram_id: telegramId,
        username,
        first_name: firstName,
      },
    ])
    .select()
    .single<DbUser>();

  if (insertError) {
    console.error('Supabase insert users error:', insertError);
    throw insertError;
  }

  return created!;
}
