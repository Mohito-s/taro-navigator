import argparse
import asyncio
import time

import httpx
from dotenv import load_dotenv

load_dotenv()

FREE_MODELS = [
    "deepseek/deepseek-chat-v3.1:free",
    "deepseek/deepseek-v3.2:free",
    "qwen/qwen2.5-72b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
]

# Единый источник системного промпта — чтобы не дублировать персону.
from bot.services.ai import SYSTEM_PROMPT as SYSTEM

USER_PROMPT = (
    "Дата рождения: 12.05.1998. Знак зодиака: Телец (Земля, Венера).\n"
    "Арканы судьбы:\n"
    "- Личность → Смерть (Трансформация)\n"
    "- Таланты → Повешенный (Пересмотр и пауза)\n"
    "- Предназначение → Мир (Целостность и завершение)\n\n"
    "Напиши краткий разбор личности (~120 слов): суть, сильные стороны, совет."
)

URL = "https://openrouter.ai/api/v1/chat/completions"


async def test_one(key: str, model: str) -> None:
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": USER_PROMPT},
        ],
        "temperature": 0.9,
        "max_tokens": 400,
    }
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                URL,
                headers={"Authorization": f"Bearer {key}"},
                json=body,
            )
            if r.status_code == 401:
                print(f"✗ {model}: 401 — ключ не подходит для OpenRouter")
                return
            data = r.json()
            if "error" in data:
                err = data["error"].get("message", str(data["error"]))
                print(f"✗ {model}: {err[:160]}")
                return
            text = data["choices"][0]["message"]["content"].strip()
        elapsed = time.time() - start
        preview = text.replace("\n", " ")[:220]
        print(f"✓ {model} — {elapsed:.1f}с\n  {preview}...\n")
    except httpx.HTTPStatusError as e:
        print(f"✗ {model}: HTTP {e.response.status_code} {e.response.text[:160]}\n")
    except httpx.RequestError as e:
        print(f"✗ {model}: сеть {e}\n")


async def main(models: list[str]) -> None:
    import os

    key = os.getenv("OPENROUTER_API_KEY") or os.getenv("AI_API_KEY") or ""
    if not key:
        print("Нет ключа. Заведи на openrouter.ai (вход по email) и впиши в .env:\n")
        print("  OPENROUTER_API_KEY=<ключ>\n")
        print("или AI_API_KEY=<ключ> при AI_PROVIDER=openrouter.")
        return

    print(f"Провайдер: OpenRouter | ключ: {key[:8]}... ({len(key)} симв.)\n")
    for model in models:
        await test_one(key, model)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Тест бесплатных ИИ-моделей через OpenRouter")
    parser.add_argument("--model", action="append", help="конкретная модель (можно несколько раз)")
    args = parser.parse_args()
    asyncio.run(main(args.model or FREE_MODELS))