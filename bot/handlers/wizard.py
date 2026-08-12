import re

from aiogram import Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from bot.db.db import save_profile
from bot.services.numerology import get_arcana, get_zodiac, parse_birth_date

router = Router()


class BirthState(StatesGroup):
    date = State()
    time = State()
    place = State()


DATE_RE = re.compile(r"^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$")
TIME_RE = re.compile(r"^\s*(\d{1,2})[:h](\d{2})?\s*$")


def _skip_button(callback: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⏭ Пропустить", callback_data=callback)],
        ]
    )


async def start_wizard(message: Message, state: FSMContext):
    await state.clear()
    await state.set_state(BirthState.date)
    await message.answer(
        "🪐 Давай я тебя рассчитаю.\n\n"
        "Отправь дату рождения в формате **ДД.ММ.ГГГГ**, например: 12.05.1998"
    )


@router.message(BirthState.date)
async def ask_date(message: Message, state: FSMContext):
    raw = message.text or ""
    match = DATE_RE.match(raw)
    if not match:
        await message.answer("Не понял формат 😅 Нужно так: **12.05.1998**")
        return
    try:
        day, month, year = parse_birth_date(".".join(match.groups()))
    except ValueError:
        await message.answer("Такой даты не существует. Проверь день, месяц и год.")
        return
    await state.update_data(day=day, month=month, year=year, raw_birth_date=f"{day:02d}.{month:02d}.{year}")
    await state.set_state(BirthState.time)
    await message.answer(
        "⏰ Теперь время рождения, если знаешь, например: **14:30**.\n"
        "Оно нужно для восходящего знака — это необязательно.",
        reply_markup=_skip_button("skip_time"),
    )


@router.message(BirthState.time)
async def ask_time(message: Message, state: FSMContext):
    raw = (message.text or "").strip().lower()
    match = TIME_RE.match(raw)
    if not match:
        await message.answer("Напиши время как **HH:MM**, или нажми «Пропустить».")
        return
    hour = int(match.group(1))
    minute = int(match.group(2) or 0)
    if hour > 23 or minute > 59:
        await message.answer("Такого времени не бывает 🙂 Проверь часы и минуты.")
        return
    await state.update_data(birth_time=f"{hour:02d}:{minute:02d}")
    await state.set_state(BirthState.place)
    await message.answer(
        "📍 И место рождения — город. Например: **Москва**.\n"
        "Тоже необязательно, но добавит точности.",
        reply_markup=_skip_button("skip_place"),
    )


@router.message(BirthState.place)
async def ask_place(message: Message, state: FSMContext):
    place = (message.text or "").strip()
    if not place:
        await message.answer("Напиши название города, или нажми «Пропустить».")
        return
    await _finalize(message, state, place)


@router.callback_query(lambda callback: callback.data in ("skip_time", "skip_place"))
async def skip_step(callback: CallbackQuery, state: FSMContext):
    if callback.data == "skip_time":
        await state.update_data(birth_time="")
        await state.set_state(BirthState.place)
        await callback.message.answer(
            "⏰ Пропущено. 📍 Теперь город рождения? Например: **Москва**.",
            reply_markup=_skip_button("skip_place"),
        )
        return
    await callback.answer()
    await _finalize(callback.message, state, "")


async def _finalize(message: Message, state: FSMContext, place: str):
    data = await state.get_data()
    day, month, year = data["day"], data["month"], data["year"]
    birth_date = data["raw_birth_date"]
    birth_time = data.get("birth_time", "")

    zodiac = get_zodiac(day, month)
    arcana = get_arcana(day, month, year)

    await save_profile(
        telegram_id=message.from_user.id,
        username=message.from_user.username or "",
        birth_date=birth_date,
        birth_time=birth_time,
        birth_place=place,
        zodiac=zodiac,
        arcana=arcana,
    )
    await state.clear()
    await message.answer(
        f"✔️ Записано! Твой знак — **{zodiac}**, я получил все данные.\n"
        "Сейчас соберу разбор личности…"
    )
    from bot.db.db import get_user
    from bot.handlers.report import send_report

    user = await get_user(message.from_user.id)
    await send_report(message, user)