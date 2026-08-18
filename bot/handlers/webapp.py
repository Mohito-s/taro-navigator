import html
import json

from aiogram import F, Router
from aiogram.types import Message

from bot.db.db import save_profile, get_user, set_style
from bot.handlers.report import send_report, send_natal_forecast, send_arcana_forecast
from bot.handlers.start import MAIN_MENU
from bot.services.numerology import get_arcana, get_zodiac

router = Router()

ALLOWED_STYLES = {
    "Космо",
    "Гендальф Серый",
    "Доктор Стрэндж",
    "Мастер Йода",
    "Дамблдор",
}


def _valid(day: int, month: int, year: int) -> bool:
    return 1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2100


@router.message(F.web_app_data)
async def on_web_app_data(message: Message):
    raw = message.web_app_data.data if message.web_app_data else ""
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        await message.answer("⚠️ Не удалось разобрать данные из мини-аппа.")
        return

    if data.get("type") == "style":
        style = str(data.get("style", "") or "").strip()[:40]
        if style not in ALLOWED_STYLES:
            await message.answer(f"⚠️ Стиль «{html.escape(style) or '—'}» не поддерживается.")
            return
        await set_style(message.from_user.id, style)
        await message.answer(
            f"🎙 Теперь звёзды говорят с тобой голосом <b>{html.escape(style)}</b>.",
            parse_mode="HTML",
            reply_markup=MAIN_MENU,
        )
        return

    try:
        day = int(data.get("day", 0))
        month = int(data.get("month", 0))
        year = int(data.get("year", 0))
    except (TypeError, ValueError):
        await message.answer("⚠️ Некорректные данные рождения.")
        return

    if not _valid(day, month, year):
        await message.answer("⚠️ Переданы некорректные данные рождения.")
        return

    zodiac = get_zodiac(day, month)
    arcana = get_arcana(day, month, year)
    birth_date = f"{day:02d}.{month:02d}.{year}"
    birth_time = str(data.get("time", "") or "").strip()[:20]
    birth_place = str(data.get("city", "") or "").strip()[:80]
    birth_name = str(data.get("name", "") or "").strip()[:40]
    chart = data.get("chart")
    planets_json = json.dumps(chart, ensure_ascii=False) if isinstance(chart, dict) else "{}"
    user = message.from_user

    await save_profile(
        telegram_id=user.id,
        username=user.username or user.first_name or "",
        name=birth_name,
        birth_date=birth_date,
        birth_time=birth_time,
        birth_place=birth_place,
        zodiac=zodiac,
        arcana=arcana,
        planets=planets_json,
    )

    if data.get("type") == "natal":
        who = html.escape(birth_name) or "Профиль"
        planets_count = len(chart.get("planets", [])) if isinstance(chart, dict) and chart.get("planets") else 0
        planets_line = f"\n🪐 Планет рассчитано: <b>{planets_count}</b>" if planets_count else ""
        await message.answer(
            f"🪐 <b>Натальная карта {f'для {who} ' if birth_name else ''}сохранена</b> — теперь это твой фундамент.\n\n"
            f"📅 Дата: {birth_date}\n"
            f"🕐 Время: {html.escape(birth_time) or 'не указано'}\n"
            f"📍 Город: {html.escape(birth_place) or 'не указано'}\n"
            f"♈ Знак: <b>{zodiac}</b>\n"
            f"🃏 Арканов рассчитано: {len(arcana)}"
            f"{planets_line}\n\n"
            "Она уже используется в раскладах и прогнозах.",
            parse_mode="HTML",
            reply_markup=MAIN_MENU,
        )
        return

    if data.get("type") == "buy":
        await message.answer(
            f"✅ Профиль сохранён ({zodiac}). Генерирую полный ИИ-разбор…",
            parse_mode="HTML",
        )
        user = await get_user(message.from_user.id)
        if user:
            await send_report(message, user, full=True)
        return

    if data.get("type") == "natal_forecast":
        await message.answer(
            "🪐 Считаю расширенный прогноз по твоей натальной карте…",
            parse_mode="HTML",
        )
        user = await get_user(message.from_user.id)
        if user:
            await send_natal_forecast(message, user)
        return

    if data.get("type") == "arcana":
        try:
            arcana_n = int(data.get("arcana_n", -1))
        except (TypeError, ValueError):
            arcana_n = -1
        if not (0 <= arcana_n <= 21):
            await message.answer("⚠️ Не удалось понять, какой аркан тебя интересует.")
            return
        await message.answer("🔮 Готовлю расширенный разбор аркана…", parse_mode="HTML")
        user = await get_user(message.from_user.id)
        if user:
            await send_arcana_forecast(message, user, arcana_n)
        return

    await message.answer(
        f"✅ Профиль сохранён!\n\n"
        f"♈ Знак: <b>{zodiac}</b>\n"
        f"🃏 Арканов судьбы рассчитано: {len(arcana)}\n\n"
        "Что дальше?",
        reply_markup=MAIN_MENU,
        parse_mode="HTML",
    )
