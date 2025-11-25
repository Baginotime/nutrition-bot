# Обновление схемы базы данных для геймификации

## Новые поля в таблице `profiles`

Добавьте следующие поля в таблицу `profiles` в Supabase:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daily_calories INTEGER,
ADD COLUMN IF NOT EXISTS daily_protein INTEGER,
ADD COLUMN IF NOT EXISTS daily_carbs INTEGER,
ADD COLUMN IF NOT EXISTS daily_fats INTEGER;
```

Эти поля будут хранить рассчитанную норму калорий и БЖУ для пользователя.

## Таблица для отслеживания потребления (для геймификации)

Создайте новую таблицу `daily_intake` для отслеживания ежедневного потребления:

```sql
CREATE TABLE IF NOT EXISTS daily_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_consumed INTEGER DEFAULT 0,
  protein_consumed INTEGER DEFAULT 0,
  carbs_consumed INTEGER DEFAULT 0,
  fats_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

## Индексы для производительности

```sql
CREATE INDEX IF NOT EXISTS idx_daily_intake_user_date ON daily_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_intake_profile_date ON daily_intake(profile_id, date);
```

## Как использовать

1. При сохранении анкеты автоматически рассчитываются и сохраняются:
   - `daily_calories` - норма калорий на день
   - `daily_protein` - норма белка (г)
   - `daily_carbs` - норма углеводов (г)
   - `daily_fats` - норма жиров (г)

2. Для геймификации:
   - При добавлении еды обновляется `daily_intake`
   - Можно сравнивать `calories_consumed` с `daily_calories` из профиля
   - Показывать прогресс-бар: сколько % от нормы уже съедено

## Пример запроса для получения прогресса

```sql
SELECT 
  p.daily_calories,
  COALESCE(di.calories_consumed, 0) as consumed,
  ROUND((COALESCE(di.calories_consumed, 0)::NUMERIC / NULLIF(p.daily_calories, 0)) * 100, 1) as progress_percent
FROM profiles p
LEFT JOIN daily_intake di ON di.profile_id = p.id AND di.date = CURRENT_DATE
WHERE p.user_id = $1;
```

