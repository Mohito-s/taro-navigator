import json
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

# Стили интерпретации из профиля мини-аппа → персона для ИИ
STYLE_PERSONAS = {
    "Космо": (
        "Обращайся к человеку на «ты», спокойно и по делу. "
        "Без ролевой игры и пафоса: понятно, по-человечески, с лёгким тёплым подтекстом."
    ),
    "Гендальф Серый": (
        "Говори голосом мудреца Севера: торжественно, притчами и метафорами света. "
        "Обращайся на «ты». Позволяй себе образные сравнения и неторопливые выводы."
    ),
    "Доктор Стрэндж": (
        "Говори голосом хранителя Санктума: точно, собранно, о времени и тайных течениях. "
        "Обращайся на «ты». Упоминай «сокрытые течения», «баланс», «видимое и скрытое»."
    ),
    "Мастер Йода": (
        "Говори как Мастер Йода: кротко, загадочно и мудро. Обращайся на «ты». "
        "Строй фразы инверсией («Многое предстоит тебе узнать»), короткими афоризмами о Силе."
    ),
    "Дамблдор": (
        "Говори голосом Дамблдора: тепло, иронично, всегда с намёком. Обращайся на «ты». "
        "Допускай мягкий юмор, «может быть» вместо категоричности и лёгкую загадочность."
    ),
}


def system_prompt(style: str = "") -> str:
    """Базовый системный промт + персона выбранного стиля интерпретации."""
    style = (style or "").strip()
    if style == "cosmo":  # внутренний id дефолтного стиля из БД = нейтральный «Космо»
        style = "Космо"
    persona = STYLE_PERSONAS.get(style, "")
    if not persona:
        return SYSTEM_PROMPT
    return f"{SYSTEM_PROMPT}\n\nСтиль голоса: {persona}"


def _arcana_payload(arcana: list[dict]) -> str:
    lines = []
    for item in arcana:
        card = ARCANA[item["number"]]
        lines.append(
            f"- {item['title']} → {card['name']} ({card['keyword']}): {card['text']}"
        )
    return "\n".join(lines)


# Ракурсы для «пересоздать разбор»: каждый регенерат идёт под новым углом
PERSONALITY_ANGLES = [
    "Раскрой тему через любовь и отношения: как этот код звучит в партнёрстве.",
    "Раскрой тему через карьеру и финансы: где этому коду жить и зарабатывать.",
    "Раскрой тему через тени и уроки: что важно осознать, чтобы расти.",
    "Раскрой тему через сильные стороны: как усиливать то, что уже дано.",
    "Раскрой тему через ближайший месяц: практические ориентиры и окна возможностей.",
    "Раскрой тему через внутренний мир: эмоции, страхи и то, что питает душу.",
    "Раскрой тему через предназначение: куда ведёт большой путь и что делать сейчас.",
]

FALLBACK_TIPS = [
    "🪐 Совет из космоса: начни с аркана «Личность» — это твоя главная опора. Проживай энергию каждого аркана осознанно.",
    "🪐 Совет из космоса: выбери один аркан на неделю и проживи его энергию — изменения придут через практику.",
    "🪐 Совет из космоса: не бойся сильных качеств — они даны не для показухи, а для роста. Действуй по-своему.",
    "🪐 Совет из космоса: кармические уроки легче всего прорабатываются в отношениях — присмотрись к повторяющимся сценариям.",
    "🪐 Совет из космоса: месячный ритм — твой союзник. Планируй важное на растущую энергию, отдыхай — на спад.",
    "🪐 Совет из космоса: твой ложный аркан — это маска, за которой прячется сила. Снимай её постепенно.",
    "🪐 Совет из космоса: предназначение раскрывается не в поиске, а в действии. Делай следующий малый шаг.",
]


def _fallback_report(user: dict, variation: int = 0) -> str:
    zodiac = user["zodiac"]
    sign = ZODIAC[zodiac]
    arcana = itemify(user)
    n = len(arcana)
    # сдвигаем порядок арканов, чтобы «пересоздать» не повторялся текст
    shift = variation % max(n, 1)
    arcana = arcana[shift:] + arcana[:shift]
    parts = [sign["text"]]
    for item in arcana:
        card = ARCANA[item["number"]]
        parts.append(f"{item['title']} · {card['name']} ({card['keyword']}): {card['text']}")
    tip = FALLBACK_TIPS[variation % len(FALLBACK_TIPS)]
    parts.append(tip)
    return "\n\n".join(parts)


def itemify(user: dict) -> list[dict]:
    import json

    return json.loads(user.get("arcana") or "[]")


def build_prompt(user: dict, full: bool = False, variation: int = 0) -> str:
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

    angle = PERSONALITY_ANGLES[variation % len(PERSONALITY_ANGLES)] if variation else ""
    if angle:
        content += f"\n\nСейчас сделай разворот под новым углом: {angle}"
    return content


