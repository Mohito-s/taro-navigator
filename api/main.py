"""TARO API — мини-апп делает полные ИИ-разборы прямо на своих вкладках.

Единый источник правды — промты и стили из bot/services/ai.py.
Деплой: uvicorn api.main:app --host 127.0.0.1 --port 8001 (pm2 taro-api),
наружу отдаётся nginx'ом на shadowlinkapp.online/api.
"""

import asyncio
import hashlib
import hmac
import html
import json
import logging
import time
import uuid
from pathlib import Path
from urllib.parse import unquote

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from bot.config import BOT_TOKEN, MINI_APP_URL
from bot.db import db
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
if MINI_APP_URL and MINI_APP_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(MINI_APP_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.herokuapp\.com",
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


RESTORE_REQUESTS: dict[str, list[float]] = {}


def _rate_limited(ip: str, limit: int = RATE_LIMIT_PER_MIN, window: float = 60.0) -> bool:
    now = time.time()
    hits = [t for t in REQUESTS.get(ip, []) if now - t < window]
    if len(hits) >= limit:
        REQUESTS[ip] = hits
        return True
    hits.append(now)
    REQUESTS[ip] = hits
    return False


def _restore_rate_limited(ip: str, limit: int = 10, window: float = 60.0) -> bool:
    """Защита от перебора кодов восстановления: не более 10 попыток в минуту."""
    now = time.time()
    hits = [t for t in RESTORE_REQUESTS.get(ip, []) if now - t < window]
    if len(hits) >= limit:
        RESTORE_REQUESTS[ip] = hits
        return True
    hits.append(now)
    RESTORE_REQUESTS[ip] = hits
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


class TarotReadingIn(BaseModel):
    spread_type: str
    cards: list[dict]
    question: str = ""
    style: str = ""
    day: int | None = None
    month: int | None = None
    year: int | None = None
    initData: str = ""


class SaveProfileIn(BaseModel):
    session_id: str = ""
    day: int
    month: int
    year: int
    time: str = ""
    city: str = ""
    name: str = ""
    style: str = ""
    chart: dict | None = None
    initData: str = ""


class SyncSessionIn(BaseModel):
    session_id: str = ""
    initData: str = ""


class SyncRestoreIn(BaseModel):
    session_id: str
    recovery_code: str


class SyncHistoryIn(BaseModel):
    session_id: str
    history: list[dict] = []
    initData: str = ""


def _extract_telegram_user(init_data: str) -> dict | None:
    try:
        for kv in init_data.split("&"):
            if kv.startswith("user="):
                val = unquote(kv.split("=", 1)[1])
                return json.loads(val)
    except Exception:
        pass
    return None


@app.on_event("startup")
async def on_startup():
    await db.init_db()


async def _guard(request: Request, init_data: str) -> None:
    ip = _client_ip(request)
    if _rate_limited(ip):
        raise HTTPException(status_code=429, detail="Слишком много запросов. Подожди минуту.")
    if init_data and not _validate_init_data(init_data):
        raise HTTPException(status_code=401, detail="Неверная подпись Telegram.")


@app.get("/api/health")
async def health():
    return {"ok": True, "service": "taro-api"}


@app.post("/api/v1/save_profile")
async def save_profile(request: Request, body: SaveProfileIn):
    await _guard(request, body.initData)
    birth_date = f"{body.day:02d}.{body.month:02d}.{body.year}"
    zodiac = numerology.get_zodiac(body.day, body.month)
    arcana = numerology.get_arcana(body.day, body.month, body.year)
    chart_json = json.dumps(body.chart, ensure_ascii=False) if body.chart else "{}"

    safe_name = html.escape(body.name.strip())
    safe_city = html.escape(body.city.strip())
    safe_time = html.escape(body.time.strip())

    tg_user = _extract_telegram_user(body.initData) if body.initData else None
    if tg_user and "id" in tg_user:
        await db.save_profile(
            telegram_id=tg_user["id"],
            username=tg_user.get("username", ""),
            birth_date=birth_date,
            birth_time=safe_time,
            birth_place=safe_city,
            zodiac=zodiac,
            arcana=arcana,
            name=safe_name,
            planets=chart_json,
        )
        if body.style:
            await db.set_style(tg_user["id"], body.style)
        return {"ok": True, "saved_to": "telegram", "telegram_id": tg_user["id"]}

    session_id = body.session_id.strip() or str(uuid.uuid4())
    await db.save_web_profile(
        session_id=session_id,
        birth_date=birth_date,
        birth_time=safe_time,
        birth_place=safe_city,
        zodiac=zodiac,
        arcana=arcana,
        name=safe_name,
        planets=chart_json,
        style=body.style or "cosmo",
    )
    return {"ok": True, "saved_to": "web_db", "session_id": session_id}


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


@app.post("/api/v1/tarot_reading")
async def tarot_reading(request: Request, body: TarotReadingIn):
    await _guard(request, body.initData)
    user = {}
    if body.day and body.month:
        user["zodiac"] = numerology.get_zodiac(body.day, body.month)
    if body.style:
        user["style"] = body.style
    async with SEMAPHORE:
        text = await ai_service.generate_tarot_reading(
            spread_type=body.spread_type,
            cards=body.cards,
            question=body.question,
            user=user,
        )
    return {"text": text}


@app.post("/api/v1/sync/session")
async def sync_session(request: Request, body: SyncSessionIn):
    """Инициализация или получение веб-сессии с кодом восстановления."""
    await _guard(request, body.initData)
    session_id = body.session_id.strip() or str(uuid.uuid4())

    tg_user = _extract_telegram_user(body.initData) if body.initData else None
    if tg_user and "id" in tg_user:
        code = await db.get_or_create_user_recovery_code(tg_user["id"])
        user_row = await db.get_user(tg_user["id"])
        return {
            "ok": True,
            "session_id": session_id,
            "recovery_code": code,
            "source": "telegram",
            "profile": user_row,
        }

    profile = await db.get_or_create_web_profile(session_id)
    return {
        "ok": True,
        "session_id": profile["session_id"],
        "recovery_code": profile.get("recovery_code", ""),
        "source": "web",
        "profile": profile,
    }


@app.post("/api/v1/sync/restore")
async def sync_restore(request: Request, body: SyncRestoreIn):
    """Восстановление профиля и истории по коду восстановления (защита от брутфорса)."""
    ip = _client_ip(request)
    if _restore_rate_limited(ip):
        raise HTTPException(
            status_code=429,
            detail="Слишком много попыток ввода кода. Подожди 1 минуту перед следующей попыткой.",
        )

    code = body.recovery_code.strip().upper()
    if len(code) < 6 or len(code) > 16:
        raise HTTPException(status_code=400, detail="Неверный формат кода восстановления.")

    session_id = body.session_id.strip() or str(uuid.uuid4())
    synced = await db.sync_web_profile_with_code(session_id, code)
    if not synced:
        raise HTTPException(
            status_code=404,
            detail="Код восстановления не найден. Проверь правильность ввода символов.",
        )

    # Десериализуем JSON-поля для клиента
    try:
        history_list = json.loads(synced.get("history", "[]"))
    except Exception:
        history_list = []

    try:
        arcana_list = json.loads(synced.get("arcana", "[]"))
    except Exception:
        arcana_list = []

    try:
        planets_data = json.loads(synced.get("planets", "{}"))
    except Exception:
        planets_data = {}

    return {
        "ok": True,
        "synced": True,
        "recovery_code": synced.get("recovery_code", code),
        "profile": {
            "name": synced.get("name", ""),
            "birth_date": synced.get("birth_date", ""),
            "birth_time": synced.get("birth_time", ""),
            "birth_place": synced.get("birth_place", ""),
            "zodiac": synced.get("zodiac", ""),
            "style": synced.get("style", "cosmo"),
            "arcana": arcana_list,
            "planets": planets_data,
        },
        "history": history_list,
    }


@app.post("/api/v1/sync/history")
async def sync_history(request: Request, body: SyncHistoryIn):
    """Фоновое сохранение истории разборов на сервере."""
    await _guard(request, body.initData)
    if not body.session_id:
        return {"ok": False, "detail": "no_session"}

    await db.save_web_history(body.session_id, body.history)
    return {"ok": True, "count": len(body.history)}


# ==============================================================================
# Статические файлы для standalone / Heroku хостинга
# ==============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent

if (BASE_DIR / "css").is_dir():
    app.mount("/css", StaticFiles(directory=str(BASE_DIR / "css")), name="css")
if (BASE_DIR / "js").is_dir():
    app.mount("/js", StaticFiles(directory=str(BASE_DIR / "js")), name="js")
if (BASE_DIR / "img").is_dir():
    app.mount("/img", StaticFiles(directory=str(BASE_DIR / "img")), name="img")
if (BASE_DIR / "books").is_dir():
    app.mount("/books", StaticFiles(directory=str(BASE_DIR / "books")), name="books")


@app.api_route("/", methods=["GET", "HEAD"])
async def serve_index():
    index_path = BASE_DIR / "index.html"
    if index_path.is_file():
        return FileResponse(str(index_path))
    return {"ok": True, "service": "taro-api"}


@app.api_route("/arcana", methods=["GET", "HEAD"])
async def serve_arcana_catalog_clean():
    f = BASE_DIR / "arcana.html"
    if f.is_file():
        return FileResponse(str(f))
    raise HTTPException(status_code=404, detail="Page not found")


@app.api_route("/arcan-{num}", methods=["GET", "HEAD"])
async def serve_arcan_page_clean(num: int):
    f = BASE_DIR / f"arcan-{num}.html"
    if f.is_file():
        return FileResponse(str(f))
    raise HTTPException(status_code=404, detail="Page not found")


@app.api_route("/{page}.html", methods=["GET", "HEAD"])
async def serve_html_page(page: str):
    page_file = BASE_DIR / f"{page}.html"
    if page_file.is_file():
        return FileResponse(str(page_file))
    raise HTTPException(status_code=404, detail="Page not found")


@app.api_route("/favicon.jpg", methods=["GET", "HEAD"])
async def serve_favicon():
    f = BASE_DIR / "favicon.jpg"
    if f.is_file():
        return FileResponse(str(f))
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.api_route("/favicon.ico", methods=["GET", "HEAD"])
async def serve_favicon_ico():
    f = BASE_DIR / "favicon.jpg"
    if f.is_file():
        return FileResponse(str(f))
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.api_route("/robots.txt", methods=["GET", "HEAD"])
async def serve_robots():
    f = BASE_DIR / "robots.txt"
    if f.is_file():
        return FileResponse(str(f))
    raise HTTPException(status_code=404, detail="Robots.txt not found")


@app.api_route("/sitemap.xml", methods=["GET", "HEAD"])
async def serve_sitemap():
    f = BASE_DIR / "sitemap.xml"
    if f.is_file():
        return FileResponse(str(f), media_type="application/xml")
    raise HTTPException(status_code=404, detail="Sitemap not found")


@app.api_route("/mobile_main.png", methods=["GET", "HEAD"])
async def serve_mobile_main():
    f = BASE_DIR / "mobile_main.png"
    if f.is_file():
        return FileResponse(str(f))
    raise HTTPException(status_code=404, detail="Image not found")