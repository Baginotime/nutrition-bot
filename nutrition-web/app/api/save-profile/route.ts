import { NextResponse } from "next/server";
import { supabase, validateSupabaseEnv } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    validateSupabaseEnv();
    const body = await req.json();
    console.log("Received request body:", body);

    const {
      age,
      gender,
      height,
      weight,
      activity, // low | medium | high
      goal,     // lose_fat | maintain | gain_muscle
    } = body || {};

    // простая валидация
    if (!age || !height || !weight || !gender || !activity || !goal) {
      console.error("Validation failed:", { age, height, weight, gender, activity, goal });
      return NextResponse.json(
        { message: "Заполни все поля: возраст, пол, рост, вес, активность и цель." },
        { status: 400 }
      );
    }

    // Преобразуем строки в числа
    const ageNum = parseInt(age, 10);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    const { data, error } = await supabase
      .from("profiles") // тут имя твоей таблицы
      .insert({
        age: ageNum,
        gender,
        height: heightNum,
        weight: weightNum,
        activity_level: activity,
        goal,
      })
      .select()
      .single();

    if (error) {
      console.error("supabase insert error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          message: "Ошибка при сохранении анкеты",
          error: error.message,
          details: error.details || error.hint || null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err) {
    console.error("save-profile route error", err);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
