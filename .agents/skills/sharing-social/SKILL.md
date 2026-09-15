---
name: sharing-social
description: Use when implementing social features — sharing tarot readings as images (Canvas → PNG → share API), compatibility between two people, community feed, likes/comments, or any viral/social mechanic in the TARO app.
---

# Sharing & Social Features

## Шеринг расклада (Canvas → PNG)

### Генерация Share-карточки

Красивая карточка для Stories/Telegram/Instagram (1080×1920, формат Stories):

```
┌──────────────────────────────────┐
│        TARO NAVIGATOR            │  ← логотип, золотой текст
│                                  │
│     ☾ Твой космический код ☾     │  ← заголовок
│                                  │
│   ┌─────┐ ┌─────┐ ┌─────┐      │
│   │ Маг │ │Звезд│ │ Луна│      │  ← 3 главных аркана (картинки)
│   │  I  │ │ XVII│ │XVIII│      │
│   └─────┘ └─────┘ └─────┘      │
│                                  │
│      ♈ Овен · 25.09.1985        │  ← знак + дата
│                                  │
│   « Узнай свой космический       │
│     код на shadowlinkapp.online » │  ← CTA
│                                  │
│         [QR-код на бота]          │  ← QR (опционально)
└──────────────────────────────────┘
```

### Реализация (клиентская, без сервера)

```js
async function generateShareImage(natal, arcana) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  // 1. Фон #111114
  ctx.fillStyle = '#111114';
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Золотая рамка
  ctx.strokeStyle = '#c9a96e';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1000, 1840);

  // 3. Логотип, текст, арканы — drawImage / fillText
  // ...

  // 4. Шеринг
  canvas.toBlob(blob => {
    const file = new File([blob], 'taro-reading.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'Мой расклад TARO NAVIGATOR' });
    } else {
      // Фоллбэк: скачать файл
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'taro-reading.png';
      a.click();
    }
  }, 'image/png');
}
```

### Telegram-специфичный шеринг

В Telegram WebApp есть `Telegram.WebApp.shareToStory(mediaUrl)` (если поддерживается).
Фоллбэк — `Telegram.WebApp.openTelegramLink('https://t.me/share/url?url=...')`.

## Совместимость пар

- Две даты рождения → два набора арканов.
- Сравнение: совпадения в позициях (гармония), конфликтующие арканы.
- Знаки зодиака: стихии (огонь+воздух = гармония, огонь+вода = конфликт).
- Визуально: два круга арканов с линиями связи (зелёные = хорошо, красные = внимание).

## Правила

- Шеринг-картинку генерить ТОЛЬКО на клиенте (Canvas API). Не грузить сервер.
- Всегда включать CTA (ссылку или QR) — это главный вирусный механизм.
- Тексты на картинке — на русском, «ты»-форма.
- Не хранить чужие share-карточки — каждый генерит свою.
