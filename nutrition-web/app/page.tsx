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

type FormData = {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activity: string;
  goal: string;
};

// Порядок: приветствие -> пол -> возраст -> рост -> вес -> активность -> цель
const STEPS = [
  { id: 0, title: "Приветствие", emoji: "👋", field: null as any, isWelcome: true },
  { id: 1, title: "Пол", emoji: "👤", field: "gender" as keyof FormData },
  { id: 2, title: "Возраст", emoji: "🎂", field: "age" as keyof FormData },
  { id: 3, title: "Рост", emoji: "📏", field: "height" as keyof FormData },
  { id: 4, title: "Вес", emoji: "⚖️", field: "weight" as keyof FormData },
  { id: 5, title: "Активность", emoji: "🏃", field: "activity" as keyof FormData },
  { id: 6, title: "Цель", emoji: "🎯", field: "goal" as keyof FormData },
];

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activity: "low",
    goal: "lose_fat",
  });
  const [status, setStatus] = useState<null | string>(null);

  useEffect(() => {
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

  const handleNext = () => {
    const step = STEPS[currentStep];
    
    // Для приветственного экрана просто переходим дальше
    if (step.isWelcome) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    // Для остальных шагов проверяем заполненность
    if (step.field) {
      const fieldValue = form[step.field as keyof FormData];
      if (fieldValue && fieldValue !== "") {
        if (currentStep < STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          handleSubmit();
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setStatus("loading");
    try {
      console.log("Submitting form:", form);
      
      const res = await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Response:", res.status, data);
      
      if (!res.ok) {
        console.error("Error response:", data);
        setStatus(data?.message || data?.error || "Ошибка при сохранении");
        return;
      }
      
      setStatus("saved");
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("Ошибка сети. Проверь подключение к интернету.");
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    
    // Приветственный экран
    if (step.isWelcome) {
      return (
        <div style={fieldContainerStyle}>
          <div style={emojiStyle}>👋</div>
          <h2 style={stepTitleStyle}>Привет!</h2>
          <p style={stepDescriptionStyle}>
            Давай определим твою норму калорий на сутки
          </p>
          <p style={welcomeTextStyle}>
            Ответь на несколько простых вопросов, и мы рассчитаем персональную норму калорий и макронутриентов специально для тебя.
          </p>
        </div>
      );
    }
    
    switch (step.field) {
      case "gender":
        return (
          <div style={fieldContainerStyle}>
            <div style={emojiStyle}>{step.emoji}</div>
            <h2 style={stepTitleStyle}>{step.title}</h2>
            <p style={stepDescriptionStyle}>Выбери свой пол</p>
            <div style={buttonGroupStyle}>
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: "male" })}
                style={{
                  ...genderButtonStyle,
                  backgroundColor: form.gender === "male" ? "#3b82f6" : "#f3f4f6",
                  color: form.gender === "male" ? "#ffffff" : "#374151",
                }}
              >
                👨 Мужской
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: "female" })}
                style={{
                  ...genderButtonStyle,
                  backgroundColor: form.gender === "female" ? "#ec4899" : "#f3f4f6",
                  color: form.gender === "female" ? "#ffffff" : "#374151",
                }}
              >
                👩 Женский
              </button>
            </div>
          </div>
        );

      case "age":
        return (
          <div style={fieldContainerStyle}>
            <div style={emojiStyle}>{step.emoji}</div>
            <h2 style={stepTitleStyle}>{step.title}</h2>
            <p style={stepDescriptionStyle}>Сколько тебе лет?</p>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              style={inputStyle}
              placeholder="Введите возраст"
              min="1"
              max="120"
              autoFocus
            />
          </div>
        );

      case "height":
        return (
          <div style={fieldContainerStyle}>
            <div style={emojiStyle}>{step.emoji}</div>
            <h2 style={stepTitleStyle}>{step.title}</h2>
            <p style={stepDescriptionStyle}>Какой у тебя рост в сантиметрах?</p>
            <input
              type="number"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              style={inputStyle}
              placeholder="Например: 175"
              min="50"
              max="250"
              autoFocus
            />
          </div>
        );

      case "weight":
        return (
          <div style={fieldContainerStyle}>
            <div style={emojiStyle}>{step.emoji}</div>
            <h2 style={stepTitleStyle}>{step.title}</h2>
            <p style={stepDescriptionStyle}>Какой у тебя вес в килограммах?</p>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              style={inputStyle}
              placeholder="Например: 70"
              min="20"
              max="300"
              step="0.1"
              autoFocus
            />
          </div>
        );

      case "activity":
        return (
          <div style={fieldContainerStyle}>
            <div style={emojiStyle}>{step.emoji}</div>
            <h2 style={stepTitleStyle}>{step.title}</h2>
            <p style={stepDescriptionStyle}>Как часто ты тренируешься?</p>
            <div style={optionsContainerStyle}>
              {[
                { value: "low", label: "Низкая", desc: "Сидячий образ жизни", emoji: "🛋️" },
                { value: "medium", label: "Средняя", desc: "Тренировки 1-3 раза в неделю", emoji: "🚶" },
                { value: "high", label: "Высокая", desc: "Тренировки 4+ раз в неделю", emoji: "🏋️" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, activity: option.value })}
                  style={{
                    ...optionButtonStyle,
                    borderColor: form.activity === option.value ? "#3b82f6" : "#e5e7eb",
                    backgroundColor: form.activity === option.value ? "#eff6ff" : "#ffffff",
                  }}
                >
                  <span style={optionEmojiStyle}>{option.emoji}</span>
                  <div style={optionTextStyle}>
                    <div style={optionLabelStyle}>{option.label}</div>
                    <div style={optionDescStyle}>{option.desc}</div>
                  </div>
                  {form.activity === option.value && (
                    <span style={checkStyle}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case "goal":
        return (
          <div style={fieldContainerStyle}>
            <div style={emojiStyle}>{step.emoji}</div>
            <h2 style={stepTitleStyle}>{step.title}</h2>
            <p style={stepDescriptionStyle}>Какую цель ты преследуешь?</p>
            <div style={optionsContainerStyle}>
              {[
                { value: "lose_fat", label: "Похудеть", desc: "Сбросить лишний вес", emoji: "🔥" },
                { value: "maintain", label: "Поддержать", desc: "Сохранить текущий вес", emoji: "⚖️" },
                { value: "gain_muscle", label: "Набрать массу", desc: "Увеличить мышечную массу", emoji: "💪" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, goal: option.value })}
                  style={{
                    ...optionButtonStyle,
                    borderColor: form.goal === option.value ? "#3b82f6" : "#e5e7eb",
                    backgroundColor: form.goal === option.value ? "#eff6ff" : "#ffffff",
                  }}
                >
                  <span style={optionEmojiStyle}>{option.emoji}</span>
                  <div style={optionTextStyle}>
                    <div style={optionLabelStyle}>{option.label}</div>
                    <div style={optionDescStyle}>{option.desc}</div>
                  </div>
                  {form.goal === option.value && (
                    <span style={checkStyle}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (status === "saved") {
    return (
      <main style={mainStyle}>
        <div style={cardStyle}>
          <div style={successContainerStyle}>
            <div style={successEmojiStyle}>🎉</div>
            <h1 style={successTitleStyle}>Анкета сохранена!</h1>
            <p style={successTextStyle}>Твои данные успешно сохранены. Скоро мы рассчитаем твою норму калорий.</p>
            {window.Telegram?.WebApp && (
              <button
                onClick={() => window.Telegram?.WebApp?.close()}
                style={closeButtonStyle}
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const step = STEPS[currentStep];
  const isWelcomeStep = step.isWelcome;
  const canProceed = isWelcomeStep || (step.field && form[step.field as keyof FormData] && form[step.field as keyof FormData] !== "");

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        {/* Progress bar - скрываем на приветственном экране */}
        {!isWelcomeStep && (
          <div style={progressContainerStyle}>
            <div style={progressBarStyle}>
              <div
                style={{
                  ...progressFillStyle,
                  width: `${((currentStep) / (STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>
            <div style={progressTextStyle}>
              {currentStep} из {STEPS.length - 1}
            </div>
          </div>
        )}

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation buttons */}
        <div style={navButtonsStyle}>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              style={backButtonStyle}
            >
              ← Назад
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              ...nextButtonStyle,
              opacity: !canProceed ? 0.5 : 1,
              cursor: !canProceed ? "not-allowed" : "pointer",
            }}
          >
            {currentStep === STEPS.length - 1 ? "Сохранить ✅" : "Далее →"}
          </button>
        </div>

        {status && status !== "loading" && status !== "saved" && (
          <div style={errorStyle}>
            <span style={{ marginRight: "8px" }}>❌</span>
            {status}
          </div>
        )}
      </div>
    </main>
  );
}

// Styles
const mainStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px 16px",
  minHeight: "100vh",
  boxSizing: "border-box",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  padding: "32px 24px",
  minHeight: "500px",
  display: "flex",
  flexDirection: "column",
};

const progressContainerStyle: React.CSSProperties = {
  marginBottom: "32px",
};

const progressBarStyle: React.CSSProperties = {
  width: "100%",
  height: "8px",
  backgroundColor: "#e5e7eb",
  borderRadius: "4px",
  overflow: "hidden",
  marginBottom: "8px",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
  borderRadius: "4px",
  transition: "width 0.3s ease",
};

const progressTextStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: "500",
};

const fieldContainerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emojiStyle: React.CSSProperties = {
  fontSize: "64px",
  marginBottom: "16px",
  lineHeight: "1",
};

const stepTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "8px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const stepDescriptionStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#6b7280",
  marginBottom: "32px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const welcomeTextStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#4b5563",
  lineHeight: "1.6",
  maxWidth: "400px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  border: "2px solid #e5e7eb",
  borderRadius: "16px",
  backgroundColor: "#f9fafb",
  color: "#111827",
  fontSize: "18px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  textAlign: "center",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  width: "100%",
};

const genderButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "20px",
  border: "none",
  borderRadius: "16px",
  fontSize: "18px",
  fontWeight: "600",
  fontFamily: "system-ui, -apple-system, sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const optionsContainerStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const optionButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "20px",
  border: "2px solid",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "left",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const optionEmojiStyle: React.CSSProperties = {
  fontSize: "32px",
  lineHeight: "1",
};

const optionTextStyle: React.CSSProperties = {
  flex: 1,
};

const optionLabelStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "4px",
};

const optionDescStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
};

const checkStyle: React.CSSProperties = {
  fontSize: "24px",
  color: "#3b82f6",
  fontWeight: "bold",
};

const navButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "32px",
};

const backButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "16px",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  fontFamily: "system-ui, -apple-system, sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const nextButtonStyle: React.CSSProperties = {
  flex: 2,
  padding: "16px",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  fontFamily: "system-ui, -apple-system, sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
};

const successContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  flex: 1,
};

const successEmojiStyle: React.CSSProperties = {
  fontSize: "80px",
  marginBottom: "24px",
};

const successTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "12px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const successTextStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#6b7280",
  marginBottom: "32px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const closeButtonStyle: React.CSSProperties = {
  padding: "16px 32px",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  fontFamily: "system-ui, -apple-system, sans-serif",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  backgroundColor: "#fef2f2",
  border: "1.5px solid #fca5a5",
  borderRadius: "12px",
  color: "#991b1b",
  fontWeight: "600",
  fontSize: "15px",
  textAlign: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
};
