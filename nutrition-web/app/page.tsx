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
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
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
  const [nutritionData, setNutritionData] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);

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
            window.Telegram.WebApp.setBackgroundColor("#f2f2f7");
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
      // Получаем Telegram user ID
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      console.log("Submitting form:", form);
      console.log("Telegram user:", telegramUser);
      
      const payload = {
        ...form,
        telegram_user_id: telegramUserId,
        telegram_user: telegramUser ? {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
        } : null,
      };
      
      const res = await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", res.status, data);
      
      if (!res.ok) {
        console.error("Error response:", data);
        setStatus(data?.message || data?.error || "Ошибка при сохранении");
        return;
      }
      
      // Сохраняем данные о питании
      if (data.nutrition) {
        setNutritionData(data.nutrition);
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
                  backgroundColor: form.gender === "male" ? "#007AFF" : "#f2f2f7",
                  color: form.gender === "male" ? "#ffffff" : "#000000",
                }}
              >
                👨 Мужской
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: "female" })}
                style={{
                  ...genderButtonStyle,
                  backgroundColor: form.gender === "female" ? "#FF2D55" : "#f2f2f7",
                  color: form.gender === "female" ? "#ffffff" : "#000000",
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
              onFocus={(e) => {
                e.target.style.backgroundColor = "#e5e5ea";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "#f2f2f7";
              }}
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
              onFocus={(e) => {
                e.target.style.backgroundColor = "#e5e5ea";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "#f2f2f7";
              }}
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
              onFocus={(e) => {
                e.target.style.backgroundColor = "#e5e5ea";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "#f2f2f7";
              }}
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
                    backgroundColor: form.activity === option.value ? "#e3f2fd" : "#f2f2f7",
                    border: form.activity === option.value ? "1.5px solid #007AFF" : "1.5px solid transparent",
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
                    backgroundColor: form.goal === option.value ? "#e3f2fd" : "#f2f2f7",
                    border: form.goal === option.value ? "1.5px solid #007AFF" : "1.5px solid transparent",
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

// Styles - iOS Design
const mainStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  margin: "0 auto",
  padding: "0",
  minHeight: "100vh",
  boxSizing: "border-box",
  background: "#f2f2f7", // iOS light gray background
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0",
  boxShadow: "none",
  padding: "20px 16px",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const progressContainerStyle: React.CSSProperties = {
  marginBottom: "32px",
};

const progressBarStyle: React.CSSProperties = {
  width: "100%",
  height: "4px",
  backgroundColor: "#e5e5ea",
  borderRadius: "2px",
  overflow: "hidden",
  marginBottom: "12px",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#007AFF", // iOS blue
  borderRadius: "2px",
  transition: "width 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
};

const progressTextStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "13px",
  color: "#8e8e93",
  fontWeight: "400",
  letterSpacing: "-0.08px",
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
  fontSize: "34px",
  fontWeight: "700",
  color: "#000000",
  marginBottom: "8px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.5px",
  lineHeight: "1.1",
};

const stepDescriptionStyle: React.CSSProperties = {
  fontSize: "17px",
  color: "#8e8e93",
  marginBottom: "40px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  fontWeight: "400",
  letterSpacing: "-0.24px",
};

const welcomeTextStyle: React.CSSProperties = {
  fontSize: "17px",
  color: "#000000",
  lineHeight: "1.47",
  maxWidth: "400px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  fontWeight: "400",
  letterSpacing: "-0.24px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#f2f2f7",
  color: "#000000",
  fontSize: "17px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  textAlign: "center",
  transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
  boxSizing: "border-box",
  outline: "none",
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  width: "100%",
};

const genderButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "16px 20px",
  border: "none",
  borderRadius: "12px",
  fontSize: "17px",
  fontWeight: "600",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
  boxShadow: "none",
  letterSpacing: "-0.24px",
};

const optionsContainerStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const optionButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
  textAlign: "left",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  boxShadow: "none",
};

const optionEmojiStyle: React.CSSProperties = {
  fontSize: "32px",
  lineHeight: "1",
};

