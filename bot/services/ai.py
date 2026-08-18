import logging

import httpx

from bot.config import AI_API_KEY, AI_BASE, AI_MODEL, AI_PROVIDER
from bot.texts.arcana_base import ARCANA
from bot.texts.zodiac_base import ZODIAC

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "Ты — мастер астрологии, таро и числовой экспертизы. Пиши живые, тёплые, "
    "запоминающиеся разборы личности на русском языке, обращаясь к человеку на «ты». "
    "Избегай общих фраз, штампов и пустых комплиментов."
)


def _arcana_payload(arcana: list[dict]) -> str:
    lines = []
    for item in arcana:
        card = ARCANA[item["number"]]
        lines.append(
            f"- {item['title']} → {card['name']} ({card['keyword']}): {card['text']}"
        )
    return "\n".join(lines)


def _fallback_report(user: dict) -> str:
    zodiac = user["zodiac"]
    sign = ZODIAC[zodiac]
    arcana = itemify(user)
    parts = [sign["text"]]
    for item in arcana:
        card = ARCANA[item["number"]]
        parts.append(f"{item['title']} · {card['name']} ({card['keyword']}): {card['text']}")
    return "\n\n".join(parts)


def itemify(user: dict) -> list[dict]:
    import json

    return json.loads(user.get("arcana") or "[]")


def build_prompt(user: dict, full: bool = False) -> str:
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)
    arcana = itemify(user)

    zodiac_line = (
        f"Знак зодиака: {zodiac} — стихия {sign['element']}, планета {sign['planet']}.\n"
        f"Суть знака: {sign['text']}"
        if sign
        else "Знак зодиака не определён."
    )

    content = (
        f"Дата рождения: {user.get('birth_date', 'не указана')}.\n"
        f"Место рождения: {user.get('birth_place', 'не указано')}.\n\n"
        f"{zodiac_line}\n\n"
        f"Арканы судьбы по дате рождения:\n{_arcana_payload(arcana)}\n\n"
    )

    if full:
        content += (
            "Напиши ПОЛНЫЙ разбор личности (~400–500 слов) со следующими разделами:\n"
            "🔮 Общая суть\n"
            "💪 Сильные стороны и таланты\n"
            "💞 Любовь и отношения\n"
            "🌀 Кармические уроки\n"
            "🪐 Совет из космоса\n"
        )
    else:
        content += (
            "Напиши КРАТКИЙ разбор личности (~120–180 слов): суть персонажа, "
            "ключевые качества и одну подсказку на будущее."
        )
    return content


def build_natal_forecast_prompt(user: dict) -> str:
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)
    arcana = itemify(user)

    zodiac_line = (
        f"Знак зодиака: {zodiac} — стихия {sign['element']}, планета {sign['planet']}.\n"
        f"Суть знака: {sign['text']}"
        if sign
        else "Знак зодиака не определён."
    )

    return (
        f"Дата рождения: {user.get('birth_date', 'не указана')}.\n"
        f"Время рождения: {user.get('birth_time') or 'не указано'}.\n"
        f"Место рождения: {user.get('birth_place', 'не указано')}.\n\n"
        f"{zodiac_line}\n\n"
        f"Арканы судьбы по позициям:\n{_arcana_payload(arcana)}\n\n"
        "Напиши РАСШИРЕННЫЙ прогноз по натальной карте (~450–550 слов), с разделом "
        "по каждому аркану (что он значит именно в этой позиции и как прожить его энергию "
        "в ближайший месяц) и разделами:\n"
        "🔮 Общий фон периода\n"
        "🌟 По арканам судьбы — по позициям\n"
        "💞 Любовь и отношения\n"
        "💼 Карьера и финансы\n"
        "🪐 Совет из космоса\n"
        "Пиши конкретно по данным человека, без общих фраз."
    )


