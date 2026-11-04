"""WSGI entry point used by cPanel's Phusion Passenger."""

import os
import sys


# Keep cPanel's system Python untouched. The application uses a portable
# interpreter installed only for the legobros account.
INTERPRETER = "/home/legobros/python311/bin/python3"
if sys.executable != INTERPRETER:
    os.execl(INTERPRETER, INTERPRETER, *sys.argv)

from a2wsgi import ASGIMiddleware

from app.main import app


application = ASGIMiddleware(app)
