import hashlib, secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import HTTPException, Request, status

ph = PasswordHasher()
def hash_secret(value: str) -> str: return ph.hash(value)
def verify_secret(hashed: str, value: str) -> bool:
    try: return ph.verify(hashed, value)
    except VerifyMismatchError: return False
def payload_hash(data: bytes) -> str: return hashlib.sha256(data).hexdigest()
def new_csrf() -> str: return secrets.token_urlsafe(32)
def require_user(request: Request) -> int:
    uid = request.session.get("user_id")
    if not uid: raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return int(uid)
def check_csrf(request: Request):
    supplied = request.headers.get("X-CSRF-Token", "")
    expected = request.session.get("csrf", "")
    if not expected or not secrets.compare_digest(supplied, expected):
        raise HTTPException(status_code=403, detail="Invalid CSRF token")

