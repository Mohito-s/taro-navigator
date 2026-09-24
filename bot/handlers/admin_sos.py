import asyncio
import html
import logging
import os
import subprocess
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from bot import config

logger = logging.getLogger(__name__)
router = Router()


def _run_cmd(cmd: list[str]) -> str:
    """Выполняет системную команду безопасно и возвращает вывод."""
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return (res.stdout + res.stderr).strip()
    except Exception as e:
        return f"Error: {e}"


@router.message(Command("sos"))
@router.message(Command("sos_status"))
async def cmd_sos_status(message: Message):
    """Отчет о состоянии сервера и SSH для администратора."""
    if message.from_user.id != config.ADMIN_ID:
        return

    # Запускаем сбор информации асинхронно
    loop = asyncio.get_running_loop()

    def gather_info():
        uptime = _run_cmd(["uptime", "-p"])
        mem = _run_cmd(["free", "-h"])
        disk = _run_cmd(["df", "-h", "/"])
        ssh_active = _run_cmd(["sudo", "systemctl", "is-active", "ssh"])
        f2b_active = _run_cmd(["sudo", "systemctl", "is-active", "fail2ban"])
        telemost = _run_cmd(["sudo", "systemctl", "is-active", "olcrtc-telemost"])
        jitsi = _run_cmd(["sudo", "systemctl", "is-active", "olcrtc-jitsi"])
        ufw_1993 = _run_cmd(["sudo", "ufw", "status"])
        return {
            "uptime": uptime,
            "mem": mem,
            "disk": disk,
            "ssh": ssh_active,
            "f2b": f2b_active,
            "telemost": telemost,
            "jitsi": jitsi,
            "ufw": ufw_1993,
        }

    data = await loop.run_in_executor(None, gather_info)

    # Формируем ответ
    text = (
        "🛡️ <b>Состояние VPS-сервера (Emergency Status)</b>\n\n"
        f"⏱️ <b>Аптайм:</b> {html.escape(data['uptime'])}\n\n"
        f"🟢 <b>Службы:</b>\n"
        f"• SSH (порт 1993): <b>{html.escape(data['ssh'])}</b>\n"
        f"• Fail2ban: <b>{html.escape(data['f2b'])}</b>\n"
        f"• OlcRTC Телемост: <b>{html.escape(data['telemost'])}</b>\n"
        f"• OlcRTC Jitsi: <b>{html.escape(data['jitsi'])}</b>\n\n"
        f"💾 <b>Память:</b>\n<pre>{html.escape(data['mem'])}</pre>\n\n"
        f"💽 <b>Диск /:</b>\n<pre>{html.escape(data['disk'])}</pre>\n\n"
        "💡 <b>Команды спасения:</b>\n"
        "• <code>/sos_addkey &lt;ssh-key&gt;</code> — добавить новый SSH-ключ\n"
        "• <code>/sos_fix_ssh</code> — открыть порт 1993 и сбросить баны Fail2ban"
    )
    await message.answer(text, parse_mode="HTML")


@router.message(Command("sos_addkey"))
async def cmd_sos_addkey(message: Message):
    """Экстренно добавляет новый публичный SSH-ключ в authorized_keys."""
    if message.from_user.id != config.ADMIN_ID:
        return

    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        await message.answer(
            "ℹ️ <b>Использование:</b>\n"
            "<code>/sos_addkey ssh-ed25519 AAAA... comment</code>\n\n"
            "Отправьте команду со своим публичным ключом для экстренного восстановления доступа.",
            parse_mode="HTML",
        )
        return

    raw_key = parts[1].strip()

    # Валидация формата ключа
    valid_prefixes = ("ssh-ed25519", "ssh-rsa", "ecdsa-sha2-nistp256", "ecdsa-sha2-nistp384", "ecdsa-sha2-nistp521")
    if not any(raw_key.startswith(p) for p in valid_prefixes):
        await message.answer(
            "❌ <b>Некорректный формат ключа!</b>\n"
            "Ключ должен начинаться с <code>ssh-ed25519</code>, <code>ssh-rsa</code> или <code>ecdsa-sha2-...</code>",
            parse_mode="HTML",
        )
        return

    # Защита от инъекций / переводов строк
    clean_key = " ".join(raw_key.split())
    if "\n" in clean_key or "\r" in clean_key or len(clean_key) > 1000:
        await message.answer("❌ Ошибка валидации ключа (недопустимые символы).")
        return

    auth_file = os.path.expanduser("~/.ssh/authorized_keys")
    try:
        os.makedirs(os.path.dirname(auth_file), exist_ok=True)
        # Добавляем ключ
        with open(auth_file, "a", encoding="utf-8") as f:
            f.write(f"\n# Added via Telegram SOS by admin\n{clean_key}\n")
        # Выставляем строгие права 600
        os.chmod(auth_file, 0o600)

        await message.answer(
            "✅ <b>SSH-ключ успешно добавлен в <code>authorized_keys</code>!</b>\n\n"
            "Теперь вы можете подключиться к серверу:\n"
            "<code>ssh -p 1993 roman@193.168.198.57</code>",
            parse_mode="HTML",
        )
    except Exception as e:
        logger.exception("Failed to add emergency SSH key")
        await message.answer(f"❌ Ошибка при записи ключа: <code>{html.escape(str(e))}</code>", parse_mode="HTML")


@router.message(Command("sos_fix_ssh"))
async def cmd_sos_fix_ssh(message: Message):
    """Экстренно открывает порт 1993 в UFW, снимает баны Fail2ban и перезапускает SSH."""
    if message.from_user.id != config.ADMIN_ID:
        return

    status_msg = await message.answer("🔧 Выполняю экстренное восстановление SSH и сброс фаервола...")

    loop = asyncio.get_running_loop()

    def fix_operations():
        res1 = _run_cmd(["sudo", "ufw", "allow", "1993/tcp"])
        res2 = _run_cmd(["sudo", "ufw", "allow", "22/tcp"])
        res3 = _run_cmd(["sudo", "fail2ban-client", "unban", "--all"])
        res4 = _run_cmd(["sudo", "systemctl", "disable", "--now", "ssh.socket"])
        res5 = _run_cmd(["sudo", "systemctl", "enable", "--now", "ssh.service"])
        res6 = _run_cmd(["sudo", "systemctl", "restart", "ssh"])
        return f"UFW 1993: {res1}\nUFW 22: {res2}\nFail2ban: {res3}\nSSH: {res6}"

    result = await loop.run_in_executor(None, fix_operations)
    try:
        await status_msg.delete()
    except Exception:
        pass

    await message.answer(
        "✅ <b>Экстренное восстановление SSH завершено!</b>\n\n"
        f"<pre>{html.escape(result)}</pre>\n\n"
        "Порты 1993 и 22 открыты, сокеты отключены, демон ssh.service перезапущен.",
        parse_mode="HTML",
    )
