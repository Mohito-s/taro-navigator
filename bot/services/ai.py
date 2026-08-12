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


async def generate_personality(user: dict, full: bool = False) -> str:
    if not AI_API_KEY:
        return _fallback_report(user)

    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(user, full=full)},
        ],
        "temperature": 0.9,
        "max_tokens": 800 if full else 400,
    }

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
        return _fallback_report(user)