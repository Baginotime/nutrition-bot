"use client";

import React, { useState } from "react";

type Step = "intro" | "form" | "success";

type Gender = "male" | "female";
type ActivityLevel = "low" | "medium" | "high";
type Goal = "lose_fat" | "maintain" | "gain_muscle";

export default function Page() {
  const [step, setStep] = useState<Step>("intro");

  // поля анкеты
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("male");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [activity, setActivity] = useState<ActivityLevel>("low");
  const [goal, setGoal] = useState<Goal>("lose_fat");

  // служебное
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      const body = {
        age: age ? Number(age) : null,
        gender,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        activity, // low | medium | high
        goal,     // lose_fat | maintain | gain_muscle
      };

      const res = await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = "Не удалось сохранить анкету";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // забиваем
        }
        throw new Error(msg);
      }

      // все ок, показваем экран успеха
      setStep("success");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Что-то пошло не так. Попробуй еще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ЭКРАН 1 интро
  if (step === "intro") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f2ea]">
        <div className="max-w-2xl w-full mx-4 bg-white rounded-3xl shadow-xl px-8 py-14 text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-[#9ca3af] mb-4">
            ТВОЙ ДНЕВНИК ПИТАНИЯ
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-[#111827] mb-6">
            Считаем, сколько калорий нужно
            <br />
            в день
          </h1>

          <p className="text-base text-[#4b5563] mb-10">
            Просто ответь на пару вопросов, а дальше бот все посчитает сам.
          </p>

          <button
            onClick={() => setStep("form")}
            className="inline-flex items-center justify-center px-10 py-3.5
                       rounded-full bg-[#6bbf7a] text-white text-lg font-semibold
                       hover:bg-[#59aa68] transition-colors"
          >
            Начать
          </button>
        </div>
      </main>
    );
  }

  // ЭКРАН 2 анкета
  if (step === "form") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f2ea]">
        <div className="max-w-xl w-full mx-4 bg-white rounded-3xl shadow-xl px-6 py-8">
          <h2 className="text-2xl font-semibold text-[#111827] mb-6">
            Анкета питания
          </h2>
          <p className="text-sm text-[#4b5563] mb-6">
            Ответы нужны боту, чтобы посчитать твою норму калорий и КБЖУ.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* возраст */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Возраст
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbf7a]"
                placeholder="Например, 27"
                required
              />
            </div>

            {/* пол */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Пол
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbf7a]"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            {/* рост */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Рост, см
              </label>
              <input
                type="number"
                min={120}
                max={230}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbf7a]"
                placeholder="Например, 180"
                required
              />
            </div>

            {/* вес */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Вес, кг
              </label>
              <input
                type="number"
                min={30}
                max={300}
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbf7a]"
                placeholder="Например, 75"
                required
              />
            </div>

            {/* активность */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Уровень активности
              </label>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <label className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={activity === "low"}
                    onChange={() => setActivity("low")}
                  />
                  <span>
                    <span className="font-medium">Малая</span>
                    <span className="text-[#6b7280]"> 0–1 тренировка в неделю</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={activity === "medium"}
                    onChange={() => setActivity("medium")}
                  />
                  <span>
                    <span className="font-medium">Средняя</span>
                    <span className="text-[#6b7280]"> 2–4 тренировки</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={activity === "high"}
                    onChange={() => setActivity("high")}
                  />
                  <span>
                    <span className="font-medium">Высокая</span>
                    <span className="text-[#6b7280]"> 5+ тренировок</span>
                  </span>
                </label>
              </div>
            </div>

            {/* цель */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Цель
              </label>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <label className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={goal === "lose_fat"}
                    onChange={() => setGoal("lose_fat")}
                  />
                  <span className="font-medium">Снижение жира</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={goal === "maintain"}
                    onChange={() => setGoal("maintain")}
                  />
                  <span className="font-medium">Поддержание</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={goal === "gain_muscle"}
                    onChange={() => setGoal("gain_muscle")}
                  />
                  <span className="font-medium">Набор мышц</span>
                </label>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full px-6 py-3 rounded-full bg-[#6bbf7a] text-white
                         font-semibold text-base hover:bg-[#59aa68]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Сохраняем..." : "Сохранить анкету"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ЭКРАН 3 успех
  if (step === "success") {
    const tg =
      typeof window !== "undefined"
        ? (window as any).Telegram?.WebApp
        : null;

    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f2ea]">
        <div className="max-w-xl w-full mx-4 bg-white rounded-3xl shadow-xl px-8 py-10 text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-[#9ca3af] mb-3">
            Анкета сохранена
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-4">
            Готово, мы записали твои данные
          </h1>

          <p className="text-base text-[#4b5563] mb-8">
            Бот теперь знает твой возраст, вес, активность и цель. Можно закрывать окно и продолжать в Telegram.
          </p>

          <button
            onClick={() => {
              if (tg) {
                tg.close();
              } else {
                window.location.href = "/";
              }
            }}
            className="inline-flex items-center justify-center px-8 py-3
                       rounded-full bg-[#6bbf7a] text-white text-base font-semibold
                       hover:bg-[#59aa68] transition-colors"
          >
            Вернуться в бота
          </button>

          <button
            onClick={() => setStep("form")}
            className="mt-4 block mx-auto text-sm text-[#6b7280] hover:text-[#374151]"
          >
            Заполнить заново
          </button>
        </div>
      </main>
    );
  }

  return null;
}
