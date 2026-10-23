#!/bin/sh
set -e

echo "==> Preparing CHMSU HireMe Laravel backend..."

# Clear any cached configurations to ensure environment variables are fresh
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Ensure storage link exists
php artisan storage:link || true

# Run database migrations and optional simulation seeder in background so port binding is never blocked!
echo "==> Triggering background database migrations..."
(
    php artisan migrate --force || true
    if [ "$SEED_SIMULATION" = "true" ]; then
        echo "==> [SEED_SIMULATION] Running Na Ah Company First-Day OJT Seeder..."
        php artisan db:seed --class=NaAhCompanyFirstDayOjtSeeder --force || true
        echo "==> [SEED_SIMULATION] Seeding completed!"
    fi
) &

PORT="${PORT:-8000}"
WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"

echo "==> Starting CHMSU HireMe server on 0.0.0.0:${PORT} with ${WORKERS} workers..."
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
