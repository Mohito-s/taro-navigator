---
name: frontend-design
description: Use when working on the TARO web app visual design, layout, CSS, HTML, responsive behavior, or landing/mini-app styling. Covers the Dark Luxury Gold design language (charcoal-black bg, warm gold accents, dense dark cards, serif headings, tarot card illustrations) and general modern frontend best practices.
---

# Frontend Design — Dark Luxury Gold

## The TARO design language (v2 — Dark Luxury Gold)

- **Palette:**
  - Background: charcoal-black `#111114`
  - Cards: `#1c1c20` base, `#232328` elevated
  - Gold accent: `#c9a96e`, gold-light/cream: `#e8dcc8`
  - Gold glow: `rgba(201, 169, 110, 0.2)`
  - Text: `#f0ece4` (primary), `#8a857c` (muted)
  - Borders: `rgba(201, 169, 110, 0.18)` (gold), `rgba(255, 255, 255, 0.06)` (subtle)
  - NO neon cyan/violet/pink. NO glassmorphism blur. NO gradient buttons.

- **Fonts:** `Playfair Display` for display/headings (elegant serif), `Inter` for body/UI (clean sans-serif). Loaded from Google Fonts.

- **Card style:**
  - Dense, opaque background `#1c1c20` — not transparent/glass
  - Thin gold border `1px solid rgba(201, 169, 110, 0.18)`
  - Border-radius: `16px` (cards), `12px` (inputs), `999px` (pills/buttons)
  - On hover: border brightens to `rgba(201, 169, 110, 0.4)`, subtle translateY(-4px)
  - No backdrop-filter, no blur, no neon box-shadows

- **Buttons:**
  - Primary: gold outline `border: 1px solid #c9a96e`, text `#c9a96e`, hover fills gold
  - Ghost: subtle border `rgba(255,255,255,0.1)`, text muted, hover highlights
  - No gradient fills, no glow shadows

- **Tarot card illustrations:**
  - 22 generated art images in `img/cards/` (vintage mystical style, gold/cream on dark)
  - Referenced as `<img>` in arcana grid, NOT emoji symbols
  - Fallback: gold-tinted radial gradient placeholder

- **Environment:** Optional Three.js canvas (`js/space.js`) with subtle starfield. Moon/rings dimmed or removed. Content at `z-index:4`. Canvas can be disabled without breaking layout.

## Rules for edits

- Keep the 3D sky as pure background: no content element may rely on the canvas.
- NEVER obstruct the content column on medium/narrow widths.
- Respect `prefers-reduced-motion` — wrap decorative animation in a media query.
- Reveal-on-scroll: elements with `.reveal` animate in via IntersectionObserver in `app.js`.
- Mobile first where possible; test at 390px and 1600px before finishing.
- No images from the internet — textures are procedural or generated via AI.
- Keep spacing consistent (8px grid, section padding ~80px desktop / ~48px mobile).
- Russian copy, "ты"-form, no lorem.
- Multi-page architecture: `index.html`, `natal.html`, `forecast.html`, `profile.html`.
  Bottom `<nav class="tabbar">` with 4-5 tabs. Each page loads shared CSS/JS.

## Before/after any visual change

1. Edit files under repo root (`index.html`, `css/style.css`, `js/app.js`, `js/space.js`).
2. Serve: `python -m http.server 8000` (repo root).
3. Run the automated check: `node tools/browser-check/check.cjs`.
4. If a new breakpoint/behavior was touched, add a puppeteer assertion.