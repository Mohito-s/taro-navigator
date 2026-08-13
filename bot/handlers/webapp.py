import json

from aiogram import F, Router
from aiogram.types import Message

from bot.config import TEST_MODE
from bot.db.db import save_profile, get_user
from bot.handlers.payment import send_star_invoice
from bot.handlers.report import send_report
from bot.handlers.start import MAIN_MENU
from bot.services.numerology import get_arcana, get_zodiac

router = Router()


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
    user = message.from_user

    await save_profile(
        telegram_id=user.id,
        username=user.username or user.first_name or "",
        birth_date=birth_date,
        birth_time="",
        birth_place="",
        zodiac=zodiac,
        arcana=arcana,
    )

    if data.get("type") == "buy":
        if TEST_MODE:
            await message.answer(
                f"🧪 <b>ТЕСТОВЫЙ РЕЖИМ</b>: оплата Stars отключена.\n"
                f"✅ Профиль сохранён ({zodiac}). Генерирую полный ИИ-разбор…",
                parse_mode="HTML",
            )
            user = await get_user(message.from_user.id)
            if user:
                await send_report(message, user, full=True)
            return

        await message.answer(
            f"✅ Профиль сохранён ({zodiac}). Запускаю оплату полного ИИ-разбора…"
        )
        await send_star_invoice(message)
        return

    await message.answer(
        f"✅ Профиль сохранён!\n\n"
        f"♈ Знак: <b>{zodiac}</b>\n"
        f"🃏 Арканов судьбы рассчитано: {len(arcana)}\n\n"
        "Что дальше?",
        reply_markup=MAIN_MENU,
        parse_mode="HTML",
    )