const optionTextStyle: React.CSSProperties = {
  flex: 1,
};

const optionLabelStyle: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: "600",
  color: "#000000",
  marginBottom: "2px",
  letterSpacing: "-0.24px",
};

const optionDescStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#8e8e93",
  fontWeight: "400",
  letterSpacing: "-0.08px",
};

const checkStyle: React.CSSProperties = {
  fontSize: "20px",
  color: "#007AFF",
  fontWeight: "600",
};

const navButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "32px",
};

const backButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 20px",
  backgroundColor: "#f2f2f7",
  color: "#007AFF",
  border: "none",
  borderRadius: "12px",
  fontSize: "17px",
  fontWeight: "600",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
  letterSpacing: "-0.24px",
};

const nextButtonStyle: React.CSSProperties = {
  flex: 2,
  padding: "14px 20px",
  backgroundColor: "#007AFF",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  fontSize: "17px",
  fontWeight: "600",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
  boxShadow: "none",
  letterSpacing: "-0.24px",
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
  fontSize: "34px",
  fontWeight: "700",
  color: "#000000",
  marginBottom: "12px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.5px",
  lineHeight: "1.1",
};

const successTextStyle: React.CSSProperties = {
  fontSize: "17px",
  color: "#8e8e93",
  marginBottom: "32px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  fontWeight: "400",
  letterSpacing: "-0.24px",
  lineHeight: "1.47",
};

const closeButtonStyle: React.CSSProperties = {
  padding: "14px 32px",
  backgroundColor: "#007AFF",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  fontSize: "17px",
  fontWeight: "600",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  cursor: "pointer",
  letterSpacing: "-0.24px",
  transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
};

const errorStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "14px 16px",
  backgroundColor: "#ffebee",
  border: "none",
  borderRadius: "12px",
  color: "#c62828",
  fontWeight: "500",
  fontSize: "15px",
  textAlign: "center",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  letterSpacing: "-0.08px",
};

const nutritionContainerStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "24px",
  marginBottom: "24px",
};

const nutritionTitleStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#000000",
  marginBottom: "16px",
  textAlign: "center",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.3px",
};

const nutritionCardStyle: React.CSSProperties = {
  backgroundColor: "#f2f2f7",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "16px",
  textAlign: "center",
};

const nutritionItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

const nutritionEmojiStyle: React.CSSProperties = {
  fontSize: "32px",
  marginBottom: "4px",
};

const nutritionValueStyle: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#007AFF",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.5px",
};

const nutritionLabelStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#8e8e93",
  fontWeight: "400",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  letterSpacing: "-0.08px",
};

const macrosContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  gap: "12px",
  width: "100%",
};

const macroItemStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#f2f2f7",
  borderRadius: "12px",
  padding: "16px 8px",
};

const macroEmojiStyle: React.CSSProperties = {
  fontSize: "24px",
};

const macroValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#000000",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.24px",
};

const macroLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#8e8e93",
  fontWeight: "400",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  letterSpacing: "-0.08px",
};

const nutritionContainerStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "24px",
  marginBottom: "24px",
};

const nutritionTitleStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#000000",
  marginBottom: "16px",
  textAlign: "center",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.3px",
};

const nutritionCardStyle: React.CSSProperties = {
  backgroundColor: "#f2f2f7",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "16px",
  textAlign: "center",
};

const nutritionItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

const nutritionEmojiStyle: React.CSSProperties = {
  fontSize: "32px",
  marginBottom: "4px",
};

const nutritionValueStyle: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#007AFF",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.5px",
};

const nutritionLabelStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#8e8e93",
  fontWeight: "400",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  letterSpacing: "-0.08px",
};

const macrosContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  gap: "12px",
  width: "100%",
};

const macroItemStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#f2f2f7",
  borderRadius: "12px",
  padding: "16px 8px",
};

const macroEmojiStyle: React.CSSProperties = {
  fontSize: "24px",
};

const macroValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#000000",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  letterSpacing: "-0.24px",
};

const macroLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#8e8e93",
  fontWeight: "400",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  letterSpacing: "-0.08px",
};
