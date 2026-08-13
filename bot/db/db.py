import json
from pathlib import Path

import aiosqlite

from bot.config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT DEFAULT '',
    birth_date TEXT DEFAULT '',
    birth_time TEXT DEFAULT '',
    birth_place TEXT DEFAULT '',
    zodiac TEXT DEFAULT '',
    arcana TEXT DEFAULT '[]',
    style TEXT DEFAULT 'cosmo',
    full_report_paid INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
"""


def _ensure_dir() -> None:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)


async def init_db() -> None:
    _ensure_dir()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(SCHEMA)
        # миграция: добавляем колонку style в уже существующие таблицы
        cur = await db.execute("PRAGMA table_info(users)")
        cols = [row[1] for row in await cur.fetchall()]
        if "style" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN style TEXT DEFAULT 'cosmo'")
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
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO users (telegram_id, username, birth_date, birth_time, birth_place, zodiac, arcana)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(telegram_id) DO UPDATE SET
                username=excluded.username,
                birth_date=excluded.birth_date,
                birth_time=excluded.birth_time,
                birth_place=excluded.birth_place,
                zodiac=excluded.zodiac,
                arcana=excluded.arcana
            """,
            (
                telegram_id,
                username,
                birth_date,
                birth_time,
                birth_place,
                zodiac,
                json.dumps(arcana, ensure_ascii=False),
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