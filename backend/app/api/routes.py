import json, time
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import check_csrf, new_csrf, payload_hash, require_user, verify_secret
from app.db.session import get_db
from app.models import AcidRelease, Alert, Detection, Device, DeviceSyncEvent, Hive, Measurement, Treatment, User
from app.schemas.api import EspPayload, LoginIn

router = APIRouter(prefix="/api/v1")
login_attempts: dict[str, list[float]] = {}
def serialize(row):
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}
def private(request: Request): return require_user(request)

@router.post("/auth/login")
def login(data: LoginIn, request: Request, db: Session = Depends(get_db)):
    client = request.client.host if request.client else "unknown"
    now = time.time(); attempts = [x for x in login_attempts.get(client, []) if now - x < 300]
    if len(attempts) >= 5: raise HTTPException(429, "Too many login attempts. Try again later.")
    user = db.scalar(select(User).where(User.username == data.username))
    if not user or not user.is_active or not verify_secret(user.password_hash, data.password):
        attempts.append(now); login_attempts[client] = attempts
        raise HTTPException(401, "Invalid username or password")
    login_attempts.pop(client, None)
    request.session.clear(); request.session["user_id"] = user.id; request.session["csrf"] = new_csrf()
    return {"id": user.id, "username": user.username, "csrf_token": request.session["csrf"]}

@router.post("/auth/logout")
def logout(request: Request):
    check_csrf(request); request.session.clear(); return {"ok": True}

@router.get("/auth/me")
def me(request: Request, db: Session = Depends(get_db)):
    user = db.get(User, private(request))
    return {"id": user.id, "username": user.username, "csrf_token": request.session["csrf"]}

@router.get("/hives")
def hives(request: Request, db: Session = Depends(get_db)): private(request); return [serialize(x) for x in db.scalars(select(Hive)).all()]
@router.get("/hives/{item_id}")
def hive(item_id: int, request: Request, db: Session = Depends(get_db)): private(request); return serialize(db.get(Hive,item_id)) if db.get(Hive,item_id) else (_ for _ in ()).throw(HTTPException(404,"Hive not found"))
@router.get("/devices")
def devices(request: Request, db: Session = Depends(get_db)): private(request); return [serialize(x) for x in db.scalars(select(Device)).all()]
@router.get("/devices/{item_id}")
def device(item_id: int, request: Request, db: Session = Depends(get_db)): private(request); x=db.get(Device,item_id); return serialize(x) if x else (_ for _ in ()).throw(HTTPException(404,"Device not found"))

def listing(model, request, db, hive_id=None, limit=200):
    private(request); q=select(model).order_by(model.id.desc()).limit(min(limit,1000))
    if hive_id: q=q.where(model.hive_id==hive_id)
    return [serialize(x) for x in db.scalars(q).all()]
@router.get("/measurements")
def measurements(request:Request,hive_id:int|None=None,limit:int=200,db:Session=Depends(get_db)): return listing(Measurement,request,db,hive_id,limit)
@router.get("/detections")
def detections(request:Request,hive_id:int|None=None,limit:int=200,db:Session=Depends(get_db)): return listing(Detection,request,db,hive_id,limit)
@router.get("/treatments")
def treatments(request:Request,hive_id:int|None=None,limit:int=200,db:Session=Depends(get_db)): return listing(Treatment,request,db,hive_id,limit)
@router.get("/acid-releases")
def releases(request:Request,hive_id:int|None=None,limit:int=200,db:Session=Depends(get_db)): return listing(AcidRelease,request,db,hive_id,limit)
@router.get("/alerts")
def alerts(request:Request,hive_id:int|None=None,limit:int=200,db:Session=Depends(get_db)): return listing(Alert,request,db,hive_id,limit)

@router.patch("/alerts/{item_id}/read")
def read_alert(item_id:int,request:Request,db:Session=Depends(get_db)):
    private(request); check_csrf(request); x=db.get(Alert,item_id)
    if not x: raise HTTPException(404,"Alert not found")
    x.is_read=True; db.commit(); return serialize(x)

