# Схема базы данных Supabase

## Таблица `users`

Создайте таблицу `users` в Supabase с следующими полями:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Важно:**
- `telegram_id` должен быть `TEXT` (не INTEGER), так как мы конвертируем его в строку
- `telegram_id` должен быть UNIQUE, чтобы не было дубликатов
- Остальные поля опциональные (NULL)

## Таблица `profiles`

Создайте таблицу `profiles` в Supabase с следующими полями:

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  activity_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Важно:**
- `user_id` опциональный (может быть NULL) - для случаев, когда пользователь не создан
- `user_id` ссылается на `users(id)` с каскадным удалением
- Все остальные поля обязательные (NOT NULL)

## Альтернативный вариант (если user_id обязателен)

Если `user_id` должен быть обязательным, используйте:

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  activity_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- один профиль на пользователя
);
```

## Как создать таблицы в Supabase

1. Зайдите в ваш проект Supabase
2. Перейдите в **SQL Editor**
3. Выполните SQL команды выше
4. Убедитесь, что таблицы созданы в **Table Editor**

## Проверка структуры

После создания таблиц проверьте:
1. Таблица `users` существует
2. Таблица `profiles` существует
3. Поля соответствуют схеме выше
4. Права доступа настроены (для Service Role Key это обычно не проблема)

