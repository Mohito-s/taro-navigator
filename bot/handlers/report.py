import html
import json

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message

from bot.services import ai
from bot.texts.arcana_base import ARCANA
from bot.texts.zodiac_base import ZODIAC

NEXT_MENU = InlineKeyboardMarkup(
    inline_keyboard=[
        [InlineKeyboardButton(text="✨ Полный разбор", callback_data="full_report")],
        [InlineKeyboardButton(text="🔮 Пересоздать разбор", callback_data="regenerate")],
        [InlineKeyboardButton(text="🔙 В меню", callback_data="back_menu")],
    ]
)


def _format_profile(user: dict, full: bool = False) -> str:
    arcana = json.loads(user.get("arcana") or "[]")
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)

    place = html.escape(user.get("birth_place") or "не указано")
    day_time = html.escape(user.get("birth_time") or "")

    lines = [
        "🌌 <b>КОСМИЧЕСКИЙ ПАСПОРТ</b>",
        "",
        f"📅 Дата рождения: <b>{html.escape(user['birth_date'])}</b>"
        + (f", {day_time}" if day_time else ""),
        f"📍 Место рождения: <b>{place}</b>",
        "",
    ]
    if sign:
        lines.append(
            f"♈ Знак: <b>{html.escape(zodiac)}</b>\n"
            f"    Стихия: {sign['element']} · Планета: {sign['planet']}"
        )
        lines.append("")
    lines.append("🃏 <b>Твои арканы судьбы</b>")
    for item in arcana:
        card = ARCANA[item["number"]]
        lines.append(
            f"{html.escape(item['title'])} — <b>{html.escape(card['name'])}</b> "
            f"({html.escape(card['keyword'])})"
        )
    return "\n".join(lines)


async def send_report(message: Message, user: dict, full: bool = False):
    await message.answer(_format_profile(user, full), parse_mode="HTML")

    await message.answer(
        "⌛️ Генерация разбора… Это займёт несколько секунд."
    )
    text = await ai.generate_personality(user, full=full)
    header = "🔮 Разбор личности (полный)" if full else "🔮 Разбор личности"
    await message.answer(f"{header}\n\n{text}", reply_markup=NEXT_MENU)


async def send_natal_forecast(message: Message, user: dict):
    await message.answer(
        "⌛️ Считаю звёзды по твоей натальной карте… Это займёт несколько секунд."
    )
    text = await ai.generate_natal_forecast(user)
    await message.answer(
        f"🪐 <b>Расширенный прогноз по натальной карте</b>\n\n{text}",
        parse_mode="HTML",
        reply_markup=NEXT_MENU,
    )


async def send_arcana_forecast(message: Message, user: dict, arcana_number: int):
    await message.answer(
        "⌛️ Готовлю расширенный разбор аркана… Это займёт несколько секунд."
    )
    text = await ai.generate_arcana_forecast(user, arcana_number)
    await message.answer(
        f"🔮 <b>Расширенный разбор аркана</b>\n\n{text}",
        parse_mode="HTML",
        reply_markup=NEXT_MENU,
    )