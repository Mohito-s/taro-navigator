---
name: frontend-design
description: Use when working on the TARO web app visual design, layout, CSS, HTML, responsive behavior, or landing/mini-app styling. Covers the cosmic futuristic design language (dark space, stars, 3D moon, glassmorphism, neon cyan/violet/pink) and general modern frontend best practices.
---

# Frontend Design

## The TARO design language

- **Palette:** deep-space background `#05060f`, accents cyan `#54f1ff`, violet `#8b5cf6`, pink `#ff5fb2`. Gradient = cyan → violet → pink.
- **Fonts:** `Orbitron` for display/headings (futuristic), `Manrope` for body text.
- **Signature effects:** glassmorphism cards (backdrop-filter blur + `rgba(255,255,255,.05)` fill + `1px` light border), neon text-shadows, dashed orbit rings, Roman-numeral arcane badges, gradient borders, shine-sweep buttons.
- **Environment:** fixed full-screen Three.js canvas (`js/space.js`) renders starfield, 3D moon, rings, meteors, nebulas. It sits at `z-index:0`; content lives at `z-index:4`. Two pseudo-element overlays on `body` add aurora glows (`z-index:0`, `mix-blend-mode:screen`) and a vignette (`z-index:3`).

## Rules for edits

- Keep the 3D sky as pure background: no content element may rely on the canvas; the layout must look complete even if the canvas fails (JS disabled).
- NEVER obstruct the content column on medium/narrow widths. The moon is repositioned in `space.js` `layout()` by breakpoint (≥1280, ≥1000, ≥640, <640) and dims with `scrollFade` on scroll. Preserve this pattern when touching layout.
- Respect `prefers-reduced-motion` — wrap decorative animation in a media query (already present in `style.css`).
- Reveal-on-scroll: elements with `.reveal` (plus `.d2..d5` delays) animate in via IntersectionObserver in `app.js`. New sections must use these classes.
- Mobile first where possible; test at 390px and 1600px before finishing.
- No images from the internet for the visual language — textures are procedural (canvas-generated) so the site works offline. Fonts load from Google Fonts (allowed).
- Keep spacing consistent (8px grid, section padding ~90px desktop / ~60px mobile).
- Russian copy, "ты"-form, no lorem.
- Mini App is a tabbed SPA: 5 screens (`<section class="screen" id="screen-reads|natal|forecast|history|profile">`) switched by a fixed bottom `<nav class="tabbar">`. The Three.js canvas stays a global background. For Mini App SDK/routing/haptics/CloudStorage/sendData conventions see the `mini-app` skill.

## Before/after any visual change

1. Edit files under repo root (`index.html`, `css/style.css`, `js/app.js`, `js/space.js`).
2. Serve: `python -m http.server 8000` (repo root; the site was moved from `web/` to root).
3. Run the automated check: `node tools/browser-check/check.cjs` (expect 11/11).
4. If a new breakpoint/behavior was touched, the puppeteer script may need a new assertion — add it rather than removing coverage.