<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\Cookie;

class AuthCookieService
{
    public const COOKIE_NAME = 'hireme_token';
    public const MINUTES = 60 * 24 * 7; // 7 days

    /**
     * Create an HttpOnly, Secure cookie holding the authentication token.
     */
    public static function make(string $token): Cookie
    {
        $isSecure = app()->isProduction()
            || request()->isSecure()
            || str_starts_with(config('app.url', ''), 'https://');

        return cookie(
            name: self::COOKIE_NAME,
            value: $token,
            minutes: self::MINUTES,
            path: '/',
            domain: null,
            secure: $isSecure,
            httpOnly: true,
            raw: false,
            sameSite: 'Lax'
        );
    }

    /**
     * Create an expired cookie to effectively clear the token on logout.
     */
    public static function forget(): Cookie
    {
        $isSecure = app()->isProduction()
            || request()->isSecure()
            || str_starts_with(config('app.url', ''), 'https://');

        return cookie(
            name: self::COOKIE_NAME,
            value: '',
            minutes: -2628000,
            path: '/',
            domain: null,
            secure: $isSecure,
            httpOnly: true,
            raw: false,
            sameSite: 'Lax'
        );
    }
}
