---
name: security-review
description: Use when auditing the TARO project for security issues — SQL injection, XSS/HTML injection in the Mini App, API key exposure in the static frontend (index.html/js/css), safe secrets handling, command injection, SSRF via AI providers, payment trust boundaries, Telegram WebApp data tampering, spam/DoS resilience, phishing and scraper-resistant UX, or before committing. Catches TARO-specific pitfalls: AI keys leaking to browser, client-trusted payments, unvalidated web_app_data.
---

# TARO Security Review

Run this checklist whenever you touch the Mini App frontend, the bot's `ai.py`,
payment flow, DB layer, or `.env`. The #1 risk for this project: **API keys and
private data must never reach the browser, and the bot must never trust the client.**

## 1. No secrets in the static frontend (CRITICAL)
The Mini App is a static GitHub Pages site — anything in `index.html`, `js/app.js`,
`css/style.css` is public. Audit:
- Grep for key patterns: `sk-`, `AIza`, `Bearer `, `api_key`, `API_KEY`, `gsk-`, `r8_`, `tc-`.
  Search frontend files (index.html, js/*, css/*) for these — must be ZERO matches.
- AI provider keys (Groq/OpenRouter/Together/DeepSeek/Gemini) live ONLY in `bot/.env`
  (gitignored) and are used solely by `bot/services/ai.py`. The Mini App reaches the
  bot via `tg.initData`/`sendData`, never calls an AI provider directly.
- `bot/config.py` reads keys from `os.getenv`; `bot/services/ai.py` must never log the full key.

## 2. Secrets never committed
- `.env` is gitignored. Verify with `git ls-files | Select-String -Pattern "\.env$"` → should be empty
  (only `.env.example` may be tracked, with placeholders only).
- Check git history isn't leaking: `git log --all --oneline -S "sk-"` etc.
- `data/taro.db` (user PII) must NOT be committed — it belongs in `.gitignore`.

## 3. SQL injection (CRITICAL)
- `bot/db/db.py` uses parameterized queries (`?` placeholders) via aiosqlite — keep it that way.
- NEVER build SQL with f-strings / string concatenation / `.format()` of user input.
- User input reaches DB only through validated ints/strings; zodiac/arcana are computed
  server-side in `bot/services/numerology.py`, NOT trusted from the client.
- Grep db.py and all handlers for `execute(f"`, `execute("SELECT ... " +`, `.format(` in SQL.
- Quoted identifiers (table/column names) must come from a fixed allowlist, never user data.

## 4. XSS / HTML injection in the Mini App
- `js/app.js` renders with `innerHTML` for the result/arcana grid/natal. Today the data is
  numeric-date-derived + static dicts (safe). RULE: any user free-text (city, time, notes)
  must NEVER go into `innerHTML` — use `textContent`/`.value`, or escape `<>&"'` first.
  Natal form writes `city` to localStorage AND sends it to the bot; the bot renders it
  back in messages. If the bot echoes `city` with `parse_mode="HTML"`, it MUST escape it,
  otherwise a user can send `<b>` or scripts to other users/api. Escape before HTML render.
- The natal/buy `web_app_data` payload is client-supplied: re-validate every field server-side
  (day/month/year ranges, length-limits on time/city), re-compute zodiac/arcana. Never trust
  the client's computed `zodiac`/`arcana` or any key not re-derived.
- Always rebuild the HTML in the browser after any edit: greet a custom user city like
  `<script>alert(1)</script>` and confirm it renders as inert text.

## 5. Command injection / SSRF
- The bot should never `os.system`/`subprocess` with user input. If you add shell calls,
  use an allowlist and exact args, never concatenate user strings into a shell command.
- AI providers are called via HTTP (OpenAI-compatible). SSRF vector: `AI_BASE_URL` is a
  trusted env config (admin-controlled), never derived from user input. Keep it that way.
- Webhook/long-polling: the bot only talks to Telegram; if you later add a webhook, verify
  the secret token before trusting any request.

## 6. Payment trust boundary (CRITICAL)
- Telegram Stars payments handled server-side: bot sends invoice (`bot/handlers/payment.py`),
  Telegram sends `successful_payment`; only then `set_paid` + report. The Mini App can only
  REQUEST a payment (`sendData({type:'buy'})`); it never "unlocks" content itself.
- Never put `provider_token`, price, or entitlement logic in the client.
- `TEST_MODE` must NEVER be enabled in production (it skips payment entirely).

## 7. Telegram identity / tampering
- `message.from_user.id` is set by Telegram and is your real user id — use it, never a client
  field. If you ever trust a username/avatar from `web_app_data`, re-fetch from `message`,
  don't trust the payload.
- `web_app_data` length is capped by Telegram, but still length-limit `time`/`city` before DB
  writes (e.g. 20/80 chars) — done in `bot/handlers/webapp.py`, keep it.
- Do not trust `initData` contents for authorization beyond confirming the WebApp opened
  from Telegram; all real logic tied to `message.from_user`.

## 8. Spam / DoS / rate limiting
- Each WebApp `sendData` arrives as a Message and calls `save_profile` (a DB write).
  Cheap now, but if exposed publicly add a per-user cooldown (e.g. min interval between
  saves) to avoid DB hammering and to prevent overwriting another user's data.
- Olding keyboard noise: the `/card` command and menu are cheap; guard the expensive AI
  report with a per-user in-flight flag (already via payment gating) — do not let a user
  spawn unlimited AI calls free (that's both cost-DoS and a financial leak).
- Frontend: debounce/reset after submit so the natal form cannot be spammed in a loop.

## 9. Phishing / link safety / scraper resilience
- The bot only ever sends `tg://resolve?domain=MyGoodTaro_bot` and `MINI_APP_URL` buttons;
  do not render clickable URLs in user-provided text (auto-linkify = phishing vector).
- Any "download"/link the bot sends must point to your own domains only.
- Scrapers: the mini app contains no user data to scrape (all in bot DB); never dump
  profiles/history to the page. If the site is ever indexed, add `X-Robots-Tag`/meta noindex
  for the mini-app.

## 10. Quick audit command
```
# from repo root
Get-ChildItem index.html, js, css -Recurse | Select-String -Pattern "sk-|AIza|Bearer |api_key=|API_KEY="
# expect: no matches in frontend
git ls-files | Select-String -Pattern "\.env$|taro\.db"
# expect: no real .env, no data/taro.db
Get-ChildItem bot -Recurse | Select-String -Pattern "execute\(f|system\(|subprocess"
# expect: no raw f-string SQL, no shell calls
```

## Checklist before commit
- [ ] No `sk-`/`AIza`/`api_key` in index.html/js/css.
- [ ] `.env`/`data/taro.db` not in `git ls-files`.
- [ ] No f-string SQL in `bot/db/db.py` or handlers.
- [ ] Any user free-text (city/time) escaped before HTML render, or `textContent` used.
- [ ] `web_app_data` re-validated server-side; zodiac/arcana recomputed, not trusted.
- [ ] Payment `successful_payment` → `set_paid` intact; `TEST_MODE` off in prod.
- [ ] Per-user cooldown/in-flight guard for expensive AI calls.
