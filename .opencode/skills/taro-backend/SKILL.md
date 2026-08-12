---
name: taro-backend
description: Use when working on the Python backend of TARO — the aiogram 3 Telegram bot under bot/, SQLite persistence, DeepSeek integration, Telegram Stars payments, or the future FastAPI mini-app API. Trigger on bot, payment, DB, or API work.
---

# TARO backend

## Layout

- `bot/main.py` — entrypoint; builds `Bot`/`Dispatcher`, `init_db`, includes routers, registers payment `pre_checkout`.
- `bot/config.py` — env via `python-dotenv` from `.env`. `BOT_TOKEN` is mandatory. The AI engine is provider-agnostic: `AI_PROVIDER` (`deepseek` default, `openrouter`, `gemini`), `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY` (falls back to `DEEPSEEK_API_KEY`). All providers get called via the OpenAI-compatible `/chat/completions` shape.
- `bot/handlers/` — routers: `start` (menu), `wizard` (FSM: date → birth time → birth place), `report` (renders profiles + generates text), `daily` (card of the day, `/card`), `payment` (Telegram Stars invoice).
- `bot/services/numerology.py` — zodiac + 10 arcana-of-fate engine. Zodiac from date (ranges in `texts/zodiac_base.py`); arcanum = `abs(n) % 22` mapped to indexes 0–21 (0 = Шут). Do not change the algorithm without syncing `web/js/app.js` (it mirrors it in JS).
- `bot/services/ai.py` — OpenAI-compatible client. Endpoint = `{AI_BASE}/chat/completions`; `AI_BASE` derives from `AI_PROVIDER` unless `AI_BASE_URL` overrides. Falls back to deterministic texts when `AI_API_KEY` is empty. `build_prompt(user, full)` is exported for reuse (model-testing scripts).
- `scripts/test_models.py` — OpenRouter free-model runner (`OPENROUTER_API_KEY`): pings a list of `:free` models with a fixed prompt and reports latency + first 220 chars.
- `bot/texts/` — `arcana_base.py` (22 cards: name/keyword/text) and `zodiac_base.py` (12 signs). These are the canonical copy source; the web app mirrors them in JS (`ARCADES`/`ARCANA_TEXT`/`SIGNS`).
- `bot/db/db.py` — aiosqlite. Table `users` (telegram_id unique, birth data, zodiac, arcana JSON, `full_report_paid`).

## Rules

- Run from the repo root so `data/taro.db` lands at `data/`.
- Local smoke-test imports without a token: `$env:BOT_TOKEN="12345:test"; python -c "import bot.main"`.
- Python 3.14 target; deps in `requirements.txt`, reinstall with `python -m pip install -r requirements.txt`.
- Payments = Telegram Stars: `answer_invoice(currency="XTR", prices=[LabeledPrice(amount=stars)])`, `provider_token=""`, then handle `F.successful_payment` and `dp.pre_checkout_query`.
- Keep copy in `bot/texts/*` and in `web/js/app.js` in sync when editing signs/arcana.
- Do not log or commit secrets. `.env` is never committed.