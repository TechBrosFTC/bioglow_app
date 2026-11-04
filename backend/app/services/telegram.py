from __future__ import annotations

import base64
import hashlib
import html
import logging
import re
import ssl
from datetime import datetime, timedelta, timezone

import httpx
import truststore
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import TelegramConfig

log = logging.getLogger(__name__)


def _fernet() -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(settings.secret_key.encode()).digest())
    return Fernet(key)


def encrypt_token(token: str) -> str:
    return _fernet().encrypt(token.encode()).decode()


def decrypt_token(value: str) -> str:
    try:
        return _fernet().decrypt(value.encode()).decode()
    except InvalidToken as exc:
        raise RuntimeError("Telegram token cannot be decrypted with the current SECRET_KEY") from exc


async def send_message(token: str, chat_id: str, text: str) -> None:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    # Use the native Windows trust store so corporate/local CA certificates
    # remain trusted without weakening TLS verification.
    ssl_context = truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    async with httpx.AsyncClient(timeout=10, verify=ssl_context) as client:
        response = await client.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"})
        response.raise_for_status()
        body = response.json()
        if not body.get("ok"):
            raise RuntimeError(body.get("description", "Telegram rejected the message"))


def format_varroa_message(device_uid: str, detected_at: str) -> str:
    timestamp = datetime.fromisoformat(detected_at.replace("Z", "+00:00"))
    local_time = timestamp.astimezone(timezone(timedelta(hours=-3)))
    formatted_time = local_time.strftime("%d/%m/%Y às %H:%M")
    return (
        "🐝 <b>BPS Vision — Alerta de Varroa</b>\n\n"
        "🔴 <b>Possível Varroa simulada detectada!</b>\n\n"
        f"📟 <b>Dispositivo:</b> {html.escape(device_uid)}\n"
        f"🕒 <b>Data e hora:</b> {formatted_time}\n\n"
        "⚠️ <i>Resultado experimental. Não representa diagnóstico biológico.</i>"
    )


def parse_chat_ids(value: str | None) -> list[str]:
    if not value:
        return []
    result = []
    for item in re.split(r"[,;\n\r]+", value):
        chat_id = item.strip()
        if chat_id and chat_id not in result:
            result.append(chat_id)
    return result


async def notify_varroa(event_id: str, device_uid: str, detected_at: str) -> None:
    try:
        with SessionLocal() as db:
            config = db.scalar(select(TelegramConfig).where(TelegramConfig.id == 1))
            if not config or not config.enabled or not config.bot_token_encrypted or not config.chat_id:
                return
            token, chat_ids = decrypt_token(config.bot_token_encrypted), parse_chat_ids(config.chat_id)
        message = format_varroa_message(device_uid, detected_at)
        for chat_id in chat_ids:
            try:
                await send_message(token, chat_id, message)
            except Exception:
                log.exception("Telegram notification failed for chat %s and event %s", chat_id, event_id)
    except Exception:
        log.exception("Telegram notification failed for event %s", event_id)
