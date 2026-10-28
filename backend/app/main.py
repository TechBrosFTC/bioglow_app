from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api.routes import router
from app.core.config import settings

app=FastAPI(title="BPS – Bee Protection System API",version="1.0.0")
app.add_middleware(SessionMiddleware,secret_key=settings.secret_key,https_only=settings.session_https_only,same_site="lax",session_cookie="bps_session",max_age=28800)
app.add_middleware(CORSMiddleware,allow_origins=settings.origins,allow_credentials=True,allow_methods=["GET","POST","PATCH"],allow_headers=["Content-Type","X-CSRF-Token","X-Device-Key"])
app.include_router(router)
@app.get("/health")
def health(): return {"status":"ok"}

