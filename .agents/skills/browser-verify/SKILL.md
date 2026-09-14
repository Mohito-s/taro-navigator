---
name: browser-verify
description: Use to test the TARO web app in a real browser: start/stop the local server, run the puppeteer-core check script, or debug layout/JS issues on desktop and mobile viewports. Trigger whenever web files change or a layout/console bug is suspected.
---

# Browser verification

## How to serve

Run from the repo root (PowerShell):

```powershell
Start-Process python -ArgumentList "-m","http.server","8000","--directory","web" -WindowStyle Hidden
```

The site lives at `http://localhost:8000`. If `8000` is busy (or a stale server runs), reuse it — the server has no cache.

## Automated check

`tools/browser-check/` is a small Node project using `puppeteer-core` (wraps the locally installed Chrome/Edge, no browser download).

```powershell
node tools/browser-check/check.cjs
```

Expect `11/11`. The script asserts:
- no console/page errors,
- 10 arcane cards render,
- demo date → Телец,
- 25.09.1985 → Весы (regression for the array-comparison bug),
- scene initialized, moon on the right on desktop,
- arcana modal opens on click + closes on Escape,
- `scrollFade` drops when scrolling (moon hides, no overlap with form),
- reveal animations fire,
- moon recenters on 390px mobile.

Override defaults with env vars: `CHROME_PATH`, `URL`.

## Rules

- Always add/keep an assertion when you change behavior — the check script is the project's browser-level test suite.
- Do not visually claim "it works" from code alone; run the suite after each visual/JS change.
- If Chrome can't be found, set `CHROME_PATH` to the msedge.exe/chrome.exe path.
- Node ≥ 20 required. Dependencies live in `tools/browser-check/package.json`; reinstall with `cmd /c npm install` from that folder.