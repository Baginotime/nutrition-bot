'use client';

import { useState } from 'react';

type ActivityLevel = 'low' | 'medium' | 'high';
type Goal = 'lose_fat' | 'maintain' | 'gain_muscle';

interface ProfileForm {
  age: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  activity: ActivityLevel;
  goal: Goal;
}

export default function HomePage() {
  const [form, setForm] = useState<ProfileForm>({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activity: 'medium',
    goal: 'lose_fat',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: Number(form.age),
          gender: form.gender,
          height: Number(form.height),
          weight: Number(form.weight),
          activity: form.activity,
          goal: form.goal,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Server error');
      }

      setSuccess('Анкета сохранена, можно закрывать окно ✅');
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить анкету');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">
          Анкета питания
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Ответы нужны боту, чтобы посчитать твою норму калорий и КБЖУ.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Возраст и пол */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Возраст
              </label>
              <input
                type="number"
                min={10}
                max={90}
                value={form.age}
                onChange={(e) =>
                  handleChange('age', e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Пол
              </label>
              <select
                value={form.gender}
                onChange={(e) =>
                  handleChange('gender', e.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>

          {/* Рост и вес */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Рост, см
              </label>
              <input
                type="number"
                min={120}
                max={230}
                value={form.height}
                onChange={(e) =>
                  handleChange('height', e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Вес, кг
              </label>
              <input
                type="number"
                min={35}
                max={200}
                step="0.1"
                value={form.weight}
                onChange={(e) =>
                  handleChange('weight', e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Активность */}
          <div>
            <label className="block text-sm mb-2">
              Уровень активности
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <button
                type="button"
                onClick={() =>
                  handleChange('activity', 'low')
                }
                className={`rounded-lg border px-3 py-2 text-left ${
                  form.activity === 'low'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                Малая
                <span className="block text-xs text-slate-400">
                  0–1 тренировка в неделю
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange('activity', 'medium')
                }
                className={`rounded-lg border px-3 py-2 text-left ${
                  form.activity === 'medium'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                Средняя
                <span className="block text-xs text-slate-400">
                  2–4 тренировки
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange('activity', 'high')
                }
                className={`rounded-lg border px-3 py-2 text-left ${
                  form.activity === 'high'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                Высокая
                <span className="block text-xs text-slate-400">
                  5+ тренировок
                </span>
              </button>
            </div>
          </div>

          {/* Цель */}
          <div>
            <label className="block text-sm mb-2">
              Цель
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <button
                type="button"
                onClick={() =>
                  handleChange('goal', 'lose_fat')
                }
                className={`rounded-lg border px-3 py-2 text-left ${
                  form.goal === 'lose_fat'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                Снижение жира
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange('goal', 'maintain')
                }
                className={`rounded-lg border px-3 py-2 text-left ${
                  form.goal === 'maintain'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                Поддержание
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange('goal', 'gain_muscle')
                }
                className={`rounded-lg border px-3 py-2 text-left ${
                  form.goal === 'gain_muscle'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                Набор мышц
              </button>
            </div>
          </div>

          {/* Сообщения */}
          {success && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Кнопка */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Сохраняю…' : 'Сохранить анкету'}
          </button>
        </form>
      </div>
    </main>
  );
}
