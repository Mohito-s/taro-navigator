---
name: tarot-art-assets
description: Use when generating, managing, or referencing Tarot card illustrations. Covers the 22 Major Arcana art style (vintage mystical, gold/cream on dark), file naming conventions, directory structure (img/cards/), and fallback rendering for missing images.
---

# Tarot Card Art Assets

## Стиль иллюстраций

Все 22 старших арканов генерируются в едином стиле:
- **Palette:** тёмный фон (#1a1820), золотые (#c9a96e) и кремовые (#e8dcc8) линии
- **Стиль:** vintage мистический, как классическое Таро Уэйта но в тёмных тонах
- **Детали:** тонкие золотые рамки вокруг изображения, название аркана внизу
- **Размер:** ~400×600px (вертикальный, 2:3), PNG или WebP
- **Фон иллюстрации:** тёмный (#1a1820 - #222228), не прозрачный

## Файловая структура

```
img/
  cards/
    00-fool.png          # 0 — Шут
    01-magician.png      # I — Маг
    02-priestess.png     # II — Жрица
    03-empress.png       # III — Императрица
    04-emperor.png       # IV — Император
    05-hierophant.png    # V — Иерофант
    06-lovers.png        # VI — Влюблённые
    07-chariot.png       # VII — Колесница
    08-strength.png      # VIII — Сила
    09-hermit.png        # IX — Отшельник
    10-wheel.png         # X — Колесо Судьбы
    11-justice.png       # XI — Справедливость
    12-hanged.png        # XII — Повешенный
    13-death.png         # XIII — Смерть
    14-temperance.png    # XIV — Умеренность
    15-devil.png         # XV — Дьявол
    16-tower.png         # XVI — Башня
    17-star.png          # XVII — Звезда
    18-moon.png          # XVIII — Луна
    19-sun.png           # XIX — Солнце
    20-judgement.png     # XX — Суд
    21-world.png         # XXI — Мир
```

## Маппинг имён (JS)

В `js/app.js` массив `ARCANA_IMAGES` мапит номер аркана на путь к файлу:
```js
const ARCANA_IMAGES = [
  'img/cards/00-fool.png',      // 0
  'img/cards/01-magician.png',  // 1
  // ... и т.д.
];
```

## Фоллбэк при отсутствии изображения

Если файл не загрузился, показать CSS-плейсхолдер:
```css
.arcana__illustration {
  background: radial-gradient(
    circle at 50% 40%,
    rgba(201, 169, 110, 0.15),
    rgba(28, 28, 32, 0.95)
  );
}
```
И Unicode-символ аркана как текстовый фоллбэк.

## Промт для генерации

При вызове `generate_image` для карт, базовый промт:
```
A vintage mystical tarot card illustration of [ARCANA NAME].
Dark background (#1a1820). Gold and cream line art in the style of
classic Rider-Waite tarot but with a dark luxury aesthetic.
Thin ornate gold border frame. The card name "[NAME]" at the bottom
in elegant serif font. Vertical 2:3 format. No text except card name.
Atmospheric, mysterious, premium feel.
```

## Правила

- Генерировать карты пакетами (по 5-10 за раз), не все 22 сразу — экономия лимитов.
- Приоритет: сначала 10 карт, которые чаще всего выпадают при расчёте (0-9 или 1-10).
- Не менять стиль одних карт без обновления всех — единообразие критично.
- Изображения коммитить в git (они небольшие, ~50-100KB каждое).
