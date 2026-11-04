#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/legobros/bioglow_app"
PYTHON="/home/legobros/python311/bin/python3"
BACKEND="$APP_ROOT/backend"
PUBLIC_DIR="/home/legobros/bps_public"

cd "$APP_ROOT"
git pull --ff-only origin main

cd "$BACKEND"
"$PYTHON" -m pip install --only-binary=:all: -r requirements.txt
"$PYTHON" -m alembic upgrade head

mkdir -p "$PUBLIC_DIR" "$BACKEND/tmp"
cp -a "$APP_ROOT/frontend/dist/." "$PUBLIC_DIR/"
touch "$BACKEND/tmp/restart.txt"

echo "Deploy concluido: https://bps.legobros10053.com.br"
