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
      telegram_user_id,
      telegram_user,
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

    let userId: string | null = null;

    // Если есть Telegram user ID, находим или создаём пользователя
    if (telegram_user_id) {
      // Ищем существующего пользователя по telegram_id
      const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_id", telegram_user_id.toString())
        .single();

      if (findError && findError.code !== "PGRST116") { // PGRST116 = not found
        console.error("Error finding user:", findError);
      }

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Создаём нового пользователя
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({
            telegram_id: telegram_user_id.toString(),
            username: telegram_user?.username || null,
            first_name: telegram_user?.first_name || null,
            last_name: telegram_user?.last_name || null,
          })
          .select("id")
          .single();

        if (userError) {
          console.error("Error creating user:", userError);
          return NextResponse.json(
            { 
              message: "Ошибка при создании пользователя",
              error: userError.message,
            },
            { status: 500 }
          );
        }

        userId = newUser.id;
      }
    }

    // Если нет user_id, создаём профиль без привязки к пользователю (для тестирования)
    const profileData: any = {
      age: ageNum,
      gender,
      height: heightNum,
      weight: weightNum,
      activity_level: activity,
      goal,
    };

    if (userId) {
      profileData.user_id = userId;
    }

    // Проверяем, есть ли уже профиль для этого пользователя
    if (userId) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      let result;
      if (existingProfile) {
        // Обновляем существующий профиль
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", userId)
          .select()
          .single();
      } else {
        // Создаём новый профиль
        result = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error("supabase insert/update error:", error);
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
    } else {
      // Fallback: создаём профиль без user_id (для тестирования)
      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
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
    }
  } catch (err) {
    console.error("save-profile route error", err);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
