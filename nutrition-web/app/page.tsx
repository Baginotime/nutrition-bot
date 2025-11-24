"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export default function HomePage() {
  useEffect(() => {
    // Инициализация Telegram Web App
    if (typeof window !== "undefined") {
      const initTelegram = () => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          if (window.Telegram.WebApp.setHeaderColor) {
            window.Telegram.WebApp.setHeaderColor("#ffffff");
          }
          if (window.Telegram.WebApp.setBackgroundColor) {
            window.Telegram.WebApp.setBackgroundColor("#f0f9ff");
          }
        }
      };
      
      if (window.Telegram?.WebApp) {
        initTelegram();
      } else {
        const checkInterval = setInterval(() => {
          if (window.Telegram?.WebApp) {
            initTelegram();
            clearInterval(checkInterval);
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    }
  }, []);

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
      const res = await fetch("/api/save-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const fieldContainerStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  return (
    <main style={{
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
      padding: '20px 16px',
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '32px 24px',
        border: 'none',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.2',
          }}>
            Анкета питания
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '15px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5',
          }}>
            Заполните данные для расчета вашей нормы калорий
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Возраст</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              style={{
                ...inputStyle,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Введите возраст"
              min="1"
              max="120"
            />
          </div>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Пол</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: '40px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Рост (см)</label>
            <input
              type="number"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Введите рост"
              min="50"
              max="250"
            />
          </div>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Вес (кг)</label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Введите вес"
              min="20"
              max="300"
              step="0.1"
            />
          </div>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Уровень активности</label>
            <select
              value={form.activity}
              onChange={(e) => setForm({ ...form, activity: e.target.value })}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: '40px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="low">Низкая (сидячий образ жизни)</option>
              <option value="medium">Средняя (легкие тренировки 1-3 раза в неделю)</option>
              <option value="high">Высокая (интенсивные тренировки 4+ раз в неделю)</option>
            </select>
          </div>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Цель</label>
            <select
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: '40px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="lose_fat">Похудеть</option>
              <option value="maintain">Поддержать вес</option>
              <option value="gain_muscle">Набрать мышечную массу</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: status === "loading" ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              cursor: status === "loading" ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: status === "loading" ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              marginTop: '8px',
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (status !== "loading") {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {status === "loading" ? "Сохранение..." : "Сохранить анкету"}
          </button>

          {status === "saved" && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '12px',
            }}>
              <p style={{
                textAlign: 'center',
                color: '#166534',
                fontWeight: '600',
                fontSize: '15px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: 0,
              }}>
                ✅ Анкета сохранена
              </p>
            </div>
          )}
          {status && status !== "loading" && status !== "saved" && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fca5a5',
              borderRadius: '12px',
            }}>
              <p style={{
                textAlign: 'center',
                color: '#991b1b',
                fontWeight: '600',
                fontSize: '15px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: 0,
              }}>
                {status}
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
