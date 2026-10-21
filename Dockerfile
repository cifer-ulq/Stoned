FROM php:8.3-cli-alpine

# Install system dependencies & PostgreSQL / XML / Image dev libraries
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev

# Install PHP extensions required by Laravel & PostgreSQL
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        gd \
        bcmath \
        opcache \
        xml

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy the Laravel backend directory
COPY hireme-api/ /var/www/html/

# Install dependencies (production mode with --no-scripts to prevent build-time boot errors)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --ignore-platform-reqs

# Prepare storage directories and permissions
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

ENV PORT=8000
EXPOSE 8000

CMD sh -c "php artisan package:discover --ansi || true && php artisan storage:link || true && php artisan migrate --force || true && php artisan config:cache || true && php artisan route:cache || true && php artisan view:cache || true && php artisan serve --host=0.0.0.0 --port=\${PORT:-8000}"
