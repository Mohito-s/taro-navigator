from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from bot.config import MINI_APP_URL
from bot.db.db import get_user
from bot.handlers import daily, payment, report, wizard

router = Router()

_main_menu_rows = [
    [InlineKeyboardButton(text="🌙 Мой разбор", callback_data="my_report")],
    [InlineKeyboardButton(text="🃏 Карта дня", callback_data="daily_card")],
    [InlineKeyboardButton(text="✨ Полный разбор", callback_data="full_report")],
    [InlineKeyboardButton(text="ℹ️ О боте", callback_data="about")],
]
if MINI_APP_URL:
    _main_menu_rows.insert(
        0,
        [InlineKeyboardButton(text="🪐 Открыть мини-апп", web_app=WebAppInfo(url=MINI_APP_URL))],
    )

MAIN_MENU = InlineKeyboardMarkup(inline_keyboard=_main_menu_rows)


def _yield_arcana_block(item: dict) -> str:
    from bot.texts.arcana_base import ARCANA

    card = ARCANA[item["number"]]
    return f"🃏 {item['title']} — **{card['name']}** ({card['keyword']})"


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "Привет! Я — космический навигатор 🌌\n\n"
        "Опишу твою личность по знаку зодиака, 22 арканам Таро и числам твоей даты рождения. "
        "Всё, что нужно — дата, время и место рождения.",
        reply_markup=MAIN_MENU,
    )


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("Отменено. Возвращаюсь в меню.", reply_markup=MAIN_MENU)


@router.callback_query(F.data == "my_report")
async def cb_my_report(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    user = await get_user(callback.from_user.id)
    if user and user["birth_date"]:
        await report.send_report(callback.message, user)
    else:
        await wizard.start_wizard(callback.message, state)


@router.callback_query(F.data == "regenerate")
async def cb_regenerate(callback: CallbackQuery):
    await callback.answer("Пересоздаю разбор…")
    user = await get_user(callback.from_user.id)
    if user and user["birth_date"]:
        await report.send_report(callback.message, user)
    else:
        await callback.message.answer(
            "Сначала заполни данные: нажми «🌙 Мой разбор»."
        )


@router.callback_query(F.data == "daily_card")
async def cb_daily_card(callback: CallbackQuery):
    await callback.answer()
    await daily.send_card(callback.message)


@router.callback_query(F.data == "full_report")
async def cb_full_report(callback: CallbackQuery):
    await callback.answer()
    user = await get_user(callback.from_user.id)
    if not user or not user["birth_date"]:
        await callback.message.answer(
            "Сначала сделай бесплатный разбор — там я спрошу дату рождения."
        )
        return
    if user["full_report_paid"]:
        await callback.message.answer("Твой полный разбор уже оплачен. Генерирую заново…")
        await report.send_report(callback.message, user, full=True)
        return
    await callback.message.answer(
        f"Полный разбор стоит {payment.PRICE_STARS} ⭐ Telegram Stars.\n\n"
        "Ты получишь подробный портрет по всем 10 арканам судьбы, сгенерированный ИИ: "
        "сильные стороны, любовь, кармические уроки и совет из космоса.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⭐ Оплатить разбор", callback_data="pay_full")],
                [InlineKeyboardButton(text="🔙 В меню", callback_data="back_menu")],
            ]
        ),
    )


@router.callback_query(F.data == "pay_full")
async def cb_pay_full(callback: CallbackQuery):
    await callback.answer()
    await payment.send_star_invoice(callback.message)


@router.callback_query(F.data == "about")
async def cb_about(callback: CallbackQuery):
    await callback.answer()
    await callback.message.answer(
        "🌌 **Что я умею**\n\n"
        "• Вычисляю твой знак зодиака и 10 арканов судьбы по дате рождения\n"
        "• Собираю детерминированную базу 22 старших арканов Таро и 12 знаков\n"
        "• ИИ-движок превращает её в персональный разбор личности\n"
        "• Полный портрет — за Telegram Stars\n\n"
        "Напиши /start и нажми «🌙 Мой разбор».",
        reply_markup=MAIN_MENU,
    )


@router.callback_query(F.data == "back_menu")
async def cb_back_menu(callback: CallbackQuery):
    await callback.answer()
    await callback.message.answer("Чем займёмся дальше?", reply_markup=MAIN_MENU)