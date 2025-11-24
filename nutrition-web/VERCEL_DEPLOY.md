# Инструкция по деплою на Vercel

## Шаг 1: Подготовка

1. Убедитесь, что проект собирается локально:
   ```bash
   npm run build
   ```

2. Закоммитьте все изменения в Git:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

## Шаг 2: Деплой на Vercel

### Вариант A: Через веб-интерфейс Vercel

1. Зайдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите "Add New Project"
3. Импортируйте ваш репозиторий
4. Настройки проекта:
   - **Framework Preset**: Next.js (определится автоматически)
   - **Root Directory**: `nutrition-web` (если проект в подпапке)
   - **Build Command**: `npm run build` (или оставьте по умолчанию)
   - **Output Directory**: `.next` (по умолчанию)
   - **Install Command**: `npm install` (по умолчанию)

### Вариант B: Через Vercel CLI

1. Установите Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Войдите в Vercel:
   ```bash
   vercel login
   ```

3. Перейдите в папку проекта:
   ```bash
   cd nutrition-web
   ```

4. Запустите деплой:
   ```bash
   vercel
   ```

5. Для production деплоя:
   ```bash
   vercel --prod
   ```

## Шаг 3: Настройка переменных окружения

После деплоя нужно добавить переменные окружения в Vercel:

1. Зайдите в настройки проекта на Vercel
2. Перейдите в раздел **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Нажмите **Save** и **Redeploy** проект

## Шаг 4: Получение URL для Telegram бота

После деплоя Vercel предоставит URL вида: `https://your-project.vercel.app`

Этот URL нужно добавить в переменную окружения `WEBAPP_URL` для Telegram бота.

## Шаг 5: Проверка

1. Откройте деплоенное приложение в браузере
2. Попробуйте заполнить и отправить форму
3. Проверьте, что данные сохраняются в Supabase

## Troubleshooting

### Ошибка "SUPABASE_URL не заданы"
- Убедитесь, что переменные окружения добавлены в Vercel
- Проверьте, что они добавлены для правильного окружения (Production, Preview, Development)
- После добавления переменных передеплойте проект

### Ошибка сборки
- Проверьте логи сборки в Vercel Dashboard
- Убедитесь, что все зависимости указаны в `package.json`
- Проверьте, что TypeScript компилируется без ошибок

### Проблемы с Tailwind CSS
- Убедитесь, что `tailwind.config.js` правильно настроен
- Проверьте, что `postcss.config.mjs` существует
- Убедитесь, что `globals.css` импортирует Tailwind директивы

