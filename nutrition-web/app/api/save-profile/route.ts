// nutrition-web/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegram_id');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegram_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) {
      console.error('Supabase error in users GET:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data }, { status: 200 });
  } catch (e: any) {
    console.error('users route error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
