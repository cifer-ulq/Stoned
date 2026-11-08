<?php

namespace App\Http\Middleware;

use App\Services\AuthCookieService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithCookie
{
    /**
     * Handle an incoming request.
     * If the client did not send an Authorization Bearer header,
     * extract the token from the HttpOnly 'hireme_token' cookie.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->bearerToken()) {
            $token = $request->cookie(AuthCookieService::COOKIE_NAME)
                ?? $request->cookies->get(AuthCookieService::COOKIE_NAME);

            if ($token) {
                $request->headers->set('Authorization', 'Bearer ' . $token);
            }
        }

        return $next($request);
    }
}
