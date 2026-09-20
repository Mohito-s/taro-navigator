from bot.db.db import generate_recovery_code, RECOVERY_CHARS


def test_recovery_code_format():
    """Код восстановления должен строго соответствовать формату TARO-XXXXXX."""
    for _ in range(100):
        code = generate_recovery_code()
        assert code.startswith("TARO-"), f"Код {code} не начинается с префикса TARO-"
        assert len(code) == 11, f"Длина кода {code} должна быть ровно 11 символов"
        suffix = code.split("-")[1]
        assert len(suffix) == 6, f"Суффикс {suffix} должен быть длиной 6 символов"
        assert all(c in RECOVERY_CHARS for c in suffix), f"В суффиксе {suffix} обнаружены недопустимые символы"


def test_recovery_code_no_ambiguous_chars():
    """Код не должен содержать легко путаемые символы: 0, O, 1, I, L."""
    ambiguous = {"0", "O", "1", "I", "L"}
    for char in ambiguous:
        assert char not in RECOVERY_CHARS, f"Символ {char} не должен присутствовать в алфавите кодов"

    for _ in range(200):
        code = generate_recovery_code()
        suffix = code.split("-")[1]
        assert not any(c in suffix for c in ambiguous), f"Суффикс {suffix} кода {code} содержит неоднозначные символы"


def test_recovery_code_uniqueness():
    """Сгенерированные подряд коды должны быть уникальными."""
    generated = {generate_recovery_code() for _ in range(500)}
    assert len(generated) == 500, "Обнаружены коллизии при генерации кодов восстановления"
