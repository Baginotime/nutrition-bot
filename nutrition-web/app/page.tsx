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
    <main>
      <h1>Анкета питания</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Возраст
            <input
              type="number"
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value })
              }
            />
          </label>
        </div>

        {/* остальные поля можешь оставить как у тебя, главное — onSubmit */}

        <button type="submit">Сохранить анкету</button>

        {status === "loading" && <p>Сохраняю…</p>}
        {status === "saved" && <p>Анкета сохранена 🎉</p>}
        {status &&
          status !== "loading" &&
          status !== "saved" && <p>{status}</p>}
      </form>
    </main>
  );
}
