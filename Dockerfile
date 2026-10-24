FROM php:8.3-cli

ENV DEBIAN_FRONTEND=noninteractive
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    zip \
    curl \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        zip \
        gd \
        intl \
        opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy all build files to temporary staging area
COPY . /tmp/app/

# Normalize directory structure: handles both root repo context and subfolder context
RUN if [ -f "/tmp/app/hireme-api/composer.json" ]; then \
        echo "==> Detected repository root context. Deploying hireme-api..." && \
        cp -a /tmp/app/hireme-api/. /var/www/html/; \
    else \
        echo "==> Detected subfolder context. Deploying directly..." && \
        cp -a /tmp/app/. /var/www/html/; \
    fi && rm -rf /tmp/app

# Verify composer.json is present
RUN test -f /var/www/html/composer.json || (echo "ERROR: composer.json not found in /var/www/html" && ls -la /var/www/html && exit 1)

# Install Composer dependencies (with auto-fallback to composer update if lockfile mismatches)
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction --no-scripts --ignore-platform-reqs \
    || composer update --prefer-dist --no-dev --optimize-autoloader --no-interaction --no-scripts --ignore-platform-reqs

# Prepare storage directories and permissions
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

ENV PORT=8000
EXPOSE 8000

CMD sh -c "php artisan package:discover --ansi || true && php artisan storage:link || true && php artisan migrate --force || true && php artisan db:seed --class=NaAhCompanyFirstDayOjtSeeder --force || true && php artisan db:seed --class=FreshBSIT2026AlumniSeeder --force || true && php artisan config:clear || true && php artisan route:clear || true && php artisan view:clear || true && php artisan serve --host=0.0.0.0 --port=\${PORT:-8000}"
