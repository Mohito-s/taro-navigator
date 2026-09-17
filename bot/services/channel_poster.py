import asyncio
import datetime
import logging
import os
import random

from aiogram import Bot
from aiogram.types import (
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
)

from bot.config import ADMIN_ID, CHANNEL_ID, MINI_APP_URL
from bot.services.ai import _chat
from bot.texts.arcana_base import ARCANA

logger = logging.getLogger(__name__)

# Маппинг изображений для старших арканов
CARD_IMAGE_MAP = {
    0: "00-fool.jpg",
    1: "01-magician.jpg",
    2: "02-priestess.jpg",
    3: "03-empress.jpg",
    4: "04-emperor.jpg",
    5: "05-hierophant.jpg",
    6: "06-lovers.jpg",
    7: "07-chariot.jpg",
    8: "08-strength.jpg",
    9: "09-hermit.jpg",
    10: "10-wheel.jpg",
    11: "11-justice.jpg",
    12: "12-hanged.jpg",
    16: "16-tower.jpg",
    18: "18-moon.jpg",
    19: "19-sun.jpg",
    20: "20-judgement.jpg",
    21: "21-world.jpg",
}


def get_card_photo_path(card_num: int) -> str | None:
    """Проверяет наличие локального файла иллюстрации аркана."""
    filename = CARD_IMAGE_MAP.get(card_num)
    if not filename:
        return None
    # Проверяем локальные пути (от корня репозитория)
    candidates = [
        os.path.join("img", "cards", filename),
        os.path.join(os.path.dirname(__file__), "..", "..", "img", "cards", filename),
    ]
    for c in candidates:
        abs_p = os.path.abspath(c)
        if os.path.exists(abs_p):
            return abs_p
    return None


async def generate_card_post_text(card_num: int) -> str:
    """Генерирует глубокий психологический разбор карты дня через ИИ."""
    card = ARCANA.get(card_num, ARCANA[0])
    prompt = (
        f"Ты — элитный таролог и психолог проекта Taro Navigator (стиль Dark Luxury Gold).\n"
        f"Напиши утренний вдохновляющий пост «Карта дня» для Telegram-канала.\n"
        f"Аркан: {card['name']} ({card['keyword']}).\n"
        f"Канонический смысл: {card['text']}\n\n"
        f"СТРОГИЙ ФОРМАТ ПОСТА (используй HTML-теги <b>, <i>):\n"
        f"🃏 <b>КАРТА ДНЯ: {card['name'].upper()}</b>\n"
        f"<i>«{card['keyword']}»</i>\n\n"
        f"✨ <b>Энергия дня:</b>\n(2-3 ярких предложения об атмосфере и течении дня)\n\n"
        f"💡 <b>Совет аркана:</b>\n(на что обратить внимание, ключевой совет)\n\n"
        f"⚠️ <b>Предостережение:</b>\n(ловушка дня, от чего стоит воздержаться)\n\n"
        f"🔮 <b>Вопрос на подумать:</b>\n(один глубокий вопрос для подписчиков, мотивирующий написать в комментариях)\n\n"
        f"Пиши живо, глубоко, тепло, без пустых банальностей."
    )

    ai_text = await _chat(
        {
            "model": "google/gemma-4-26b-a4b-it:free",
            "messages": [
                {
                    "role": "system",
                    "content": "Ты — мастер Таро проекта Taro Navigator. Пиши глубокие посты для канала с теплотой и вкусом. Форматируй только безопасными тегами HTML: <b>, <i>.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.85,
            "max_tokens": 700,
        }
    )

    if ai_text:
        return ai_text

    # Фолбэк на случай недоступности ИИ
    return (
        f"🃏 <b>КАРТА ДНЯ: {card['name'].upper()}</b>\n"
        f"<i>«{card['keyword']}»</i>\n\n"
        f"✨ <b>Энергия дня:</b>\n{card['text']}\n\n"
        f"💡 <b>Совет аркана:</b>\n"
        f"Прислушайся к внутреннему компасу. Аркан {card['name']} напоминает, что сегодня ключ к успеху — в балансе и осознанности.\n\n"
        f"⚠️ <b>Предостережение:</b>\nНе спеши с выводами и дай событиям раскрыться естественно.\n\n"
        f"🔮 <b>Вопрос на подумать:</b>\nВ чём сегодня ты можешь опереться на силу этого аркана?"
    )


def get_channel_inline_keyboard() -> InlineKeyboardMarkup:
    """Инлайн-кнопка для перехода в мини-апп."""
    url = MINI_APP_URL or "https://shadowlinkapp.online"
    # Если URL валидный HTTPS, крепим web_app или url
    btn = InlineKeyboardButton(text="🔮 Рассчитать свои арканы судьбы", url=url)
    return InlineKeyboardMarkup(inline_keyboard=[[btn]])


async def publish_daily_card(bot: Bot, target_chat_id: str | int | None = None) -> bool:
    """Публикует карту дня в указанный чат (по умолчанию CHANNEL_ID)."""
    chat_id = target_chat_id or CHANNEL_ID
    if not chat_id:
        logger.warning("CHANNEL_ID is not configured, skipping channel post")
        return False

    card_num = random.randint(0, 21)
    photo_path = get_card_photo_path(card_num)
    post_text = await generate_card_post_text(card_num)
    kb = get_channel_inline_keyboard()

    try:
        if photo_path and os.path.exists(photo_path):
            photo = FSInputFile(photo_path)
            # В Telegram лимит подписи к фото — 1024 символа
            if len(post_text) <= 1020:
                await bot.send_photo(
                    chat_id=chat_id,
                    photo=photo,
                    caption=post_text,
                    parse_mode="HTML",
                    reply_markup=kb,
                )
            else:
                card = ARCANA.get(card_num, ARCANA[0])
                header_caption = f"🃏 <b>{card['name'].upper()}</b> · <i>{card['keyword']}</i>"
                await bot.send_photo(
                    chat_id=chat_id,
                    photo=photo,
                    caption=header_caption,
                    parse_mode="HTML",
                )
                await bot.send_message(
                    chat_id=chat_id,
                    text=post_text,
                    parse_mode="HTML",
                    reply_markup=kb,
                )
        else:
            await bot.send_message(
                chat_id=chat_id,
                text=post_text,
                parse_mode="HTML",
                reply_markup=kb,
            )
        logger.info("Successfully published daily card post to %s", chat_id)
        return True
    except Exception as e:
        logger.error("Failed to publish post to %s: %s", chat_id, e)
        return False


async def channel_poster_cron(bot: Bot):
    """Фоновый планировщик: постит каждое утро в 09:00 MSK (UTC+3)."""
    logger.info("Channel poster scheduler started. Channel: %s", CHANNEL_ID)
    last_posted_date = None

    while True:
        try:
            # Время по МСК (UTC+3)
            now_utc = datetime.datetime.now(datetime.timezone.utc)
            now_msk = now_utc + datetime.timedelta(hours=3)
            today_str = now_msk.strftime("%Y-%m-%d")

            # Проверяем 09:00 утра
            if now_msk.hour == 9 and last_posted_date != today_str:
                if CHANNEL_ID and CHANNEL_ID != "-1004437866558": # или если задан валидный
                    success = await publish_daily_card(bot, CHANNEL_ID)
                    if success:
                        last_posted_date = today_str
                        logger.info("Daily morning post completed for %s", today_str)

            await asyncio.sleep(60)  # проверка каждую минуту
        except Exception as exc:
            logger.error("Error in channel poster loop: %s", exc)
            await asyncio.sleep(60)
