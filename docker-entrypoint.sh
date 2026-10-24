#!/bin/sh
set -e

# Run storage symlink if not already created
php artisan storage:link || true

# Run database migrations safely
php artisan migrate --force || true

echo "==> Ensuring Na Ah Company OJT & Fresh BSIT 2026 Alumni Seeders..."
php artisan db:seed --class=NaAhCompanyFirstDayOjtSeeder --force || true
php artisan db:seed --class=FreshBSIT2026AlumniSeeder --force || true
echo "==> Migrations and seeders completed!"

# Cache Laravel configs for high performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

PORT="${PORT:-8000}"

echo "Starting CHMSU HireMe Laravel Backend on port ${PORT}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
