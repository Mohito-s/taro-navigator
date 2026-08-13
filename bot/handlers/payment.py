from aiogram import F, Router
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice, Message, PreCheckoutQuery

from bot.db.db import get_user, set_paid
from bot.handlers.report import send_report

router = Router()

PAYMENT_PAYLOAD = "full-report-v1"
PRICE_STARS = 10

MENU_AFTER_PAY = InlineKeyboardMarkup(
    inline_keyboard=[
        [InlineKeyboardButton(text="🔙 В меню", callback_data="back_menu")],
    ]
)


async def send_star_invoice(message: Message):
    await message.answer_invoice(
        title="Полный разбор личности",
        description="Глубокий портрет по всем 10 арканам судьбы: сильные стороны, любовь, кармические уроки и совет из космоса. Генерируется ИИ за секунды.",
        payload=PAYMENT_PAYLOAD,
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label="Полный разбор", amount=PRICE_STARS)],
    )


@router.message(F.successful_payment)
async def on_successful_payment(message: Message):
    await set_paid(message.from_user.id)
    await message.answer(
        f"⭐ Оплата прошла успешно! Спасибо за доверие.\n"
        "Генерирую полный разбор…",
        reply_markup=MENU_AFTER_PAY,
    )
    user = await get_user(message.from_user.id)
    await send_report(message, user, full=True)


async def pre_checkout(pre_checkout_query: PreCheckoutQuery):
    await pre_checkout_query.answer(ok=True)


def setup(dp):
    dp.pre_checkout_query.register(pre_checkout)