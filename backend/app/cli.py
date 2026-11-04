import argparse, getpass, json, secrets
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import DateTime, func, select
from app.core.security import hash_secret
from app.db.session import Base, SessionLocal, engine
from app.models import Device, Hive, User

MIGRATION_TABLES = [
    "users",
    "hives",
    "devices",
    "treatments",
    "measurements",
    "detections",
    "acid_releases",
    "alerts",
    "device_sync_events",
    "telegram_config",
]

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

def _json_value(value):
    return value.isoformat() if isinstance(value, datetime) else value

def _database_value(column, value):
    if value is None or not isinstance(column.type, DateTime) or isinstance(value, datetime):
        return value
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed

def export_data(output: str):
    destination = Path(output).expanduser().resolve()
    payload = {"format": "bps-data", "version": 1, "tables": {}}
    with engine.connect() as connection:
        for table_name in MIGRATION_TABLES:
            table = Base.metadata.tables[table_name]
            rows = []
            for record in connection.execute(select(table).order_by(table.c.id)).mappings():
                row = {key: _json_value(value) for key, value in record.items()}
                if table_name == "telegram_config":
                    row["bot_token_encrypted"] = None
                    row["enabled"] = False
                rows.append(row)
            payload["tables"][table_name] = rows
    destination.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    destination.chmod(0o600)
    counts = ", ".join(f"{name}={len(rows)}" for name, rows in payload["tables"].items())
    print(f"Migration exported to {destination}")
    print(counts)

def import_data(source: str):
    path = Path(source).expanduser().resolve()
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("format") != "bps-data" or payload.get("version") != 1:
        raise SystemExit("Unsupported migration file")
    tables = payload.get("tables", {})
    if any(name not in tables for name in MIGRATION_TABLES):
        raise SystemExit("Migration file is missing application tables")
    with engine.begin() as connection:
        occupied = {}
        for table_name in MIGRATION_TABLES:
            table = Base.metadata.tables[table_name]
            count = connection.execute(select(func.count()).select_from(table)).scalar_one()
            if count:
                occupied[table_name] = count
        if occupied:
            detail = ", ".join(f"{name}={count}" for name, count in occupied.items())
            raise SystemExit(f"Import refused because the target is not empty: {detail}")
        for table_name in MIGRATION_TABLES:
            table = Base.metadata.tables[table_name]
            rows = [
                {column.name: _database_value(column, row.get(column.name)) for column in table.columns}
                for row in tables[table_name]
            ]
            if rows:
                connection.execute(table.insert(), rows)
    counts = ", ".join(f"{name}={len(tables[name])}" for name in MIGRATION_TABLES)
    print("Migration imported successfully")
    print(counts)

if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["create-user", "create-device", "export-data", "import-data"])
    parser.add_argument("path", nargs="?")
    args = parser.parse_args()
    if args.command == "create-user":
        create_user()
    elif args.command == "create-device":
        create_device()
    elif args.command == "export-data":
        export_data(args.path or "bps-data.migration.json")
    elif args.command == "import-data":
        if not args.path:
            parser.error("import-data requires the migration JSON path")
        import_data(args.path)

