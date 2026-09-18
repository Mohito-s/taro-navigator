import json
from pathlib import Path
import secrets
import string

import aiosqlite

from bot.config import DB_PATH

RECOVERY_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"


def generate_recovery_code() -> str:
    """Генерирует легко читаемый 11-значный код (TARO-XXXXXX) без легко путаемых символов (0/O, 1/I/L)."""
    suffix = "".join(secrets.choice(RECOVERY_CHARS) for _ in range(6))
    return f"TARO-{suffix}"


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT DEFAULT '',
    name TEXT DEFAULT '',
    birth_date TEXT DEFAULT '',
    birth_time TEXT DEFAULT '',
    birth_place TEXT DEFAULT '',
    zodiac TEXT DEFAULT '',
    arcana TEXT DEFAULT '[]',
    planets TEXT DEFAULT '{}',
    style TEXT DEFAULT 'cosmo',
    full_report_paid INTEGER DEFAULT 0,
    recovery_code TEXT UNIQUE,
    history TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS web_profiles (
    session_id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    birth_date TEXT DEFAULT '',
    birth_time TEXT DEFAULT '',
    birth_place TEXT DEFAULT '',
    zodiac TEXT DEFAULT '',
    arcana TEXT DEFAULT '[]',
    planets TEXT DEFAULT '{}',
    style TEXT DEFAULT 'cosmo',
    recovery_code TEXT UNIQUE,
    history TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
"""


def _ensure_dir() -> None:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)


async def init_db() -> None:
    _ensure_dir()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(SCHEMA)
        # миграции: добавляем недостающие колонки в уже существующие таблицы
        cur = await db.execute("PRAGMA table_info(users)")
        cols = [row[1] for row in await cur.fetchall()]
        if "style" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN style TEXT DEFAULT 'cosmo'")
        if "name" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''")
        if "planets" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN planets TEXT DEFAULT '{}'")
        if "recovery_code" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN recovery_code TEXT UNIQUE")
        if "history" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN history TEXT DEFAULT '[]'")

        cur_w = await db.execute("PRAGMA table_info(web_profiles)")
        cols_w = [row[1] for row in await cur_w.fetchall()]
        if "recovery_code" not in cols_w:
            await db.execute("ALTER TABLE web_profiles ADD COLUMN recovery_code TEXT UNIQUE")
        if "history" not in cols_w:
            await db.execute("ALTER TABLE web_profiles ADD COLUMN history TEXT DEFAULT '[]'")

        await db.commit()


async def get_user(telegram_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
        row = await cur.fetchone()
        return dict(row) if row else None


async def save_profile(
    telegram_id: int,
    username: str,
    birth_date: str,
    birth_time: str,
    birth_place: str,
    zodiac: str,
    arcana: list[dict],
    name: str = "",
    planets: str = "",
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO users (telegram_id, username, name, birth_date, birth_time, birth_place, zodiac, arcana, planets)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(telegram_id) DO UPDATE SET
                username=excluded.username,
                name=CASE WHEN excluded.name != '' THEN excluded.name ELSE users.name END,
                birth_date=excluded.birth_date,
                birth_time=excluded.birth_time,
                birth_place=excluded.birth_place,
                zodiac=excluded.zodiac,
                arcana=excluded.arcana,
                planets=CASE WHEN excluded.planets != '{}' THEN excluded.planets ELSE users.planets END
            """,
            (
                telegram_id,
                username,
                name,
                birth_date,
                birth_time,
                birth_place,
                zodiac,
                json.dumps(arcana, ensure_ascii=False),
                planets or "{}",
            ),
        )
        await db.commit()


async def set_paid(telegram_id: int) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE users SET full_report_paid = 1 WHERE telegram_id = ?", (telegram_id,))
        await db.commit()


async def set_style(telegram_id: int, style: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO users (telegram_id, username, style)
            VALUES (?, '', ?)
            ON CONFLICT(telegram_id) DO UPDATE SET style=excluded.style
            """,
            (telegram_id, style),
        )
        await db.commit()


async def save_web_profile(
    session_id: str,
    birth_date: str,
    birth_time: str,
    birth_place: str,
    zodiac: str,
    arcana: list[dict],
    name: str = "",
    planets: str = "",
    style: str = "cosmo",
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO web_profiles (session_id, name, birth_date, birth_time, birth_place, zodiac, arcana, planets, style, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(session_id) DO UPDATE SET
                name=CASE WHEN excluded.name != '' THEN excluded.name ELSE web_profiles.name END,
                birth_date=excluded.birth_date,
                birth_time=excluded.birth_time,
                birth_place=excluded.birth_place,
                zodiac=excluded.zodiac,
                arcana=excluded.arcana,
                planets=CASE WHEN excluded.planets != '{}' THEN excluded.planets ELSE web_profiles.planets END,
                style=CASE WHEN excluded.style != '' THEN excluded.style ELSE web_profiles.style END,
                updated_at=datetime('now')
            """,
            (
                session_id,
                name,
                birth_date,
                birth_time,
                birth_place,
                zodiac,
                json.dumps(arcana, ensure_ascii=False),
                planets or "{}",
                style or "cosmo",
            ),
        )
        await db.commit()


