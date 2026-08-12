from datetime import date as date_cls

from bot.texts import zodiac_base
from bot.texts.arcana_base import ARCANA

POSITIONS = [
    ("Личность", "Как ты проявляешься в мире"),
    ("Таланты", "Сильные стороны и дары"),
    ("Духовные задачи", "То, что душа пришла освоить"),
    ("Опыт прошлого", "Багаж прошлых воплощений"),
    ("Маска (ложный аркан)", "Твоя видимая роль в обществе"),
    ("Творческая сила", "Канал созидания"),
    ("Путь реализации", "Как ты достигаешь целей"),
    ("Любовь и отношения", "Как ты любишь"),
    ("Кармические уроки", "То, что нужно отпустить"),
    ("Предназначение", "Направление большого пути"),
]


def _reduce(value: int) -> int:
    return abs(value) % 22


def get_zodiac(day: int, month: int) -> str:
    date = (month, day)
    for start, end, name in zodiac_base.RANGES:
        if start <= date <= end:
            return name
    return "Козерог"


def get_arcana(day: int, month: int, year: int) -> list[dict]:
    day_str = f"{day:02d}"
    month_str = f"{month:02d}"
    digits_all = sum(int(ch) for ch in day_str + month_str + str(year))
    ds_year = sum(int(ch) for ch in str(year))

    values = [
        _reduce(digits_all),
        _reduce(day),
        _reduce(month),
        _reduce(ds_year),
        _reduce(day + month - year),
        _reduce(day + month),
        _reduce(month + ds_year),
        _reduce(day + ds_year),
        _reduce(day - month),
    ]
    values.append(_reduce(sum(values[:9])))

    result = []
    for (title, subtitle), number in zip(POSITIONS, values):
        card = ARCANA[number]
        result.append(
            {
                "number": number,
                "title": title,
                "subtitle": subtitle,
                "card": card["name"],
                "keyword": card["keyword"],
            }
        )
    return result


def parse_birth_date(raw: str) -> tuple[int, int, int]:
    day, month, year = (int(part) for part in raw.split("."))
    date_cls(year, month, day)
    return day, month, year