import argparse, getpass, secrets
from sqlalchemy import select
from app.core.security import hash_secret
from app.db.session import SessionLocal
from app.models import Device, Hive, User

def create_user():
    username=input("Username: ").strip(); password=getpass.getpass("Password: "); confirm=getpass.getpass("Confirm password: ")
    if len(password)<8 or password!=confirm: raise SystemExit("Passwords must match and contain at least 8 characters")
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username==username)): raise SystemExit("User already exists")
        db.add(User(username=username,password_hash=hash_secret(password))); db.commit(); print("User created.")
def create_device():
    uid=input("Device UID: ").strip(); key=secrets.token_urlsafe(32)
    with SessionLocal() as db:
        hive=db.scalar(select(Hive).order_by(Hive.id))
        if not hive: hive=Hive(name="Colmeia 1",description="Colmeia monitorada",location_label="Não informado"); db.add(hive); db.flush()
        db.add(Device(hive_id=hive.id,device_uid=uid,api_key_hash=hash_secret(key),local_camera_url="http://192.168.4.1/stream")); db.commit()
    print(f"Device created. Save this key now: {key}")
if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("command",choices=["create-user","create-device"]); args=p.parse_args(); create_user() if args.command=="create-user" else create_device()

