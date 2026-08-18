import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

from bot.config import BOT_TOKEN, MINI_APP_URL
from bot.db import db as db_module
from bot.handlers import daily, report, start, webapp, wizard


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
        "22 арканам Таро и числам даты рождения. Полный разбор — бесплатно."
    )
    await bot.set_my_short_description(
        "Таро · Астрология · Нумерология — разбор личности по дате рождения"
    )
    # Персистентная кнопка «open» — она уже была закреплена на стороне Telegram
    # от прежних запусков (тайтл «Мини-апп»). Перевыставляем её с простым
    # именем «open»: отдельная кнопка открывает мини-апп, меню /start — внутри бота.
    if MINI_APP_URL:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text="open", web_app=WebAppInfo(url=MINI_APP_URL))
        )

    dp.include_routers(start.router, wizard.router, daily.router, webapp.router)

    logging.info("Bot started")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())