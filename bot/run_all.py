"""
Combined runner for Heroku and single-container deployments.
Runs both the FastAPI backend (web) and the aiogram Telegram bot (polling).
"""
import asyncio
import logging
import os
import uvicorn

from api.main import app
from bot.main import main as run_bot

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("run_all")


async def run_web():
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"Starting FastAPI web server on 0.0.0.0:{port}...")
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
    )
    server = uvicorn.Server(config)
    await server.serve()


async def main():
    run_web_flag = os.getenv("RUN_WEB", "true").strip().lower() in ("1", "true", "yes")
    run_bot_flag = os.getenv("RUN_BOT", "true").strip().lower() in ("1", "true", "yes")

    tasks = []
    if run_web_flag:
        tasks.append(asyncio.create_task(run_web()))
    if run_bot_flag:
        logger.info("Starting Telegram bot polling in background...")
        tasks.append(asyncio.create_task(run_bot()))

    if not tasks:
        logger.error("Neither RUN_WEB nor RUN_BOT is enabled. Exiting.")
        return

    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)
    for task in pending:
        task.cancel()
    for task in done:
        exc = task.exception()
        if exc:
            logger.error(f"Task raised exception: {exc}")
            raise exc


if __name__ == "__main__":
    asyncio.run(main())