@router.get("/dashboard")
def dashboard(request:Request,db:Session=Depends(get_db)):
    private(request); hive=db.scalar(select(Hive).order_by(Hive.id));
    if not hive: return {"empty":True,"demo_mode":settings.demo_mode}
    m=db.scalar(select(Measurement).where(Measurement.hive_id==hive.id).order_by(Measurement.measured_at.desc(),Measurement.id.desc()))
    d=db.scalar(select(Detection).where(Detection.hive_id==hive.id).order_by(Detection.detected_at.desc(),Detection.id.desc()))
    device=db.scalar(select(Device).where(Device.hive_id==hive.id).order_by(Device.id))
    treatment=db.scalar(select(Treatment).where(Treatment.hive_id==hive.id).order_by(Treatment.id.desc()))
    recent=db.scalars(select(Alert).where(Alert.hive_id==hive.id).order_by(Alert.created_at.desc()).limit(5)).all()
    return {"hive":serialize(hive),"measurement":serialize(m) if m else None,"detection":serialize(d) if d else None,"device":serialize(device) if device else None,"treatment":serialize(treatment) if treatment else None,"alerts":[serialize(x) for x in recent],"demo_mode":settings.demo_mode}

def report_data(request,db,hive_id=None,days=30):
    private(request); since=datetime.now(timezone.utc)-timedelta(days=min(days,365)); q=select(Measurement).where(Measurement.measured_at>=since).order_by(Measurement.measured_at)
    if hive_id:q=q.where(Measurement.hive_id==hive_id)
    return [serialize(x) for x in db.scalars(q).all()]
@router.get("/reports/evolution")
def evolution(request:Request,hive_id:int|None=None,days:int=30,db:Session=Depends(get_db)): return {"measurements":report_data(request,db,hive_id,days),"detections":listing(Detection,request,db,hive_id,1000)}
@router.get("/reports/overview")
def overview(request:Request,hive_id:int|None=None,days:int=30,db:Session=Depends(get_db)): return {"period_days":days,"measurements":report_data(request,db,hive_id,days)}
@router.get("/reports/consumption")
def consumption(request:Request,hive_id:int|None=None,db:Session=Depends(get_db)): return {"releases":listing(AcidRelease,request,db,hive_id,1000),"note":"Consumption is shown only when the device supplies a valid amount."}

@router.post("/webhooks/esp32",status_code=201)
async def webhook(data:EspPayload,request:Request,response:Response,x_device_key:str=Header(alias="X-Device-Key"),db:Session=Depends(get_db)):
    device=db.scalar(select(Device).where(Device.device_uid==data.device_id))
    if not device or not verify_secret(device.api_key_hash,x_device_key): raise HTTPException(401,"Invalid device credentials")
    existing=db.scalar(select(DeviceSyncEvent).where(DeviceSyncEvent.device_id==device.id,DeviceSyncEvent.event_uid==data.event_id))
    if existing: response.status_code=200; return {"status":"duplicate","event_id":data.event_id}
    raw=json.dumps(data.model_dump(mode="json"),sort_keys=True,separators=(",",":")).encode()
    measured_at = data.timestamp.astimezone(timezone.utc)
    try:
        db.add(DeviceSyncEvent(device_id=device.id,event_uid=data.event_id,payload_hash=payload_hash(raw)))
        db.add(Measurement(hive_id=device.hive_id,device_id=device.id,temperature=data.temperature,humidity=data.humidity,reservoir_level_percent=data.formic_acid.reservoir_level_percent,measured_at=measured_at))
        db.add(Detection(hive_id=device.hive_id,device_id=device.id,samples_analyzed=data.varroa.samples_analyzed,positive_detections=data.varroa.positive_detections,detected_at=measured_at))
        if data.formic_acid.release_active:
            db.add(AcidRelease(hive_id=device.hive_id,device_id=device.id,event_uid=data.event_id,released_amount=data.formic_acid.released_amount,unit=data.formic_acid.unit,released_at=measured_at))
        device.last_seen_at=datetime.now(timezone.utc); db.commit()
    except Exception: db.rollback(); raise
    return {"status":"accepted","event_id":data.event_id,"simulated":data.simulated}

