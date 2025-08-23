# 🎰 RollIt - Telegram Mini App

Telegram Mini App для игры в рулетку с шансами по ставкам. Приложение работает внутри Telegram и предоставляет увлекательный игровой опыт с современным интерфейсом.

## ✨ Особенности

- **Telegram Mini App интеграция** - работает прямо внутри Telegram
- **Игра в рулетку** - справедливая система с весами по ставкам
- **Мультиплеер** - играйте с друзьями в реальном времени
- **Современный UI** - адаптивный дизайн с поддержкой темной/светлой темы
- **Анимации** - плавные переходы и эффекты с framer-motion
- **Безопасность** - проверка подписи Telegram WebApp API

## 🚀 Технологии

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **UI**: TailwindCSS, Lucide React Icons
- **Animations**: Framer Motion
- **Telegram**: WebApp API

## 📋 Требования

- Node.js 18+ 
- PostgreSQL 12+
- Telegram Bot Token

## 🛠️ Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd rollit
npm install
```

### 2. Настройка базы данных

1. Создайте PostgreSQL базу данных
2. Скопируйте `.env.example` в `.env.local`
3. Обновите `DATABASE_URL` в `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rollit_db"
TELEGRAM_BOT_TOKEN="your_bot_token_here"
NODE_ENV="development"
```

### 3. Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Добавьте токен в `.env.local`
4. Настройте WebApp для бота:

```
/setmenubutton
Выберите бота
Введите текст кнопки: 🎰 Играть в рулетку
Введите URL: https://your-domain.com
```

### 4. Инициализация базы данных

```bash
# Создание миграций
npx prisma migrate dev --name init

# Генерация Prisma Client
npx prisma generate
```

### 5. Запуск приложения

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Продакшн
npm start
```

## 🎮 Как играть

1. **Откройте приложение** в Telegram через вашего бота
2. **Авторизуйтесь** - приложение автоматически получит ваши данные
3. **Выберите игру** "Рулетка" из списка
4. **Сделайте ставку** - выберите сумму от 10 до 1000 монет
5. **Дождитесь завершения** игры и узнайте победителя
6. **Получите приз** - победитель забирает весь пул (минус комиссия 5%)

## 🏗️ Архитектура

### Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API эндпоинты
│   │   ├── auth/          # Авторизация Telegram
│   │   ├── user/          # Управление пользователями
│   │   └── game/          # Игровая логика
│   ├── layout.tsx         # Корневой layout
│   └── page.tsx           # Главная страница
├── components/             # React компоненты
│   ├── UserProfile.tsx    # Профиль пользователя
│   ├── GameList.tsx       # Список игр
│   ├── RouletteGame.tsx   # Игра в рулетку
│   └── LandingPage.tsx    # Лендинг вне Telegram
└── lib/                   # Утилиты и конфигурация
    ├── telegram.ts        # Telegram WebApp API
    ├── db.ts             # База данных
    └── utils.ts          # Общие утилиты
```

### API Эндпоинты

- `POST /api/auth/telegram` - авторизация через Telegram
- `GET /api/user/me` - получение профиля пользователя
- `GET /api/game/current` - текущая игра
- `POST /api/bet` - создание ставки
- `GET /api/game/history` - история игр

### База данных

- **User** - пользователи с балансом и данными Telegram
- **Game** - игры со статусом и пулом ставок
- **Bet** - ставки пользователей на игры

## 🔒 Безопасность

- Проверка подписи Telegram WebApp API
- Валидация всех входящих данных
- Транзакции для критических операций
- Защита от подделки данных пользователя

## 🎨 UI/UX

- **Адаптивный дизайн** для мобильных устройств
- **Поддержка тем** (светлая/темная)
- **Плавные анимации** с framer-motion
- **Интуитивный интерфейс** для быстрого старта
- **Визуальная обратная связь** для всех действий

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения:
   - `DATABASE_URL`
   - `TELEGRAM_BOT_TOKEN`
3. Деплой автоматически запустится

### Другие платформы

- **Netlify**: Аналогично Vercel
- **Railway**: Поддержка PostgreSQL
- **Heroku**: Требует PostgreSQL addon

## 🔧 Разработка

### Добавление новых игр

1. Создайте компонент игры в `src/components/`
2. Добавьте игру в `GameList.tsx`
3. Создайте API эндпоинты при необходимости
4. Обновите Prisma схему если нужно

### Локальная разработка

```bash
# Запуск с hot reload
npm run dev

# Проверка типов
npx tsc --noEmit

# Линтинг
npm run lint
```

## 📱 Тестирование

1. **Локально**: Откройте в браузере (без Telegram функций)
2. **Telegram**: Используйте [@BotFather](https://t.me/botfather) для тестирования
3. **Мобильные устройства**: Проверьте адаптивность

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей

## 🆘 Поддержка

- **Issues**: Создавайте issue в GitHub
- **Discussions**: Используйте GitHub Discussions
- **Telegram**: Свяжитесь с разработчиком

## 🔮 Планы на будущее

- [ ] Больше игр (слоты, карты, кости)
- [ ] Турниры и лиги
- [ ] Система достижений
- [ ] Социальные функции
- [ ] Мультиязычность
- [ ] Push-уведомления

---

**Создано с ❤️ для Telegram Mini Apps**
