#!/bin/sh
set -e

echo ">>> [entrypoint] Running database migrations..."
python manage.py migrate --noinput
python manage.py migrate --database=beta_judge --noinput

echo ">>> [entrypoint] Collecting static files..."
python manage.py collectstatic --noinput --clear

echo ">>> [entrypoint] Starting cron (game season jobs)..."
printenv > /etc/environment
cron

echo ">>> [entrypoint] Starting Daphne (ASGI)..."
exec daphne \
    -b 0.0.0.0 \
    -p 8000 \
    config.asgi:application
