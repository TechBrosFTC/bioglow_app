from app.services.telegram import decrypt_token, encrypt_token, format_varroa_message, parse_chat_ids


def test_telegram_token_encryption_roundtrip():
    encrypted = encrypt_token("123456:test-token")
    assert encrypted != "123456:test-token"
    assert decrypt_token(encrypted) == "123456:test-token"


def test_varroa_message_is_formatted_in_brazilian_time_without_event_id():
    message = format_varroa_message("BPS-WEBCAM-001", "2026-11-04T18:35:42+00:00")
    assert "🐝 <b>BPS Vision — Alerta de Varroa</b>" in message
    assert "04/11/2026 às 15:35" in message
    assert "Evento" not in message


def test_multiple_chat_ids_are_parsed_and_deduplicated():
    assert parse_chat_ids("123, -456\n@grupo;123") == ["123", "-456", "@grupo"]
