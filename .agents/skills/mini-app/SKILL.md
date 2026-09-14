---
name: mini-app
description: Use when editing or extending the TARO Telegram Mini App — bottom navigation, screens (Расклады/Натал/Прогноз/История/Профиль), Telegram WebApp SDK (theme, haptics, CloudStorage, MainButton, BackButton, sendData bridge), screen routing, or verifying mini-app mechanics. Applies to the static site served from repo root on GitHub Pages.
---

# TARO Mini App

The Mini App is a **static site** (vanilla HTML/CSS/JS + Three.js) served from the repo root
on GitHub Pages and opened inside Telegram via `WebApp`. It is NOT React/Vite/Tailwind — keep
the vanilla stack to preserve the hand-tuned Three.js scene (`js/space.js`) and CSS animations.

## File map
- `index.html` — markup. Screens are `<section class="screen" id="screen-X">`; bottom nav is `<nav class="tabbar">`.
- `css/style.css` — all styles. Cosmic design language (see `frontend-design` skill).
- `js/app.js` — UI logic: calculator, arcana grid, modal, tab switching, Telegram bridge.
- `js/space.js` — Three.js background scene. Touch only to change visuals, never break `window.__taroScene`.
- `tools/browser-check/check.cjs` — Playwright smoke test (expect 11/11). Run from repo root.

## Telegram WebApp SDK (window.Telegram.WebApp)
- **Detect real WebApp**: poll for `window.Telegram?.WebApp?.initData` (Telegram injects the
  script sometimes *after* page load). Do NOT hide/show UI based only on `window.Telegram`
  existing — on the public site the script is absent, so `initData` gate keeps public UI intact.
  Pattern: `function initTelegram(){ const tg = window.Telegram?.WebApp; if(!tg||!tg.initData){ setTimeout(initTelegram,200); return; } ... }`
- `tg.ready()` + `tg.expand()` on init.
- **Theme**: apply `tg.themeParams` (bg_color, text_color, button_color, button_text_color) to CSS vars.
- **Haptics**: `tg.HapticFeedback.impactOccurred('light')` on tab switches / card draws.
- **MainButton / BackButton**: use for primary CTAs and leaving sub-screens; `tg.BackButton.show()/onClick`.
- **CloudStorage**: `tg.CloudStorage.setItem/getItem` for client-side prefs (interpretation style, language, cached natal summary). Never store secrets.
- **Bridge to bot**: to persist data or call AI, use `tg.sendData(JSON.stringify(payload))`.
  The bot receives `message.web_app_data` (handler in `bot/handlers/webapp.py`) and acts.

## Bottom navigation (5 tabs, always visible)
Tabs: **Расклады** (home), **Натал**, **Прогноз**, **История**, **Профиль**.
- Fixed bar with `env(safe-area-inset-bottom)` padding for notched phones.
- Each tab has `data-tab="reads|natal|forecast|history|profile"`.
- Screens switch by toggling `.screen--active` (only active screen is displayed).
- Haptic feedback on switch; first tab active by default.

## Critical architecture rule: no AI/keys in the frontend
The static Mini App **must never** call Groq/OpenRouter/Together/DeepSeek directly — API keys
would be exposed in the browser. Instead:
1. Mini App computes locally (dates → zodiac/arcana via the same algorithm as `bot/services/numerology.py`).
2. Sends payload to bot via `tg.sendData({type, ...})`.
3. Bot (`bot/services/ai.py`) calls the provider server-side and returns text in chat.

This keeps all secrets server-side (`.env`, gitignored). See `security-review` skill.

## AI provider reality (Russia / geo-block)
Empirically from this machine: **Groq and OpenRouter are geo-blocked (403)** even with valid
keys. **Together.ai** works (OpenAI-compatible, free credits) and **DeepSeek** works but needs
balance. Recommend Together.ai primary, DeepSeek fallback — both configured in `bot/config.py`.
Do not hard-code the spec's Groq/OpenRouter as the only options.

## Verify after edits
1. `node tools/browser-check/check.cjs` → expect 11/11.
2. Emulate WebApp in Playwright: inject `window.Telegram={WebApp:{initData:'x',ready(){},expand(){},themeParams:{},sendData(){},close(){},HapticFeedback:{impactOccurred(){}},CloudStorage:{setItem(){},getItem(){}}}}` then assert `body.in-webapp` and that `.tg-cta` elements are `display:none`, and that tabs switch screens.
3. Confirm public (no Telegram) still shows all conversion CTAs.
