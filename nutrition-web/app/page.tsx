"use client";

import { useState } from "react";

export default function HomePage() {
  const [form, setForm] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activity: "low",
    goal: "lose_fat",
  });

  const [status, setStatus] = useState<null | string>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      console.log("sending body:", form); // <-- лог в консоль

      const res = await fetch("/api/save-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("save-profile response:", res.status, data);

      if (!res.ok) {
        setStatus(data?.message || "Ошибка");
        return;
      }

      setStatus("saved");
    } catch (err) {
      console.error("fetch error:", err);
      setStatus("network_error");
    }
  }

  return (
    <main className="w-full max-w-lg mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Анкета питания</h1>
          <p className="text-gray-600 text-sm">Заполните данные для расчета вашей нормы калорий</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Возраст
          </label>
          <input
            type="number"
            value={form.age}
            onChange={(e) =>
              setForm({ ...form, age: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            placeholder="Введите возраст"
            min="1"
            max="120"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Пол
          </label>
          <select
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-900 appearance-none cursor-pointer"
          >
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Рост (см)
          </label>
          <input
            type="number"
            value={form.height}
            onChange={(e) =>
              setForm({ ...form, height: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            placeholder="Введите рост"
            min="50"
            max="250"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Вес (кг)
          </label>
          <input
            type="number"
            value={form.weight}
            onChange={(e) =>
              setForm({ ...form, weight: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            placeholder="Введите вес"
            min="20"
            max="300"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Уровень активности
          </label>
          <select
            value={form.activity}
            onChange={(e) =>
              setForm({ ...form, activity: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-900 appearance-none cursor-pointer"
          >
            <option value="low">Низкая (сидячий образ жизни)</option>
            <option value="medium">Средняя (легкие тренировки 1-3 раза в неделю)</option>
            <option value="high">Высокая (интенсивные тренировки 4+ раз в неделю)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Цель
          </label>
          <select
            value={form.goal}
            onChange={(e) =>
              setForm({ ...form, goal: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 text-gray-900 appearance-none cursor-pointer"
          >
            <option value="lose_fat">Похудеть</option>
            <option value="maintain">Поддержать вес</option>
            <option value="gain_muscle">Набрать мышечную массу</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Сохранение...
            </span>
          ) : (
            "Сохранить анкету"
          )}
        </button>

        {status === "saved" && (
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-center text-green-700 font-semibold flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Анкета сохранена 🎉
            </p>
          </div>
        )}
        {status &&
          status !== "loading" &&
          status !== "saved" && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-center text-red-700 font-semibold">{status}</p>
            </div>
          )}
      </form>
      </div>
    </main>
  );
}
