#!/bin/sh
set -e

echo "==> Preparing CHMSU HireMe Laravel backend..."

# Clear any cached configurations to ensure environment variables are fresh
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Ensure storage link exists
php artisan storage:link || true

# Run database migrations and required seeders in background so port binding is never blocked!
echo "==> Triggering background database migrations..."
(
    php artisan migrate --force || true
    echo "==> Ensuring Na Ah Company OJT & Fresh BSIT 2026 Alumni Seeders..."
    php artisan db:seed --class=NaAhCompanyFirstDayOjtSeeder --force || true
    php artisan db:seed --class=FreshBSIT2026AlumniSeeder --force || true
    php artisan db:seed --class=TenActiveOjtStudentsSeeder --force || true
    php artisan db:seed --class=TenFinishedOjtStudentsSeeder --force || true
    echo "==> Background migrations and seeders completed!"
) &

PORT="${PORT:-8000}"
WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"

echo "==> Starting CHMSU HireMe server on 0.0.0.0:${PORT} with ${WORKERS} workers..."
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
