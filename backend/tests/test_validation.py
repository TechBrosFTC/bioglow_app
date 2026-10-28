import pytest
from pydantic import ValidationError
from app.schemas.api import EspPayload
def valid(): return {"device_id":"BPS-001","event_id":"evt-1","timestamp":"2026-10-27T15:30:00-03:00","temperature":34.5,"humidity":78,"varroa":{"samples_analyzed":25,"positive_detections":3},"formic_acid":{"reservoir_level_percent":78,"release_active":False},"simulated":True}
def test_payload_valid(): assert EspPayload.model_validate(valid()).varroa.positive_detections==3
def test_positive_cannot_exceed_samples():
    data=valid(); data["varroa"]["positive_detections"]=26
    with pytest.raises(ValidationError): EspPayload.model_validate(data)
def test_percentage_range():
    data=valid(); data["humidity"]=101
    with pytest.raises(ValidationError): EspPayload.model_validate(data)

