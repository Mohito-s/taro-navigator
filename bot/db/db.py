import json
from pathlib import Path

import aiosqlite

from bot.config import DB_PATH

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