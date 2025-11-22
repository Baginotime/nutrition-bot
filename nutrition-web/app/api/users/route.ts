// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { age, gender, height, weight, activityLevel } = body;

    // 1. создаём тестового пользователя из веб-версии
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        telegram_id: 'web-' + Date.now().toString(),
        username: 'web_user',
        first_name: 'Web Test',
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('Supabase users error /api/users:', userError);
      return NextResponse.json(
        { ok: false, error: userError?.message ?? 'Failed to create user' },
        { status: 500 },
      );
    }

    // 2. пишем профиль для этого пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        age,
        gender,
        height,
        weight,
        activity_level: activityLevel,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Supabase profiles error /api/users:', profileError);
      return NextResponse.json(
        { ok: false, error: profileError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: true, user, profile },
      { status: 200 },
    );
  } catch (e: any) {
    console.error('Unhandled error /api/users:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unknown server error' },
      { status: 500 },
    );
  }
}
