from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_secret
from app.db.session import Base, get_db
from app.main import app
from app.models import Detection, Device, Hive


def test_passages_alternate_and_duplicate_does_not_advance():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    session_local = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with session_local() as db:
        hive = Hive(name="Test hive")
        db.add(hive); db.flush()
        db.add(Device(hive_id=hive.id, device_uid="BPS-CAM-001",
                      api_key_hash=hash_secret("secret")))
        db.commit()

    def override_db():
        db = session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_db
    headers = {"X-Device-Key": "secret"}
    try:
        with TestClient(app) as client:
            first = client.post("/api/v1/vision/passages", headers=headers,
                                json={"device_id": "BPS-CAM-001", "event_id": "p-1"})
            duplicate = client.post("/api/v1/vision/passages", headers=headers,
                                    json={"device_id": "BPS-CAM-001", "event_id": "p-1"})
            second = client.post("/api/v1/vision/passages", headers=headers,
                                 json={"device_id": "BPS-CAM-001", "event_id": "p-2"})
        assert first.status_code == 201
        assert first.json()["classification"] == "sem_varroa"
        assert duplicate.status_code == 200
        assert duplicate.json()["status"] == "duplicate"
        assert second.status_code == 201
        assert second.json()["classification"] == "com_varroa"
        with session_local() as db:
            rows = db.scalars(select(Detection).order_by(Detection.id)).all()
            assert [row.classification for row in rows] == [
                "bee_without_varroa", "bee_with_varroa"
            ]
    finally:
        app.dependency_overrides.clear()
