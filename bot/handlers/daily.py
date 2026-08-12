import random

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from bot.texts.arcana_base import ARCANA

router = Router()

CARD_OF_DAY_NUMS = list(ARCANA.keys())


def _pick_card() -> tuple[int, dict]:
    number = random.choice(CARD_OF_DAY_NUMS)
    return number, ARCANA[number]


@router.message(Command("card"))
async def cmd_card(message: Message):
    await send_card(message)


async def send_card(message: Message):
    number, card = _pick_card()
    text = (
        "🃏 **Карта дня**\n\n"
        f"Сегодня твой проводник — **{card['name']}**\n"
        f"*{card['keyword']}*\n\n"
        f"{card['text']}\n\n"
        "Прислушайся к подсказке — и день сложится удачно ✨"
    )
    await message.answer(text, parse_mode="Markdown")