# Структура маршрутов Truck Repair Assistant

## Основные маршруты

- `/` - Главная страница
- `/test-ai` - Тест базового AI интерфейса
- `/test-ai-comprehensive` - Тест расширенного AI интерфейса
- `/api/health` - API эндпоинт для проверки состояния сервиса

## Структура директорий

```
app/               # Основная директория приложения (Next.js App Router)
├── page.tsx       # Главная страница (/)
├── not-found.tsx  # Страница 404
├── layout.tsx     # Корневой layout
├── globals.css    # Глобальные стили
├── test-ai/       # Маршрут /test-ai
│   └── page.tsx
├── test-ai-comprehensive/  # Маршрут /test-ai-comprehensive
│   └── page.tsx
└── api/           # API маршруты
    └── health/    # Эндпоинт для проверки состояния (/api/health)
        └── route.ts
```

## Как добавить новый маршрут

1. Создайте директорию с именем маршрута в `app/`
2. Создайте файл `page.tsx` внутри этой директории
3. При необходимости, добавьте маршрут в `sitemap.xml`

## Конфигурация роутинга

Маршрутизация настроена в `next.config.js`. Особенности:
- Включен `trailingSlash: true` для совместимости с GitHub Pages
- В production, базовый путь устанавливается как `/truck-repair-assistant`
