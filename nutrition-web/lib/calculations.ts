// Расчет калорий и БЖУ

export interface NutritionData {
  calories: number;
  protein: number; // граммы
  carbs: number; // граммы
  fats: number; // граммы
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number; // см
  weight: number; // кг
  activity: 'low' | 'medium' | 'high';
  goal: 'lose_fat' | 'maintain' | 'gain_muscle';
}

// Коэффициенты активности
const ACTIVITY_MULTIPLIERS = {
  low: 1.2,      // Сидячий образ жизни
  medium: 1.55,  // Тренировки 1-3 раза в неделю
  high: 1.725,   // Тренировки 4+ раз в неделю
};

// Дефицит/профицит калорий для целей
const GOAL_ADJUSTMENTS = {
  lose_fat: -500,    // Дефицит 500 ккал для похудения
  maintain: 0,       // Поддержание веса
  gain_muscle: 300,  // Профицит 300 ккал для набора массы
};

/**
 * Расчет базового метаболизма по формуле Миффлина-Сан Жеора
 */
function calculateBMR(profile: UserProfile): number {
  const { age, gender, height, weight } = profile;
  
  // Формула Миффлина-Сан Жеора
  // Мужчины: BMR = 10 × вес(кг) + 6.25 × рост(см) - 5 × возраст(лет) + 5
  // Женщины: BMR = 10 × вес(кг) + 6.25 × рост(см) - 5 × возраст(лет) - 161
  
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
}

/**
 * Расчет общего расхода калорий (TDEE)
 */
function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activity];
  return Math.round(bmr * activityMultiplier);
}

/**
 * Расчет целевых калорий с учетом цели
 */
function calculateTargetCalories(profile: UserProfile): number {
  const tdee = calculateTDEE(profile);
  const adjustment = GOAL_ADJUSTMENTS[profile.goal];
  return Math.max(1200, Math.round(tdee + adjustment)); // Минимум 1200 ккал
}

/**
 * Расчет БЖУ (белки, жиры, углеводы)
 */
function calculateMacros(calories: number, goal: UserProfile['goal']): NutritionData {
  let proteinPercent: number;
  let fatPercent: number;
  let carbPercent: number;

  // Распределение БЖУ в зависимости от цели
  switch (goal) {
    case 'lose_fat':
      // При похудении больше белка, меньше углеводов
      proteinPercent = 0.35; // 35% белка
      fatPercent = 0.25;     // 25% жиров
      carbPercent = 0.40;    // 40% углеводов
      break;
    case 'gain_muscle':
      // При наборе массы больше белка и углеводов
      proteinPercent = 0.30; // 30% белка
      fatPercent = 0.20;     // 20% жиров
      carbPercent = 0.50;    // 50% углеводов
      break;
    case 'maintain':
    default:
      // Сбалансированное питание
      proteinPercent = 0.30; // 30% белка
      fatPercent = 0.25;     // 25% жиров
      carbPercent = 0.45;    // 45% углеводов
      break;
  }

  // Калорийность: белки и углеводы - 4 ккал/г, жиры - 9 ккал/г
  const proteinGrams = Math.round((calories * proteinPercent) / 4);
  const fatGrams = Math.round((calories * fatPercent) / 9);
  const carbGrams = Math.round((calories * carbPercent) / 4);

  return {
    calories,
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
  };
}

/**
 * Основная функция расчета питания
 */
export function calculateNutrition(profile: UserProfile): NutritionData {
  const targetCalories = calculateTargetCalories(profile);
  return calculateMacros(targetCalories, profile.goal);
}

/**
 * Форматирование результатов для отображения
 */
export function formatNutritionResults(data: NutritionData): string {
  return `📊 Ваша норма на день:

🔥 Калории: ${data.calories} ккал

🥩 Белки: ${data.protein} г
🍞 Углеводы: ${data.carbs} г
🥑 Жиры: ${data.fats} г`;
}

