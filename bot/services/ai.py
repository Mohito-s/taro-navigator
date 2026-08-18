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


# Горизонты прогноза: день / неделя / месяц (единые для бота и API)
PERIOD_LABELS = {
    "day": "на сегодня",
    "week": "на неделю",
    "month": "на месяц",
}

# Задача и объём каждого горизонта: прогнозы становятся полнее от дня к месяцу
PERIOD_INSTRUCTIONS = {
    "day": (
        "Напиши ПОДРОБНЫЙ прогноз на сегодня (~300–380 слов) с конкретикой по дню. "
        "Разделы:\n"
        "☀ Общий фон дня\n"
        "⚡ Энергия и фокус: куда направить силы именно сегодня\n"
        "💞 Любовь и отношения: как вести себя с близкими сегодня\n"
        "💼 Работа и финансы: задачи и решения дня\n"
        "🌱 Здоровье и баланс\n"
        "🪐 Совет на сегодня\n"
    ),
    "week": (
        "Напиши РАСШИРЕННЫЙ прогноз на неделю (~400–500 слов). Отметь ключевые дни "
        "недели и благоприятные окна. Разделы:\n"
        "☀ Общий фон недели\n"
        "⚡ Главные темы и фокус\n"
        "💞 Любовь и отношения: ритм недели\n"
        "💼 Карьера, деньги, дела: что запускать, что отложить\n"
        "🌱 Энергия и самозабота\n"
        "🪐 Совет и один смелый шаг на неделю\n"
    ),
    "month": (
        "Напиши ПОЛНЫЙ прогноз на месяц (~500–650 слов) как большую карту периода: "
        "этапы, поворотные точки и долгие темы. Разделы:\n"
        "☀ Общий фон месяца\n"
        "⚡ Этапы и поворотные точки: начало, середина, финал\n"
        "💞 Любовь и отношения: большой цикл\n"
        "💼 Карьера и финансы: стратегия и окна возможностей\n"
        "🌱 Здоровье, энергия, восстановление\n"
        "🪐 Главный урок месяца и совет\n"
    ),
}


def build_period_forecast_prompt(user: dict, horizon: str) -> str:
    """Прогноз на день/неделю/месяц по знаку, арканам и натальной карте."""
    label = PERIOD_LABELS.get(horizon, "на сегодня")
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
        f"{zodiac_line}\n\n"
        f"Арканы судьбы по дате рождения:\n{_arcana_payload(arcana)}"
    )
    planets = _planets_payload(user)
    if planets:
        content += f"\n\n{planets}\nОпирайся на реальные положения планет, Асцендент и аспекты, где это уместно."
    content += (
        f"\n\n{PERIOD_INSTRUCTIONS.get(horizon, PERIOD_INSTRUCTIONS['day'])}"
        "Пиши конкретно, живо, обращаясь к человеку на «ты», без общих фраз и штампов. "
        "Числа и даты можно упоминать как ориентиры, но не утверждай их как гарантию."
    )
    return content


def _period_forecast_fallback(user: dict, horizon: str) -> str:
    label = PERIOD_LABELS.get(horizon, "на сегодня")
    zodiac = user.get("zodiac", "")
    sign = ZODIAC.get(zodiac)
    arcana = itemify(user)
    now = __import__("datetime").datetime.now()
    n = len(arcana)
    pick = arcana[(now.day + now.month) % max(n, 1)] if n else None
    card = ARCANA[pick["number"]] if pick else None

    parts = [f"☀ <b>Общий фон {label}</b>\n{sign['text'] if sign else 'Звёзды готовят поворот.'}"]
    if card:
        parts.append(
            f"⚡ <b>Энергия и фокус</b>\nДень проходит под арканом «{card['name']}» "
            f"({card['keyword']}). Это твой внутренний ориентир: "
            f"{card['text']}"
        )
    parts.append(
        "💞 <b>Любовь и отношения</b>\n"
        f"Планета {sign['planet'] if sign else 'Венера'} советует держать лёгкость: "
        "честный разговор и пауза вместо давления решают больше."
    )
    parts.append(
        "💼 <b>Работа и финансы</b>\nНе форсируй события: последовательные шаги "
        f"{('в ритме стихии ' + sign['element'].lower()) if sign else ''} принесут больше, чем рывок."
    )
    parts.append(
        "🪐 <b>Совет</b>\nВыбери одно ключевое действие на этот период и доведи его "
        "до конца — звёзды поддержат движение, а не ожидание."
    )
    return "\n\n".join(parts)


async def generate_period_forecast(user: dict, horizon: str) -> str:
    """ИИ-прогноз на день/неделю/месяц с детерминированным фолбэком."""
    max_tokens = {"day": 700, "week": 1000, "month": 1400}.get(horizon, 700)
    text = await _chat(
        {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt(user.get("style", ""))},
                {"role": "user", "content": build_period_forecast_prompt(user, horizon)},
            ],
            "temperature": 0.9,
            "max_tokens": max_tokens,
        }
    )
    if text:
        return text
    return _period_forecast_fallback(user, horizon)


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