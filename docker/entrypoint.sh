#!/bin/sh
set -e

echo ">>> [entrypoint] Running database migrations..."
python manage.py migrate --noinput

echo ">>> [entrypoint] Collecting static files..."
python manage.py collectstatic --noinput --clear

echo ">>> [entrypoint] Starting Daphne (ASGI)..."
exec daphne \
    -b 0.0.0.0 \
    -p 8000 \
    config.asgi:application
