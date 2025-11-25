# Новый поток создания пользователя

## Что изменилось

### Раньше:
1. Пользователь отправляет `/start` → бот показывает кнопку
2. Пользователь заполняет анкету → API пытается создать пользователя → ошибка

### Теперь:
1. Пользователь отправляет `/start` → бот создаёт пользователя в базе → показывает кнопку
2. Пользователь заполняет анкету → API находит существующего пользователя → сохраняет профиль

## Преимущества

✅ Пользователь создаётся сразу при `/start`  
✅ Нет проблем с foreign key при сохранении профиля  
✅ Проще логика - только поиск пользователя, не создание  
✅ Меньше ошибок

## Что нужно проверить

### 1. Переменные окружения в .env (для бота)

В корне проекта должен быть `.env` файл с:
```
BOT_TOKEN=ваш_токен
WEBAPP_URL=https://ваш-проект.vercel.app
SUPABASE_URL=ваш_url_supabase
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key
```

### 2. Переменные окружения в Vercel

В Vercel Dashboard → Settings → Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Структура базы данных

Убедитесь, что таблица `users` существует:
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

### 4. Перезапуск бота

После обновления кода:
1. Остановите бота (Ctrl+C)
2. Запустите снова:
   ```bash
   npm run bot
   ```
3. Должно появиться:
   ```
   ✅ Supabase client initialized for bot
   ✅ Bot started successfully!
   ```

## Тестирование

1. Отправьте `/start` в Telegram
2. Проверьте логи бота - должно быть:
   ```
   ✅ Created new user: <user_id>
   ```
3. Заполните анкету и сохраните
4. Проверьте логи Vercel - должно быть:
   ```
   ✅ Found user with id: <user_id>
   ✅ Profile saved successfully
   ```
5. Проверьте таблицы в Supabase:
   - `users` - должна быть запись с вашим telegram_id
   - `profiles` - должна быть запись с данными анкеты

## Если что-то не работает

### Бот не создаёт пользователя
- Проверьте, что `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` есть в `.env`
- Проверьте логи бота на ошибки
- Убедитесь, что таблица `users` существует

### API не находит пользователя
- Убедитесь, что пользователь был создан при `/start`
- Проверьте, что `telegram_user_id` передаётся из Web App
- Проверьте логи Vercel

### Профиль не сохраняется
- Проверьте структуру таблицы `profiles`
- Убедитесь, что `user_id` опциональный (может быть NULL)
- Проверьте логи Vercel для деталей ошибки

