import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand

from bot.config import BOT_TOKEN, MINI_APP_URL
from bot.db import db as db_module
from bot.handlers import daily, payment, report, start, webapp, wizard


async def main():
    logging.basicConfig(level=logging.INFO)

    await db_module.init_db()

    bot = Bot(BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())

    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Главное меню"),
            BotCommand(command="card", description="Карта дня"),
            BotCommand(command="cancel", description="Отменить"),
        ]
    )
    await bot.set_my_description(
        "Космический навигатор: опишу твою личность по знаку зодиака, "
        "22 арканам Таро и числам даты рождения. Полный разбор — за Telegram Stars."
    )
    await bot.set_my_short_description(
        "Таро · Астрология · Нумерология — разбор личности по дате рождения"
    )
    # Мини-апп открывается обычной кнопкой «🪐 Мини-апп» в меню /start —
    # персистентный MenuButtonWebApp ставить нельзя: он заменяет меню чата.

    dp.include_routers(start.router, wizard.router, daily.router, payment.router, webapp.router)
    payment.setup(dp)

    logging.info("Bot started")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())