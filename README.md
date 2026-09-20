# 🔮 TARO NAVIGATOR

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Mohito-s/taro-navigator)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![aiogram 3](https://img.shields.io/badge/aiogram-3.13%2B-2CA5E0.svg)](https://aiogram.dev/)

**TARO NAVIGATOR** — современный веб-сервис, Telegram Mini App и Telegram-бот для персональных расчётов матрицы судьбы, натальной карты и астрологических прогнозов на базе искусственного интеллекта.

* **Демо:** [https://shadowlinkapp.online](https://shadowlinkapp.online)
* **Telegram-бот:** [@MyGoodTaro_bot](https://t.me/MyGoodTaro_bot)

---

## ✨ Основные возможности

- 🃏 **10 Арканов Судьбы:** расчет по дате рождения базовых архетипов (личность, таланты, уроки, предназначение).
- 🌌 **Натальная карта высокой точности:** расчет реального положения небесных тел по астрономическим эфемеридам (VSOP87).
- 🤖 **Персональные ИИ-интерпретации:** выбор из 5 стилей («Космо», «Гендальф Серый», «Доктор Стрэндж», «Мастер Йода», «Альбус Дамблдор»).
- 📲 **Генератор Stories-карточек (1080×1920):** создание стильного постера с персональным раскладом в один клик для публикации в соцсетях и Telegram.
- 🔑 **Анонимная синхронизация:** привязка данных и истории между браузером и Telegram-ботом по короткому коду `TARO-XXXXXX` без ввода персональных данных.
- 📚 **Библиотека классики Таро:** встроенная читалка оригинальных трудов Артура Уэйта, Алистера Кроули и Папюса.
- 🌗 **Дизайн Dark Luxury Gold:** продуманная эстетика, переключение тем (тёмная/светлая), полная адаптивность для мобильных и десктопных устройств.
- 💳 **Поддержка монетизации:** интеграция с платежами Telegram Stars (XTR).
- 📢 **Автопостинг в канал:** регулярная генерация и публикация «Карты дня» в привязанный канал.

---

## 🚀 Развертывание на Heroku в один клик

Вы можете мгновенно запустить собственный экземпляр бэкенда и веб-приложения на Heroku:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Mohito-s/taro-navigator)

### Переменные окружения для Heroku

| Переменная | Обязательно | Описание | По умолчанию |
|---|---|---|---|
| `BOT_TOKEN` | **Да** | Токен вашего бота от [@BotFather](https://t.me/BotFather) | — |
| `AI_PROVIDER` | Нет | Провайдер нейросети (`deepseek`, `openrouter`, `gemini`, `together`, `groq`) | `deepseek` |
| `DEEPSEEK_API_KEY` | Нет | Ключ к API DeepSeek (если выбран `deepseek`) | — |
| `AI_API_KEY` | Нет | Ключ для любого другого совместимого провайдера | — |
| `AI_MODEL` | Нет | Идентификатор модели | `deepseek-chat` |
| `MINI_APP_URL` | Нет | URL запущенного приложения `https://<ваше-приложение>.herokuapp.com` | — |
| `ADMIN_ID` | Нет | Ваш Telegram ID для доступа к сервисным командам | `830960097` |
| `CHANNEL_ID` | Нет | ID канала для ежедневных публикаций (например, `-100...`) | `-1004437866558` |
| `TEST_MODE` | Нет | `true` — тестовый режим (пропуск оплаты Stars) | `false` |
| `RUN_BOT` | Нет | `true` — запускать Telegram-бота и FastAPI в одном dyno | `true` |

> 💡 **Совет:** По умолчанию запуск происходит через `python -m bot.run_all`, что позволяет запускать и веб-сервер, и бота в рамках одного Eco/Basic dyno с общей базой данных SQLite.

---

## 🛠 Локальная установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/Mohito-s/taro-navigator.git
cd taro-navigator
```

### 2. Создание виртуального окружения
```bash
python -m venv venv
# Linux / macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate
```

### 3. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 4. Настройка переменных окружения
Скопируйте пример файла конфигурации:
```bash
cp .env.example .env
```
Заполните обязательные поля:
```ini
BOT_TOKEN=123456789:ABCDefghIJKLmnOPQRstuvwxyz
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 5. Запуск

**Единый запуск (Веб-сервер + Telegram-бот):**
```bash
python -m bot.run_all
```

**Либо раздельный запуск:**
```bash
# Терминал 1 — Telegram-бот
python -m bot.main

# Терминал 2 — FastAPI сервер
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 📁 Структура проекта

```text
taro-navigator/
├── api/
│   └── main.py              # FastAPI сервер (REST API эндпоинты + раздача статики)
├── bot/
│   ├── config.py            # Конфигурация и переменные окружения
│   ├── main.py              # Точка входа Telegram-бота (aiogram 3)
│   ├── run_all.py           # Единый запуск веб-сервера и бота для Heroku
│   ├── db/
│   │   └── db.py            # Модуль работы с БД (aiosqlite)
│   ├── handlers/            # Обработчики команд и диалогов бота
│   │   ├── admin_poster.py  # Управление публикациями в канал
│   │   ├── admin_sos.py     # Экстренное обслуживание сервера
│   │   ├── daily.py         # Карта дня
│   │   ├── report.py        # Генерация и выдача разборов
│   │   ├── start.py         # Стартовое меню и синхронизация
│   │   ├── webapp.py        # Обработка данных от Mini App
│   │   └── wizard.py        # Пошаговый сбор данных о пользователе
│   ├── services/
│   │   ├── ai.py            # Интеграция с LLM (OpenAI-совместимый интерфейс)
│   │   ├── channel_poster.py# Фоновый планировщик публикаций
│   │   └── numerology.py    # Расчет арканов и астрологических соответствий
│   └── texts/               # Текстовые базы (арканы, зодиак, персоны)
├── css/
│   └── style.css            # Стили (дизайн-система Dark Luxury Gold, Bento Grid)
├── js/
│   ├── app.js               # Фронтенд-логика, API-клиент, Canvas-генератор
│   ├── natal.js             # Астрономический модуль (VSOP87)
│   └── space.js             # 3D сцена на Three.js
├── books/                   # Библиотека литературы по Таро
├── img/                     # Графические ассеты и иллюстрации карт
├── app.json                 # Манифест для деплоя на Heroku в 1 клик
├── Procfile                 # Конфигурация процессов Heroku
├── runtime.txt              # Версия Python для Heroku
├── requirements.txt         # Зависимости Python
├── index.html               # Главная страница (калькулятор, арканы, библиотека)
├── natal.html               # Натальная карта
├── forecast.html            # Прогнозы
├── profile.html             # Профиль и синхронизация
└── PROJECT_STATE.md         # Журнал разработки и текущий план
```

---

## 📄 Лицензия

Проект распространяется под открытой лицензией [MIT](LICENSE).
