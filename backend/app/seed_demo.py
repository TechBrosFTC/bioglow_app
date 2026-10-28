"""Popula o banco local com o cenário demonstrativo do BPS de forma idempotente."""
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import (
    AcidRelease,
    Alert,
    Detection,
    Device,
    DeviceSyncEvent,
    Hive,
    Measurement,
    Treatment,
)

UTC = timezone.utc
BASE_TIME = datetime(2026, 10, 28, 18, 30, tzinfo=UTC)


def seed() -> None:
    with SessionLocal() as db:
        hive = db.scalar(select(Hive).where(Hive.name == "Colmeia Escola 01"))
        if not hive:
            hive = db.scalar(select(Hive).order_by(Hive.id))
        if not hive:
            hive = Hive(name="Colmeia Escola 01")
            db.add(hive)
            db.flush()
        hive.name = "Colmeia Escola 01"
        hive.description = "Colmeia inteligente do projeto educacional BPS"
        hive.location_label = "Laboratório de Robótica"

        device = db.scalar(select(Device).where(Device.device_uid == "BPS-001"))
        if not device:
            raise RuntimeError("Crie primeiro o dispositivo BPS-001 com app.cli create-device")
        device.hive_id = hive.id
        device.local_camera_url = "http://192.168.4.1/stream"
        device.last_seen_at = BASE_TIME

        temperatures = [38.0, 37.4, 36.9, 36.5, 36.2, 35.9, 35.7, 35.5, 35.3, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.6, 34.5, 34.5, 34.4, 34.5, 34.5]
        humidities = [72, 73, 73, 74, 75, 75, 76, 76, 77, 77, 76, 78, 77, 78, 79, 78, 78, 79, 78, 78, 78]
        reservoir = [100, 98, 96, 94, 92, 89, 87, 84, 82, 80, 78, 75, 72, 69, 67, 64, 61, 58, 55, 51, 78]
        positives = [5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 3]

        inserted = 0
        for day in range(21):
            event_uid = f"DEMO-SEED-{day + 1:03d}"
            if db.scalar(select(DeviceSyncEvent.id).where(
                DeviceSyncEvent.device_id == device.id,
                DeviceSyncEvent.event_uid == event_uid,
            )):
                continue
            measured_at = BASE_TIME - timedelta(days=20 - day)
            samples = 25
            db.add(DeviceSyncEvent(
                device_id=device.id,
                event_uid=event_uid,
                payload_hash=f"demo-seed-{day + 1:054d}",
                received_at=measured_at,
            ))
            db.add(Measurement(
                hive_id=hive.id,
                device_id=device.id,
                temperature=temperatures[day],
                humidity=humidities[day],
                reservoir_level_percent=reservoir[day],
                measured_at=measured_at,
                received_at=measured_at,
            ))
            db.add(Detection(
                hive_id=hive.id,
                device_id=device.id,
                samples_analyzed=samples,
                positive_detections=positives[day],
                detected_at=measured_at,
                received_at=measured_at,
            ))
            inserted += 1

        treatment = db.scalar(select(Treatment).where(
            Treatment.hive_id == hive.id,
            Treatment.status == "monitoring",
        ))
        if not treatment:
            treatment = Treatment(
                hive_id=hive.id,
                status="monitoring",
                started_at=BASE_TIME - timedelta(days=21),
                ended_at=None,
            )
            db.add(treatment)
            db.flush()

        releases = [
            ("DEMO-RELEASE-001", 0.26, BASE_TIME - timedelta(days=14, hours=4)),
            ("DEMO-RELEASE-002", 0.26, BASE_TIME - timedelta(days=7, hours=3)),
            ("DEMO-RELEASE-003", 0.26, BASE_TIME - timedelta(hours=4)),
        ]
        for event_uid, amount, released_at in releases:
            if not db.scalar(select(AcidRelease.id).where(
                AcidRelease.device_id == device.id,
                AcidRelease.event_uid == event_uid,
            )):
                db.add(AcidRelease(
                    hive_id=hive.id,
                    device_id=device.id,
                    treatment_id=treatment.id,
                    event_uid=event_uid,
                    released_amount=amount,
                    unit="L",
                    released_at=released_at,
                    received_at=released_at,
                ))

        alert_rows = [
            ("high", "Possível Varroa detectada", "3 detecções positivas em 25 amostras.", BASE_TIME),
            ("medium", "Reservatório em observação", "Nível do reservatório registrado em 32%.", BASE_TIME - timedelta(days=1, minutes=10)),
            ("info", "Dispositivo sincronizado", "Novos dados recebidos com sucesso.", BASE_TIME - timedelta(days=1, minutes=32)),
            ("warning", "Temperatura alta", "Valor fora do limite demonstrativo configurado; não é recomendação científica.", BASE_TIME - timedelta(days=2, hours=2)),
            ("warning", "Câmera desconectada", "A câmera local não respondeu na última verificação.", BASE_TIME - timedelta(days=3)),
        ]
        for severity, title, description, created_at in alert_rows:
            if not db.scalar(select(Alert.id).where(Alert.hive_id == hive.id, Alert.title == title)):
                db.add(Alert(
                    hive_id=hive.id,
                    severity=severity,
                    title=title,
                    description=description,
                    is_read=False,
                    created_at=created_at,
                ))

        db.commit()
        print(f"Demo pronta: {inserted} dias inseridos; colmeia={hive.name}; dispositivo={device.device_uid}")


if __name__ == "__main__":
    seed()