def build_arcana_forecast_prompt(user: dict, arcana_number: int) -> str:
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)
    arcana = itemify(user)
    card = ARCANA.get(arcana_number)

    position = next(
        (item for item in arcana if item["number"] == arcana_number),
        None,
    )
    zodiac_line = (
        f"Знак зодиака: {zodiac} — стихия {sign['element']}, планета {sign['planet']}."
        if sign
        else "Знак зодиака не определён."
    )

    return (
        f"Человек: {zodiac_line}\n"
        f"Дата рождения: {user.get('birth_date', 'не указана')}.\n"
        f"Его арканы судьбы по позициям:\n{_arcana_payload(arcana)}\n\n"
        f"Запрошен аркан: {card['name']} ({card['keyword']})"
        + (
            f", в позиции «{position['title']}»."
            if position
            else "."
        )
        + "\n\n"
        "Напиши РАСШИРЕННЫЙ разбор именно этого аркана (~300–400 слов):\n"
        "🔮 Суть аркана\n"
        "✨ Как он проявляется у этого человека\n"
        "💪 Сильные стороны\n"
        "🌑 Тени и слабые места\n"
        "🪐 Совет: как прожить энергию аркана сейчас\n"
        "Пиши живо, обращайся на «ты», без общих штампов."
    )


def _natal_forecast_fallback(user: dict) -> str:
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)
    arcana = itemify(user)

    parts = [f"🔮 <b>Общий фон</b>\n{sign['text']}"]
    for item in arcana:
        card = ARCANA[item["number"]]
        parts.append(
            f"🌟 <b>{item['title']}</b> · {card['name']} ({card['keyword']})\n{card['text']}"
        )
    parts.append(
        "🪐 <b>Совет из космоса</b>\nНачни с аркана «Личность»: это твоя главная опора. "
        "Проживай энергию каждого аркана осознанно — и месяц принесёт рост."
    )
    return "\n\n".join(parts)


def _arcana_forecast_fallback(user: dict, arcana_number: int) -> str:
    card = ARCANA.get(arcana_number)
    arcana = itemify(user)
    position = next(
        (item for item in arcana if item["number"] == arcana_number),
        None,
    )
    position_line = (
        f"В твоей карте этот аркан стоит в позиции «{position['title']}» — "
        f"{position.get('subtitle', '')}."
        if position
        else "У тебя этот аркан не встречается в ключевых позициях."
    )
    return (
        f"🔮 <b>Суть аркана</b>\n{card['text']}\n\n"
        f"✨ <b>Как проявляется у тебя</b>\n{position_line}\n\n"
        f"💪 <b>Сильные стороны</b>\n{card['keyword']} — это твой скрытый ресурс: "
        f"в опорной точке он даёт устойчивость, в теневой — урок.\n\n"
        "🪐 <b>Совет</b>\nПроживи энергию этого аркана осознанно в ближайшие дни: "
        "заметь, где она уже звучит в твоей жизни, и дай ей больше места."
    )


async def _chat(payload: dict) -> str | None:
    if not AI_API_KEY:
        return None

    headers = {"Authorization": f"Bearer {AI_API_KEY}"}
    if AI_PROVIDER == "openrouter":
        headers["HTTP-Referer"] = "https://taro.app"
        headers["X-Title"] = "Taro Navigator"

    try:
        async with httpx.AsyncClient(timeout=50.0) as client:
            response = await client.post(
                f"{AI_BASE}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        logger.warning("AI generation failed (%s, %s): %s", AI_PROVIDER, AI_MODEL, exc)
        return None


async def generate_personality(user: dict, full: bool = False) -> str:
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_prompt(user, full=full)},
            ],
            "temperature": 0.9,
            "max_tokens": 800 if full else 400,
        }
    )
    if text:
        return text
    return _fallback_report(user)


async def generate_natal_forecast(user: dict) -> str:
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_natal_forecast_prompt(user)},
            ],
            "temperature": 0.9,
            "max_tokens": 1100,
        }
    )
    if text:
        return text
    return _natal_forecast_fallback(user)


async def generate_arcana_forecast(user: dict, arcana_number: int) -> str:
    if arcana_number not in ARCANA:
        return "⚠️ Не нашёл этот аркан в базе."
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_arcana_forecast_prompt(user, arcana_number)},
            ],
            "temperature": 0.9,
            "max_tokens": 900,
        }
    )
    if text:
        return text
    return _arcana_forecast_fallback(user, arcana_number)