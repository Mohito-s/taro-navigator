---
name: audit
description: Run a TARO project audit — report DONE vs NOT-DONE against the spec, FINISH any half-done work before moving on, and detect + remove duplicate code AND duplicate AI prompt definitions by consolidating to a single source of truth. Use on "check status", "what's done", "find duplicates", "audit", or after a batch of changes. Enforces strict sequencing: finish & verify started work first.
---

# TARO Project Audit & Continuity

Core discipline: **never leave half-done work; finish and verify it before the next task.**
The assistant proposes and drives the ordered plan; the user only decides at real forks.

## Workflow (strict order)

1. **STATUS** — what is DONE / PARTIAL / MISSING (verify by reading code, not guessing).
2. **FINISH** — complete any PARTIAL / in-progress items first. Do not start new
   features while old ones are unfinished. Verify each fix (lint/run/test) before marking done.
3. **DEDUPE** — remove duplicate CODE and duplicate PROMPTS (see below).
4. **NEXT** — only then propose/start the next task. Report the sequence used.

## 1) DONE / NOT-DONE status

Canonical intent lives in:
- `index.html` — 5-tab mini-app SPA (`screen-reads|natal|forecast|history|profile`) + tabbar.
- `js/app.js` — arcana calc, 3D tilt cards, natal chart + 3D stars, Telegram WebApp bridge (`sendData` → `type:'save'|'buy'`).
- `css/style.css` — cosmic style, 3D volumetric cards, natal screen.
- `bot/handlers/webapp.py` — receives `web_app_data`, saves profile, handles `buy`/`save`.
- `bot/handlers/payment.py` — Stars invoice (`PRICE_STARS`), `successful_payment` → `send_report`.
- `bot/services/ai.py` — AI generation (single canonical `SYSTEM_PROMPT`, `build_prompt`).
- `bot/config.py` — `AI_PROVIDER`, `TEST_MODE`, etc.
- `.env` — provider/key/model, `TEST_MODE`.

Cover at least: cosmic 3D style, 5-tab nav, arcana 3D cards, natal 3D chart + stars,
WebApp bridge, Stars payment, TEST_MODE bypass, AI provider config + fallback.
Mark ✅ working / 🔧 partial (placeholder or unfinished) / ⬜ missing, with file:line anchors.
A placeholder-only screen is 🔧 PARTIAL, not ✅.

## 2) FINISH half-done work

Find in-progress markers: `TODO`, `FIXME`, `в разработке`, placeholder-only screens,
commented-out stubs, functions defined but never wired, handlers not registered in `main.py`.
Finish or explicitly defer (with reason). Re-run the bot/static server after changes to verify.

## 3) Dedupe — CODE

Find duplicated logic across `bot/`, `scripts/`, `js/` (frontend JS reimplementing
Python is EXPECTED and NOT a dup to remove):
- Same function defined twice (e.g. `get_arcana`, `zodiac`, `build_prompt`).
- Copy-pasted blocks that should be one helper.
- Dead/leftover code from old approaches.

Action: keep ONE canonical implementation; make other call sites import/reuse it;
delete the leftover. Verify behavior is unchanged (run/test).

## 4) Dedupe — PROMPTS

Single canonical prompt source: `bot/services/ai.py` (`SYSTEM_PROMPT` + `build_prompt`).
Nothing else should redefine the system persona.

- Grep (`SYSTEM_PROMPT`, `SYSTEM =`, `Ты — мастер`, `build_prompt`, `system", "content`,
  repeated persona strings) across `scripts/`, `bot/`, skills.
- Duplicate system-prompt string OUTSIDE `bot/services/ai.py`:
  - test/script (e.g. `scripts/test_models.py`): `from bot.services.ai import SYSTEM_PROMPT`
    and reuse it. Keep test-specific *user* fixtures (not duplicates).
  - dead/leftover: delete.
- Confirm no behavior change (imported prompt byte-equivalent or intentional upgrade).
- Re-grep to confirm the duplicate string is gone.

## Rules
- Only safe, mechanical de-duplications. Don't delete intentionally different logic.
- Keep AI keys server-side only; never move into frontend or skills.
- Report: DONE/NOT-DONE table + what duplicates removed (file:line) + next-step proposal.
