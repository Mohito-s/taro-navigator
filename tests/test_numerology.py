import pytest
from bot.services.numerology import _reduce, get_zodiac, get_arcana, parse_birth_date, POSITIONS
from bot.texts.arcana_base import ARCANA


def test_reduce():
    """Проверка математической функции редукции по модулю 22."""
    assert _reduce(0) == 0
    assert _reduce(1) == 1
    assert _reduce(21) == 21
    assert _reduce(22) == 0
    assert _reduce(25) == 3
    assert _reduce(44) == 0
    assert _reduce(-5) == 5
    assert _reduce(-23) == 1


def test_get_zodiac_all_signs():
    """Проверка всех 12 знаков зодиака на границах и в середине периода."""
    test_cases = [
        (25, 9, "Весы"),
        (21, 3, "Овен"),
        (19, 4, "Овен"),
        (20, 4, "Телец"),
        (20, 5, "Телец"),
        (21, 5, "Близнецы"),
        (21, 6, "Близнецы"),
        (22, 6, "Рак"),
        (22, 7, "Рак"),
        (23, 7, "Лев"),
        (22, 8, "Лев"),
        (23, 8, "Дева"),
        (22, 9, "Дева"),
        (23, 9, "Весы"),
        (22, 10, "Весы"),
        (23, 10, "Скорпион"),
        (22, 11, "Скорпион"),
        (23, 11, "Стрелец"),
        (21, 12, "Стрелец"),
        (22, 12, "Козерог"),
        (31, 12, "Козерог"),
        (1, 1, "Козерог"),
        (19, 1, "Козерог"),
        (20, 1, "Водолей"),
        (18, 2, "Водолей"),
        (19, 2, "Рыбы"),
        (20, 3, "Рыбы"),
    ]
    for day, month, expected_sign in test_cases:
        actual = get_zodiac(day, month)
        assert actual == expected_sign, f"Date {day}.{month} expected {expected_sign}, got {actual}"


def test_parse_birth_date():
    """Проверка парсинга строковой даты рождения."""
    assert parse_birth_date("25.09.1985") == (25, 9, 1985)
    assert parse_birth_date("01.01.2000") == (1, 1, 2000)
    assert parse_birth_date("29.02.2024") == (29, 2, 2024)

    # Невалидные даты должны выбрасывать исключение
    with pytest.raises((ValueError, Exception)):
        parse_birth_date("29.02.2023")  # не високосный год
    with pytest.raises((ValueError, Exception)):
        parse_birth_date("32.01.2000")
    with pytest.raises((ValueError, Exception)):
        parse_birth_date("15.13.1990")
    with pytest.raises((ValueError, Exception)):
        parse_birth_date("not-a-date")


def test_get_arcana_structure_and_bounds():
    """Проверка структуры и диапазона значений арканов."""
    cards = get_arcana(25, 9, 1985)
    assert len(cards) == 10
    assert len(cards) == len(POSITIONS)

    for i, item in enumerate(cards):
        assert "number" in item
        assert "title" in item
        assert "subtitle" in item
        assert "card" in item
        assert "keyword" in item

        num = item["number"]
        assert 0 <= num <= 21, f"Номер аркана {num} вне диапазона [0, 21]"
        assert num in ARCANA, f"Аркан {num} отсутствует в словаре ARCANA"
        assert item["card"] == ARCANA[num]["name"]
        assert item["keyword"] == ARCANA[num]["keyword"]
        assert item["title"] == POSITIONS[i][0]
        assert item["subtitle"] == POSITIONS[i][1]


def test_get_arcana_deterministic_results():
    """Контрольные тесты на фиксированные даты для защиты от регрессии."""
    # Тест 1: 25.09.1985
    # day=25, month=9, year=1985
    # digits_all = 2+5 + 0+9 + 1+9+8+5 = 39 -> 39 % 22 = 17 (Звезда)
    # day = 25 % 22 = 3 (Императрица)
    # month = 9 % 22 = 9 (Отшельник)
    # ds_year = 1+9+8+5 = 23 -> 23 % 22 = 1 (Маг)
    res_1985 = get_arcana(25, 9, 1985)
    numbers_1985 = [c["number"] for c in res_1985]
    assert numbers_1985[0] == 17, "Позиция 0 (Личность) должна быть 17 (Звезда)"
    assert numbers_1985[1] == 3, "Позиция 1 (Таланты) должна быть 3 (Императрица)"
    assert numbers_1985[2] == 9, "Позиция 2 (Духовные задачи) должна быть 9 (Отшельник)"
    assert numbers_1985[3] == 1, "Позиция 3 (Опыт прошлого) должна быть 1 (Маг)"

    # Тест 2: 01.01.2000
    res_2000 = get_arcana(1, 1, 2000)
    numbers_2000 = [c["number"] for c in res_2000]
    # digits_all = 0+1 + 0+1 + 2+0+0+0 = 4
    assert numbers_2000[0] == 4
    assert numbers_2000[1] == 1
    assert numbers_2000[2] == 1
    assert numbers_2000[3] == 2
