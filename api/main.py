"""TARO API — мини-апп делает полные ИИ-разборы прямо на своих вкладках.

Единый источник правды — промты и стили из bot/services/ai.py.
Деплой: uvicorn api.main:app --host 127.0.0.1 --port 8001 (pm2 taro-api),
наружу отдаётся nginx'ом на shadowlinkapp.online/api.
"""

import asyncio
import hashlib
import hmac
import json
import logging
import time
from urllib.parse import unquote

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from bot.config import BOT_TOKEN
from bot.services import ai as ai_service
from bot.services import numerology

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("taro-api")

app = FastAPI(title="TARO API", version="1.0.0")

# Сайт живёт на shadowlinkapp.online (свой сервер); GitHub Pages оставлен как запасной
# хост. Запросы со своего домена — same-origin (CORS не нужен), GitHub Pages — разрешён.
ALLOWED_ORIGINS = [
    "https://shadowlinkapp.online",
    "https://mohito-s.github.io",
    "null",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Простейшая защита от спама: лимит запросов на IP + ограничение конкурентности.
RATE_LIMIT_PER_MIN = 30
REQUESTS: dict[str, list[float]] = {}
SEMAPHORE = asyncio.Semaphore(3)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "?"


def _rate_limited(ip: str, limit: int = RATE_LIMIT_PER_MIN, window: float = 60.0) -> bool:
    now = time.time()
    hits = [t for t in REQUESTS.get(ip, []) if now - t < window]
    if len(hits) >= limit:
        REQUESTS[ip] = hits
        return True
    hits.append(now)
    REQUESTS[ip] = hits
    return False


def _validate_init_data(init_data: str) -> bool:
    """Проверка подписи Telegram WebApp initData (чтобы API звали реальные пользователи)."""
    try:
        pairs: dict[str, str] = {}
        for kv in init_data.split("&"):
            if "=" not in kv:
                continue
            k, v = kv.split("=", 1)
            pairs[k] = unquote(v)
        signature = pairs.pop("hash", None)
        if not signature:
            return False
        data_check = "\n".join(f"{k}={pairs[k]}" for k in sorted(pairs))
        secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calc = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(calc, signature)
    except Exception:
        return False


def _natal_user(req: "NatalIn", request: Request) -> dict:
    """Собирает профиль в формате бота из запроса мини-аппа."""
    birth_date = f"{req.day:02d}.{req.month:02d}.{req.year}"
    chart = req.chart or None
    return {
        "zodiac": numerology.get_zodiac(req.day, req.month),
        "birth_date": birth_date,
        "birth_time": req.time or "",
        "birth_place": req.city or "",
        "planets": json.dumps(chart, ensure_ascii=False) if chart else "{}",
        "style": req.style or "",
    }


def _arcana_user(req: "ArcanaIn") -> dict:
    """Арканы судьбы считаем серверно (не доверяем клиенту) — единый алгоритм."""
    arcana = numerology.get_arcana(req.day, req.month, req.year)
    return {
        "zodiac": numerology.get_zodiac(req.day, req.month),
        "birth_date": f"{req.day:02d}.{req.month:02d}.{req.year}",
        "arcana": json.dumps(arcana, ensure_ascii=False),
        "style": req.style or "",
    }


class NatalIn(BaseModel):
    day: int
    month: int
    year: int
    time: str = ""
    city: str = ""
    name: str = ""
    style: str = ""
    chart: dict | None = None
    initData: str = ""


class ArcanaIn(BaseModel):
    day: int
    month: int
    year: int
    arcana_n: int
    style: str = ""
    initData: str = ""


class ForecastIn(BaseModel):
    day: int
    month: int
    year: int
    horizon: str = "day"
    chart: dict | None = None
    style: str = ""
    initData: str = ""


async def _guard(request: Request, init_data: str) -> None:
    ip = _client_ip(request)
    if _rate_limited(ip):
        raise HTTPException(status_code=429, detail="Слишком много запросов. Подожди минуту.")
    if init_data and not _validate_init_data(init_data):
        raise HTTPException(status_code=401, detail="Неверная подпись Telegram.")


@app.get("/api/health")
async def health():
    return {"ok": True, "service": "taro-api"}


@app.post("/api/v1/natal")
async def natal(request: Request, body: NatalIn):
    await _guard(request, body.initData)
    user = _natal_user(body, request)
    async with SEMAPHORE:
        text = await ai_service.generate_natal_forecast(user)
    return {"text": text}


@app.post("/api/v1/arcana")
async def arcana(request: Request, body: ArcanaIn):
    await _guard(request, body.initData)
    user = _arcana_user(body)
    async with SEMAPHORE:
        text = await ai_service.generate_arcana_forecast(user, body.arcana_n)
    return {"text": text}


@app.post("/api/v1/forecast")
async def forecast(request: Request, body: ForecastIn):
    await _guard(request, body.initData)
    chart = body.chart or None
    user = {
        "zodiac": numerology.get_zodiac(body.day, body.month),
        "birth_date": f"{body.day:02d}.{body.month:02d}.{body.year}",
        "planets": json.dumps(chart, ensure_ascii=False) if chart else "{}",
        "style": body.style or "",
    }
    async with SEMAPHORE:
        text = await ai_service.generate_period_forecast(user, body.horizon)
    return {"text": text}