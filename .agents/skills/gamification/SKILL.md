---
name: gamification
description: Use when implementing gamification features — daily card, streaks, achievements/badges, arcana collection progress, push notifications, or any engagement/retention mechanic in the TARO bot and web app.
---

# Gamification & Retention

## Ежедневная карта (Daily Card)

### Механика
- Каждый день пользователь получает 1 случайный аркан с коротким советом.
- Через бота: push-уведомление в настроенное время (default 9:00 по часовому поясу).
- Через мини-апп: баннер «Карта дня» на главной странице (обновляется раз в день).
- Карта дня = `hash(user_id + date) % 22` — детерминированная для каждого юзера.

### БД
```sql
ALTER TABLE users ADD COLUMN daily_notify_time TEXT DEFAULT '09:00';
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Europe/Moscow';
ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_daily TEXT;  -- ISO date
```

### Streak (серия)
- Если пользователь открыл карту дня N дней подряд → `streak = N`.
- Если пропустил день → `streak = 0`.
- Каждые 7 дней → бонус (бесплатный полный ИИ-разбор, даже на freemium).
- Отображается в профиле: 🔥 7-дневная серия.

## Коллекция арканов

### Механика
- У каждого пользователя есть «альбом» из 22 арканов.
- Аркан «открывается» когда выпадает в расчёте или в ежедневной карте.
- Прогресс-бар: «Открыто 14/22 арканов».
- Полная коллекция → достижение «Мастер Арканов» + эксклюзивный стиль ИИ.

### БД
```sql
CREATE TABLE user_arcana (
  user_id INTEGER NOT NULL,
  arcana_num INTEGER NOT NULL,  -- 0..21
  first_seen TEXT NOT NULL,     -- ISO datetime
  times_seen INTEGER DEFAULT 1,
  PRIMARY KEY (user_id, arcana_num),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id)
);
```

## Достижения (Achievements)

| ID | Название | Условие | Бонус |
|----|----------|---------|-------|
| first_reading | Первый расклад | Рассчитать арканы впервые | — |
| week_streak | 7 дней подряд | Streak = 7 | Бесплатный ИИ-разбор |
| month_streak | 30 дней подряд | Streak = 30 | Эксклюзивный стиль |
| all_arcana | Мастер Арканов | Открыть 22/22 | Секретный голос ИИ |
| natal_master | Звёздный навигатор | Построить натальную карту | — |
| pair_check | Родственные души | Проверить совместимость | — |
| share_king | Проводник | Поделиться раскладом 5 раз | — |

### БД
```sql
CREATE TABLE achievements (
  user_id INTEGER NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);
```

## Правила

- Геймификация НЕ должна блокировать основной функционал.
- Streak и достижения — мотивация, не ограничение.
- Push-уведомления — только если пользователь явно подписался (opt-in).
- Все бонусы за достижения — косметические или временные (1 бесплатный разбор).
- SQL: только параметризованные запросы, как требует скилл `backend-hardcore-security`.