async def get_web_profile(session_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute("SELECT * FROM web_profiles WHERE session_id = ?", (session_id,))
        row = await cur.fetchone()
        return dict(row) if row else None


async def get_or_create_web_profile(session_id: str) -> dict:
    """Возвращает веб-профиль с гарантированным уникальным кодом восстановления."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute("SELECT * FROM web_profiles WHERE session_id = ?", (session_id,))
        row = await cur.fetchone()

        if row:
            data = dict(row)
            if not data.get("recovery_code"):
                # Генерируем код, если его ещё не было
                new_code = generate_recovery_code()
                await db.execute(
                    "UPDATE web_profiles SET recovery_code = ? WHERE session_id = ?",
                    (new_code, session_id),
                )
                await db.commit()
                data["recovery_code"] = new_code
            return data

        # Создаём новую запись с кодом восстановления
        code = generate_recovery_code()
        await db.execute(
            """
            INSERT INTO web_profiles (session_id, recovery_code, updated_at)
            VALUES (?, ?, datetime('now'))
            """,
            (session_id, code),
        )
        await db.commit()
        return {
            "session_id": session_id,
            "name": "",
            "birth_date": "",
            "birth_time": "",
            "birth_place": "",
            "zodiac": "",
            "arcana": "[]",
            "planets": "{}",
            "style": "cosmo",
            "recovery_code": code,
            "history": "[]",
        }


async def get_or_create_user_recovery_code(telegram_id: int) -> str:
    """Возвращает или генерирует уникальный код восстановления для пользователя Telegram-бота."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute("SELECT recovery_code FROM users WHERE telegram_id = ?", (telegram_id,))
        row = await cur.fetchone()
        if row and row["recovery_code"]:
            return row["recovery_code"]

        code = generate_recovery_code()
        await db.execute(
            """
            INSERT INTO users (telegram_id, recovery_code)
            VALUES (?, ?)
            ON CONFLICT(telegram_id) DO UPDATE SET recovery_code = excluded.recovery_code
            """,
            (telegram_id, code),
        )
        await db.commit()
        return code


async def get_profile_by_recovery_code(code: str) -> tuple[str, dict] | None:
    """Ищет профиль по коду восстановления сначала в Telegram-пользователях, затем в веб-сессиях."""
    norm_code = code.strip().upper()
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # 1. Проверяем Telegram-пользователей
        cur = await db.execute("SELECT * FROM users WHERE recovery_code = ?", (norm_code,))
        row = await cur.fetchone()
        if row and (row["birth_date"] or row["arcana"] != "[]"):
            return "telegram", dict(row)

        # 2. Проверяем веб-профили
        cur_w = await db.execute("SELECT * FROM web_profiles WHERE recovery_code = ?", (norm_code,))
        row_w = await cur_w.fetchone()
        if row_w:
            return "web", dict(row_w)

        return None


async def save_web_history(session_id: str, history: list[dict]) -> None:
    """Сохраняет историю разборов для веб-сессии (лимит 50 записей)."""
    history_json = json.dumps(history[:50], ensure_ascii=False)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO web_profiles (session_id, history, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(session_id) DO UPDATE SET
                history = excluded.history,
                updated_at = datetime('now')
            """,
            (session_id, history_json),
        )
        await db.commit()


async def sync_web_profile_with_code(session_id: str, recovery_code: str) -> dict | None:
    """Копирует данные найденного по коду профиля в текущую веб-сессию."""
    res = await get_profile_by_recovery_code(recovery_code)
    if not res:
        return None

    _, source_profile = res

    # Обновляем целевую веб-сессию данными из найденного профиля
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO web_profiles (
                session_id, name, birth_date, birth_time, birth_place,
                zodiac, arcana, planets, style, recovery_code, history, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(session_id) DO UPDATE SET
                name = excluded.name,
                birth_date = excluded.birth_date,
                birth_time = excluded.birth_time,
                birth_place = excluded.birth_place,
                zodiac = excluded.zodiac,
                arcana = excluded.arcana,
                planets = excluded.planets,
                style = excluded.style,
                recovery_code = excluded.recovery_code,
                history = excluded.history,
                updated_at = datetime('now')
            """,
            (
                session_id,
                source_profile.get("name", ""),
                source_profile.get("birth_date", ""),
                source_profile.get("birth_time", ""),
                source_profile.get("birth_place", ""),
                source_profile.get("zodiac", ""),
                source_profile.get("arcana", "[]"),
                source_profile.get("planets", "{}"),
                source_profile.get("style", "cosmo"),
                recovery_code.strip().upper(),
                source_profile.get("history", "[]"),
            ),
        )
        await db.commit()

    return await get_web_profile(session_id)