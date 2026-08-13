import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

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
    if MINI_APP_URL:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text="🪐 Мини-апп", web_app=WebAppInfo(url=MINI_APP_URL))
        )

    dp.include_routers(start.router, wizard.router, daily.router, payment.router, webapp.router)
    payment.setup(dp)

    logging.info("Bot started")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())