import os

from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
DB_PATH: str = os.getenv("DB_PATH", "data/taro.db")
MINI_APP_URL: str = os.getenv("MINI_APP_URL", "").strip()

AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deepseek").strip().lower()
AI_BASE_URL: str = os.getenv("AI_BASE_URL", "").rstrip("/")
AI_API_KEY: str = os.getenv("AI_API_KEY", "") or os.getenv("DEEPSEEK_API_KEY", "")

DEFAULT_MODELS = {
    "deepseek": "deepseek-chat",
    "openrouter": "deepseek/deepseek-chat-v3.1:free",
    "gemini": "gemini-2.5-flash",
}
AI_MODEL: str = os.getenv("AI_MODEL", "") or DEFAULT_MODELS.get(AI_PROVIDER, "deepseek-chat")

OPENAI_COMPAT_BASES = {
    "deepseek": "https://api.deepseek.com",
    "openrouter": "https://openrouter.ai/api/v1",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai",
}
AI_BASE: str = AI_BASE_URL or OPENAI_COMPAT_BASES.get(AI_PROVIDER, OPENAI_COMPAT_BASES["deepseek"])

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is not set. Copy .env.example to .env and fill it.")