---
name: security-review
description: Use when auditing the TARO project for security issues — API key exposure in the static frontend, safe secrets handling, SQL injection, XSS in the Mini App, payment trust boundaries, or before committing. Catches the most common TARO pitfalls (AI keys leaking into index.html/js, client-trusted payments).
---

# TARO Security Review

Run this checklist whenever you touch the Mini App frontend, the bot's `ai.py`, payment flow,
or `.env`. The #1 risk for this project: **API keys must never reach the browser**.

## 1. No secrets in the static frontend (CRITICAL)
The Mini App is a static GitHub Pages site — anything in `index.html`, `js/app.js`, `css/style.css`
is public. Audit:
- Grep for key patterns: `sk-`, `AIza`, `Bearer `, `api_key`, `API_KEY`, `gsk-`, `r8_`, `tc-`.
  Command: search frontend files (index.html, js/*, css/*) for these — must be ZERO matches.
- AI provider keys (Groq/OpenRouter/Together/DeepSeek) live ONLY in `bot/.env` (gitignored) and
  are used solely by `bot/services/ai.py`. The Mini App reaches AI via `tg.sendData` → bot, never directly.
- `bot/config.py` reads keys from `os.getenv`; `bot/services/ai.py` must never log the full key.

## 2. Secrets never committed
- `.env` is gitignored. Verify with `git ls-files | Select-String -Pattern "\.env$"` → should be empty
  (only `.env.example` may be tracked, with placeholders only).
- Check git history isn't leaking: `git log --all --oneline -S "sk-"` etc.

## 3. SQL safety
- `bot/db/db.py` uses parameterized queries (`?` placeholders) via aiosqlite — keep it that way.
- NEVER build SQL with f-strings / string concatenation of user input.
- User input reaches DB only through `save_profile` with validated ints/strings; zodiac/arcana are
  computed server-side in `bot/services/numerology.py`, not trusted from the client.

## 4. XSS in the Mini App
- `js/app.js` builds HTML with `innerHTML` for the result/arcana grid. The data is computed from
  numeric date inputs (day/month/year) and static dictionaries — NOT external/user free-text, so
  it is safe today. If you ever render user free-text (e.g., a notes field), escape it first
  (`textContent` or an escape helper), never inject raw into `innerHTML`.
- Telegram WebApp `web_app_data` is client-supplied; the bot (`bot/handlers/webapp.py`) re-validates
  day/month/year ranges and re-computes zodiac/arcana server-side. Never trust client payload for
  anything beyond triggering a flow.

## 5. Payment trust boundary
- Telegram Stars payments are handled server-side: bot sends invoice (`bot/handlers/payment.py`),
  Telegram sends `successful_payment`; only then `set_paid` + report. The Mini App never "unlocks"
  paid content on its own — it can only request (`sendData({type:'buy'})`); the bot enforces payment.
- Never put `provider_token` or price logic trust in the client.

## 6. Quick audit command
```
# from repo root
Get-ChildItem index.html, js, css -Recurse | Select-String -Pattern "sk-|AIza|Bearer |api_key=|API_KEY=" 
# expect: no matches in frontend
git ls-files | Select-String -Pattern "\.env$"
# expect: only .env.example (no real .env)
```
