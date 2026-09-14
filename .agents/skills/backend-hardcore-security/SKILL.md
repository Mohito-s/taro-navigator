---
name: backend-hardcore-security
description: Extreme security and code-quality rules for the Python backend. Trigger this skill whenever working on bot/db.py, FastAPI endpoints, or executing SQL queries. This skill forces you to use parameterized queries, check for XSS in WebApp inputs, and run linters before committing.
---

# Hardcore Security & Code Quality

Этот скилл содержит критически важные правила безопасности для бэкенда (FastAPI и aiogram).

## 1. Запрет на f-строки в SQL (SQL Injection)

**НИКОГДА** не подставляй переменные в SQL-запросы через f-строки или конкатенацию. Используй только параметризованные запросы с плейсхолдерами `?`.

❌ **ЗАПРЕЩЕНО:**
```python
# КРИТИЧЕСКАЯ УЯЗВИМОСТЬ
cursor.execute(f"SELECT * FROM users WHERE telegram_id = {user_id}")
```

✅ **РАЗРЕШЕНО:**
```python
cursor.execute("SELECT * FROM users WHERE telegram_id = ?", (user_id,))
```

## 2. Защита от XSS (Cross-Site Scripting)

Все данные, которые приходят из Telegram WebApp (через `initData` или JSON payload) и затем рендерятся в HTML (например, в ответном сообщении бота `<b>Твой город: {city}</b>`), должны быть строго экранированы.

Используй `html.escape(data)` для текстовых полей, таких как Имя или Город, прежде чем вставлять их в HTML-ответ бота.

## 3. Линтинг и форматирование (Code Quality)

Перед тем как предлагать коммит или завершать таску, убедись, что код соответствует стандартам PEP-8.
Если в окружении установлен `ruff` или `flake8`, запусти его для проверки измененного файла:
`python -m ruff check путь_к_файлу.py` (или аналогичный линтер).

Мы не допускаем неиспользуемых импортов (F401) и ошибок синтаксиса. Если не уверен — используй `python -m py_compile <file>` перед коммитом, чтобы проверить синтаксис.
