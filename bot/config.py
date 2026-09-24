import os

from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
DB_PATH: str = os.getenv("DB_PATH", "data/taro.db")
MINI_APP_URL: str = os.getenv("MINI_APP_URL", "").strip()
CHANNEL_ID: str = os.getenv("CHANNEL_ID", "-1004437866558").strip()
ADMIN_ID: int = int(os.getenv("ADMIN_ID", "830960097"))

# Тестовый режим: отключает оплату Stars, чтобы прогнать весь флоу локально без платежа.
TEST_MODE: bool = os.getenv("TEST_MODE", "false").strip().lower() in ("1", "true", "yes", "on")

AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deepseek").strip().lower()
AI_BASE_URL: str = os.getenv("AI_BASE_URL", "").rstrip("/")
AI_API_KEY: str = os.getenv("AI_API_KEY", "") or os.getenv("DEEPSEEK_API_KEY", "")

CF_ACCOUNT_ID: str = os.getenv("CF_ACCOUNT_ID", "2b9861faca952c66bbeceeeda83b0044").strip()
CF_AI_TOKEN: str = os.getenv("CF_AI_TOKEN", "").strip() or os.getenv("CLOUDFLARE_AI_TOKEN", "").strip() or AI_API_KEY

DEFAULT_MODELS = {
    "deepseek": "deepseek-chat",
    "openrouter": "google/gemma-4-26b-a4b-it:free",
    "cloudflare": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    "gemini": "gemini-1.5-flash",
    "groq": "groq/compound",
}
AI_MODEL: str = os.getenv("AI_MODEL", "") or DEFAULT_MODELS.get(AI_PROVIDER, "deepseek-chat")

OPENAI_COMPAT_BASES = {
    "deepseek": "https://api.deepseek.com",
    "openrouter": "https://openrouter.ai/api/v1",
    "cloudflare": f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai",
    "groq": "https://api.groq.com/openai/v1",
}
AI_BASE: str = AI_BASE_URL or OPENAI_COMPAT_BASES.get(AI_PROVIDER, OPENAI_COMPAT_BASES["deepseek"])

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is not set. Copy .env.example to .env and fill it.")