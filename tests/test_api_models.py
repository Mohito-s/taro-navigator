import pytest
from pydantic import ValidationError
from api.main import (
    NatalIn,
    ArcanaIn,
    ForecastIn,
    TarotReadingIn,
    SyncRestoreIn,
    _natal_user,
    _arcana_user,
)


def test_natal_in_valid():
    """Тест валидации модели запроса натальной карты."""
    payload = {
        "day": 25,
        "month": 9,
        "year": 1985,
        "time": "14:30",
        "city": "Москва",
        "name": "Роман",
        "style": "cosmo",
    }
    req = NatalIn(**payload)
    assert req.day == 25
    assert req.month == 9
    assert req.year == 1985
    assert req.city == "Москва"


def test_natal_in_missing_required_fields():
    """Проверка ошибок валидации при отсутствии обязательных полей."""
    with pytest.raises(ValidationError):
        NatalIn(day=25)  # пропущены month и year


def test_arcana_in_validation():
    """Проверка модели запроса аркана."""
    req = ArcanaIn(day=10, month=5, year=1992, arcana_n=7, style="gandalf")
    assert req.arcana_n == 7
    assert req.style == "gandalf"

    user_dict = _arcana_user(req)
    assert user_dict["zodiac"] == "Телец"
    assert user_dict["birth_date"] == "10.05.1992"
    assert "arcana" in user_dict


def test_forecast_in_defaults():
    """Проверка значений по умолчанию для прогноза."""
    req = ForecastIn(day=1, month=1, year=2000)
    assert req.horizon == "day"
    assert req.style == ""
    assert req.chart is None


def test_tarot_reading_in():
    """Проверка модели расклада таро."""
    req = TarotReadingIn(
        spread_type="love",
        cards=[
            {"number": 0, "name": "Шут", "keyword": "Новое начало", "position_meaning": "Партнер"},
            {"number": 14, "name": "Умеренность", "keyword": "Баланс", "position_meaning": "Чувства"},
        ],
        question="Что ждет в отношениях?",
        style="doctor_strange",
    )
    assert req.spread_type == "love"
    assert len(req.cards) == 2
    assert req.style == "doctor_strange"


def test_sync_restore_in():
    """Проверка модели восстановления по коду."""
    req = SyncRestoreIn(session_id="anon-uuid-12345", recovery_code="TARO-AB2345")
    assert req.session_id == "anon-uuid-12345"
    assert req.recovery_code == "TARO-AB2345"
