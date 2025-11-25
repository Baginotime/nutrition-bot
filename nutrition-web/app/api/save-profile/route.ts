import { NextResponse } from "next/server";
import { supabase, validateSupabaseEnv } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.log("=== Save Profile API Called ===");
    console.log("Timestamp:", new Date().toISOString());
    
    try {
      validateSupabaseEnv();
      console.log("✅ Supabase environment variables validated");
    } catch (envError: any) {
      console.error("❌ Supabase env validation failed:", envError.message);
      return NextResponse.json(
        { 
          message: "Ошибка конфигурации сервера",
          error: envError.message 
        },
        { status: 500 }
      );
    }
    
    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

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

    // Если есть Telegram user ID, ищем пользователя (он должен быть создан при /start)
    if (telegram_user_id) {
      console.log(`Looking for user with telegram_id: ${telegram_user_id}`);
      // Ищем существующего пользователя по telegram_id
      const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_id", telegram_user_id.toString())
        .maybeSingle();

      if (findError) {
        console.error("❌ Error finding user:", findError);
        console.error("Error code:", findError.code);
        console.error("Error message:", findError.message);
        // Продолжаем без user_id, если не нашли
        userId = null;
      } else if (existingUser) {
        userId = existingUser.id;
        console.log(`✅ Found user with id: ${userId}`);
      } else {
        console.log("⚠️ User not found (should be created on /start), continuing without user_id");
        userId = null;
      }
    } else {
      console.log("⚠️ No telegram_user_id provided, creating profile without user");
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

    // Сохраняем профиль (с user_id или без)
    console.log("Attempting to save profile with data:", JSON.stringify(profileData, null, 2));
    
    if (userId) {
      // Проверяем, есть ли уже профиль для этого пользователя
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle(); // используем maybeSingle вместо single, чтобы не было ошибки если нет записи

      if (checkError && checkError.code !== "PGRST116") {
        console.error("⚠️ Error checking existing profile:", checkError);
      }

      let result;
      if (existingProfile) {
        console.log("Updating existing profile...");
        // Обновляем существующий профиль
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", userId)
          .select()
          .single();
      } else {
        console.log("Creating new profile...");
        // Создаём новый профиль
        result = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error("❌ Supabase insert/update error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", JSON.stringify(error, null, 2));
        console.error("Profile data attempted:", JSON.stringify(profileData, null, 2));
        
        // Если ошибка из-за user_id, пробуем без него
        if (error.message.includes("user_id") || error.code === "23503") {
          console.log("⚠️ Error might be due to user_id constraint, trying without user_id...");
          delete profileData.user_id;
          const fallbackResult = await supabase
            .from("profiles")
            .insert(profileData)
            .select()
            .single();
          
          if (fallbackResult.error) {
            return NextResponse.json(
              { 
                message: "Ошибка при сохранении анкеты",
                error: fallbackResult.error.message,
                details: fallbackResult.error.details || fallbackResult.error.hint || null,
                code: fallbackResult.error.code,
              },
              { status: 500 }
            );
          }
          
          console.log("✅ Profile saved without user_id:", JSON.stringify(fallbackResult.data, null, 2));
          return NextResponse.json({ success: true, profile: fallbackResult.data });
        }
        
        return NextResponse.json(
          { 
            message: "Ошибка при сохранении анкеты",
            error: error.message,
            details: error.details || error.hint || null,
            code: error.code,
          },
          { status: 500 }
        );
      }

      console.log("✅ Profile saved successfully:", JSON.stringify(data, null, 2));
      return NextResponse.json({ success: true, profile: data });
    } else {
      // Создаём профиль без user_id
      console.log("Creating profile without user_id...");
      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase insert error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", JSON.stringify(error, null, 2));
        console.error("Profile data attempted:", JSON.stringify(profileData, null, 2));
        return NextResponse.json(
          { 
            message: "Ошибка при сохранении анкеты",
            error: error.message,
            details: error.details || error.hint || null,
            code: error.code,
          },
          { status: 500 }
        );
      }

      console.log("✅ Profile saved successfully (without user_id):", JSON.stringify(data, null, 2));
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
