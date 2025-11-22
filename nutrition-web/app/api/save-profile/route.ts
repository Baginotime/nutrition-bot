// app/api/save-profile/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      telegram_id,
      username,
      first_name,
      age,
      gender,
      height,
      weight,
      activity_level,
      calories,
      protein,
      fat,
      carbs,
    } = body;

    // минимальная проверка
    if (!telegram_id) {
      return NextResponse.json(
        { ok: false, error: 'telegram_id is required' },
        { status: 400 }
      );
    }

    // 1) создаём/обновляем пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id,
          username,
          first_name,
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single();

    if (userError || !user) {
      console.error('user upsert error:', userError);
      return NextResponse.json(
        { ok: false, error: userError?.message ?? 'user upsert failed' },
        { status: 500 }
      );
    }

    // 2) профиль
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        age,
        gender,
        height,
        weight,
        activity_level,
      },
      { onConflict: 'user_id' }
    );

    if (profileError) {
      console.error('profile upsert error:', profileError);
      return NextResponse.json(
        { ok: false, error: profileError.message },
        { status: 500 }
      );
    }

    // 3) стата по норме
    const { error: scoreError } = await supabase.from('user_score').upsert(
      {
        user_id: user.id,
        score: Math.round(calories ?? 0),
        streak_days: 0,
        level: 1,
      },
      { onConflict: 'user_id' }
    );

    if (scoreError) {
      console.error('score upsert error:', scoreError);
      return NextResponse.json(
        { ok: false, error: scoreError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('save-profile route error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'unknown error' },
      { status: 500 }
    );
  }
}
