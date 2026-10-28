from datetime import datetime
from pydantic import BaseModel, Field, model_validator

class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8, max_length=256)

class VarroaIn(BaseModel):
    samples_analyzed: int = Field(ge=0)
    positive_detections: int = Field(ge=0)
    @model_validator(mode="after")
    def positives_valid(self):
        if self.positive_detections > self.samples_analyzed:
            raise ValueError("positive_detections cannot exceed samples_analyzed")
        return self

class FormicAcidIn(BaseModel):
    reservoir_level_percent: float = Field(ge=0, le=100)
    release_active: bool = False
    released_amount: float | None = Field(default=None, ge=0)
    unit: str | None = Field(default=None, max_length=20)

class EspPayload(BaseModel):
    device_id: str = Field(min_length=1, max_length=100)
    event_id: str = Field(min_length=1, max_length=140)
    timestamp: datetime
    temperature: float = Field(ge=-50, le=100)
    humidity: float = Field(ge=0, le=100)
    varroa: VarroaIn
    formic_acid: FormicAcidIn
    simulated: bool = False

