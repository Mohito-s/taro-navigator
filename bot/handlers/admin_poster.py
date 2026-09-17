import logging
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from bot import config
from bot.services.channel_poster import publish_daily_card

logger = logging.getLogger(__name__)
router = Router()


@router.message(Command("my_id"))
async def cmd_my_id(message: Message):
    """Показывает ID пользователя и ID текущего чата."""
    await message.answer(
        f"👤 Твой Telegram ID: <code>{message.from_user.id}</code>\n"
        f"💬 ID этого чата: <code>{message.chat.id}</code>\n"
        f"📢 Текущий канал для постов: <code>{config.CHANNEL_ID}</code>",
        parse_mode="HTML",
    )


@router.message(Command("test_card"))
async def cmd_test_card(message: Message):
    """Генерирует и отправляет предпросмотр поста админу в личку."""
    if message.from_user.id != config.ADMIN_ID:
        return

    status_msg = await message.answer("🔮 Генерирую карту дня через ИИ...")
    success = await publish_daily_card(message.bot, target_chat_id=message.chat.id)
    try:
        await status_msg.delete()
    except Exception:
        pass

    if not success:
        await message.answer("⚠️ Ошибка генерации поста. Проверь логи бота.")


@router.message(Command("post_card"))
async def cmd_post_card(message: Message):
    """Публикует карту дня в канал прямо сейчас."""
    if message.from_user.id != config.ADMIN_ID:
        return

    status_msg = await message.answer(
        f"⏳ Создаю пост и отправляю в канал <code>{config.CHANNEL_ID}</code>...",
        parse_mode="HTML",
    )
    success = await publish_daily_card(message.bot, target_chat_id=config.CHANNEL_ID)
    try:
        await status_msg.delete()
    except Exception:
        pass

    if success:
        await message.answer(
            f"✅ <b>Пост успешно опубликован в канале!</b>\nКанал: <code>{config.CHANNEL_ID}</code>",
            parse_mode="HTML",
        )
    else:
        await message.answer(
            f"❌ <b>Не удалось опубликовать пост в канал</b> <code>{config.CHANNEL_ID}</code>.\n\n"
            f"Убедись, что бот добавлен в канал и у него есть права администратора (публикация сообщений).\n"
            f"Если ID канала изменился, используй: <code>/set_channel -100...</code>",
            parse_mode="HTML",
        )


@router.message(Command("set_channel"))
async def cmd_set_channel(message: Message):
    """Позволяет админу сменить ID канала на лету."""
    if message.from_user.id != config.ADMIN_ID:
        return

    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        await message.answer(
            f"ℹ️ Использование: <code>/set_channel -100xxxxxxxxxx</code>\n"
            f"Текущий канал: <code>{config.CHANNEL_ID}</code>",
            parse_mode="HTML",
        )
        return

    new_id = parts[1].strip()
    config.CHANNEL_ID = new_id
    await message.answer(
        f"✅ ID канала обновлён на: <code>{new_id}</code>!\n"
        f"Теперь попробуй команду <code>/post_card</code>",
        parse_mode="HTML",
    )
