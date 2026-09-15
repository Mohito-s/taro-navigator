---
name: monetization-growth
description: Use when working on monetization features (Telegram Stars, donations, freemium, referral), user growth/virality (sharing, social features, streaks), or open-source community management (README, Contributing guide, GitHub Sponsors, badges).
---

# Monetization & Growth Strategy

## Модель монетизации (поэтапная)

### Этап 1 — Open-source + Донаты (текущий)
- Проект полностью бесплатный, код открыт.
- Донаты через:
  - **GitHub Sponsors** — кнопка в README и в боте
  - **Telegram Stars** — добровольный платёж внутри бота (InvoicePayload = "donation")
  - **Buy Me a Coffee** / boosty.to — ссылка на сайте и в боте
- В `README.md` добавить: бейджи Open Source, ссылки на донат, скриншоты, demo-ссылка.

### Этап 2 — Freemium (после набора 500+ пользователей)
- **Бесплатно:** 1 полный ИИ-разбор в день, базовые расклады, натал без планет.
- **Stars / подписка:** безлимит ИИ-разборов, расширенный натал (дома, аспекты),
  эксклюзивные ИИ-персоны (новые голоса), еженедельная рассылка.
- Реализация: `daily_limit` в таблице `users`, проверка перед генерацией.

### Этап 3 — Реферальная система
- Пригласи друга → оба получают 1 бесплатный полный разбор.
- Реферальная ссылка: `tg://resolve?domain=MyGoodTaro_bot&start=ref_<user_id>`.
- Таблица `referrals(referrer_id, referred_id, created_at)` в SQLite.

## Вирусные механики

### Шеринг расклада (приоритет)
- Canvas → PNG: красивая карточка с результатом расклада для Stories/Telegram.
- Кнопка «Поделиться» генерирует изображение 1080×1920 (формат Stories):
  фон #111114, золотая рамка, знак зодиака, 3 главных аркана, QR-код на бота.
- `canvas.toBlob()` → `navigator.share({files: [blob]})` или `Telegram.WebApp.shareToStory`.

### Ежедневная карта (retention)
- Бот присылает push каждый день в настроенное время.
- «Карта дня» — один аркан с коротким советом.
- Streak-счётчик: 7 дней подряд → бонус (бесплатный полный разбор).

### Совместимость пар
- Ввести 2 даты рождения → сравнение арканов и знаков.
- Покажи где совпадения (гармония) и где конфликты.
- Социальный эффект: "отправь другу и узнай вашу совместимость".

## Правила для агентов

- Все платёжные операции — только через Telegram Stars API (XTR invoices).
- Донат-кнопки — ненавязчивые, в футере/профиле. НИКОГДА не блокировать контент.
- Реферальные ссылки — валидировать user_id, не давать self-referral.
- Шеринг — генерить картинку на клиенте (Canvas API), не грузить сервер.