def _planets_payload(user: dict) -> str:
    """Реальный расчёт натальной карты (эфемериды VSOP87) из профиля."""
    try:
        chart = json.loads(user.get("planets") or "{}")
    except (json.JSONDecodeError, TypeError):
        return ""
    if not isinstance(chart, dict) or not chart.get("planets"):
        return ""

    lines = ["Реальное положение планет (эфемериды VSOP87, точность ~1 угл. минуты):"]
    for p in chart["planets"][:10]:
        icon = p.get("icon", "")
        lines.append(f"• {icon} {p.get('name', '')}: {p.get('deg', '')} {p.get('sign', '')}")
    if chart.get("asc"):
        lines.append(f"• Асцендент: {chart['asc']}")
    if chart.get("mc"):
        lines.append(f"• МС (середина неба): {chart['mc']}")
    houses = chart.get("houses")
    if isinstance(houses, dict) and houses:
        top = list(houses.items())[:5]
        lines.append("• Дома планет: " + ", ".join(f"{k} — {v}" for k, v in top))
    aspects = chart.get("aspects")
    if isinstance(aspects, list) and aspects:
        lines.append("• Ключевые аспекты:")
        lines.extend(f"   - {a}" for a in aspects[:8])
    return "\n".join(lines)


def build_natal_forecast_prompt(user: dict) -> str:
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)

    zodiac_line = (
        f"Знак зодиака: {zodiac} — стихия {sign['element']}, планета {sign['planet']}.\n"
        f"Период знака: {sign['dates']}\n"
        f"Суть знака: {sign['text']}"
        if sign
        else "Знак зодиака не определён."
    )

    planets_block = _planets_payload(user)

    content = (
        f"Дата рождения: {user.get('birth_date', 'не указана')}.\n"
        f"Время рождения: {user.get('birth_time') or 'не указано'}.\n"
        f"Место рождения: {user.get('birth_place', 'не указано')}.\n\n"
        f"{zodiac_line}"
    )
    if planets_block:
        content += f"\n\n{planets_block}"
    content += (
        "\n\nНапиши РАСШИРЕННЫЙ астрологический прогноз по натальной карте (~450–550 слов), "
        "ТОЛЬКО по астрологии — НЕ упоминай карты Таро и арканы. Используй реальные положения "
        "планет, Асцендент и аспекты из данных выше. Разделы:\n"
        "🔭 Общий фон периода\n"
        "♈ Солнечный знак: характер, энергия, темперамент\n"
        "☽ Луна и эмоции\n"
        "💞 Любовь и отношения\n"
        "💼 Карьера и финансы\n"
        "🪐 Совет из космоса\n"
        "Пиши конкретно по данным человека, без общих фраз."
    )
    return content


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

    parts = [f"🔭 <b>Общий фон</b>\n{sign['text']}"]
    planets_block = _planets_payload(user)
    if planets_block:
        parts.append(f"🪐 <b>Планеты в момент рождения</b>\n{planets_block}")
    parts.append(
        f"☉ <b>Солнце и характер</b>\nТвой солнечный знак — {zodiac} (стихия {sign['element']}, "
        f"планета {sign['planet']}). Ты проявляешься как энергия знака: "
        f"{sign['text']}"
    )
    parts.append(
        "☽ <b>Луна и эмоции</b>\nЭмоциональный фон управляется Луной: прислушивайся к "
        "интуиции и не подавляй чувства — они твой внутренний компас."
    )
    parts.append(
        "💞 <b>Любовь и отношения</b>\nПартнёрство резонирует с планетой "
        f"{sign['planet']}: цени лёгкость, честность и личное пространство."
    )
    parts.append(
        "💼 <b>Карьера и финансы</b>\nЭнергия "
        f"{sign['element'].lower()}-знака поддерживает деятельность, где важен "
        f"{'творческий импульс' if sign['element'] == 'Огонь' else 'порядок и результат' if sign['element'] == 'Земля' else 'контакт и идеи' if sign['element'] == 'Воздух' else 'глубина и чувства'}."
    )
    parts.append(
        "🪐 <b>Совет из космоса</b>\nСледуй ритму планет: важное — в первой половине периода, "
        "закрепление — в финале. Доверяй своему знаку — он уже знает ответ."
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


async def generate_personality(user: dict, full: bool = False, variation: int = 0) -> str:
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt(user.get("style", ""))},
                {"role": "user", "content": build_prompt(user, full=full, variation=variation)},
            ],
            "temperature": 0.9,
            "max_tokens": 800 if full else 400,
        }
    )
    if text:
        return text
    return _fallback_report(user, variation=variation)


async def generate_natal_forecast(user: dict, variation: int = 0) -> str:
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt(user.get("style", ""))},
                {"role": "user", "content": build_natal_forecast_prompt(user)},
            ],
            "temperature": 0.9,
            "max_tokens": 1100,
        }
    )
    if text:
        return text
    return _natal_forecast_fallback(user)


async def generate_arcana_forecast(user: dict, arcana_number: int, variation: int = 0) -> str:
    if arcana_number not in ARCANA:
        return "⚠️ Не нашёл этот аркан в базе."
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt(user.get("style", ""))},
                {"role": "user", "content": build_arcana_forecast_prompt(user, arcana_number)},
            ],
            "temperature": 0.9,
            "max_tokens": 900,
        }
    )
    if text:
        return text
    return _arcana_forecast_fallback(user, arcana_number)