---
name: performance-seo
description: Use when optimizing page load speed, Core Web Vitals, Lighthouse score, SEO (meta tags, schema.org, sitemap, robots), accessibility, or PWA (manifest, service worker, offline). Also covers image optimization, lazy loading, and CDN caching.
---

# Performance & SEO

## SEO чеклист

### Обязательно на каждой странице
- [ ] `<title>` — уникальный, до 60 символов, ключевые слова в начале
- [ ] `<meta name="description">` — до 160 символов, с CTA
- [ ] `<link rel="canonical">` — абсолютный URL
- [ ] `<html lang="ru">` — язык страницы
- [ ] Единственный `<h1>` — содержит главное ключевое слово
- [ ] `<meta name="robots" content="index, follow">`
- [ ] Open Graph теги (og:title, og:description, og:image, og:url)
- [ ] JSON-LD Schema.org (WebApplication или WebPage)

### Файлы в корне
- `robots.txt` — разрешить Яндекс/Google, заблокировать GPTBot/ClaudeBot/CCBot
- `sitemap.xml` — все публичные страницы с lastmod
- `favicon.jpg` (или .ico/.png/.svg)

## Производительность

### Изображения
- Все карты Таро → **WebP** (экономия 30-50% от PNG)
- `loading="lazy"` на всех `<img>` кроме first viewport
- `width`/`height` атрибуты для предотвращения CLS (Cumulative Layout Shift)
- Responsive: `srcset` если нужно (мобайл 200px, десктоп 400px)

### CSS
- Один файл `css/style.css` (нет HTTP-запросов на множество файлов)
- Критический CSS inline в `<head>` для first paint (опционально)
- `font-display: swap` на шрифтах (уже в Google Fonts URL)

### JavaScript
- `defer` или конец `<body>` для скриптов
- Three.js — CDN с integrity hash
- Lazy init: Three.js сцену инициализировать после DOMContentLoaded
- Если Three.js отключён — сайт всё равно работает

### Метрики (цели)
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Lighthouse Performance: > 85

## PWA (Progressive Web App) — будущее

При необходимости можно добавить:
- `manifest.json` — имя, иконки, цвета, start_url
- Service Worker — кеш стратегия (cache-first для статики, network-first для API)
- Офлайн-страница с базовым расчётом (без ИИ)

## Правила

- Не подключать внешние трекеры (Google Analytics, Яндекс.Метрика) без согласия юзера.
- Все изображения — оптимизировать перед коммитом.
- `?v=N` на CSS/JS ассетах — бампить при каждом изменении.
- `robots.txt` и `sitemap.xml` — обновлять при добавлении новых страниц.
