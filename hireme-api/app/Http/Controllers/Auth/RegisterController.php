<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthCookieService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'           => ['nullable', 'string', 'max:255', 'required_without:first_name'],
            'first_name'     => ['nullable', 'string', 'max:100', 'required_with:last_name', 'required_without:name'],
            'last_name'      => ['nullable', 'string', 'max:100', 'required_with:first_name', 'required_without:name'],
            'middle_initial' => ['nullable', 'string', 'max:10'],
            'email'          => ['required', 'email', 'max:255', 'unique:users'],
            'password'       => ['required', Password::min(8)],
            'role'           => ['required', 'in:student,graduate,jobseeker,company,supervisor,admin'],
            'terms_accepted' => ['required', 'accepted'],
        ], [
            'terms_accepted.accepted' => 'You must read and agree to the Terms of Service and Privacy Policy to register an account.',
            'terms_accepted.required' => 'You must read and agree to the Terms of Service and Privacy Policy to register an account.',
        ]);

        $firstName = isset($data['first_name'])
            ? preg_replace('/\s+/', ' ', trim($data['first_name']))
            : null;
        $lastName = isset($data['last_name'])
            ? preg_replace('/\s+/', ' ', trim($data['last_name']))
            : null;

        $rawMiddle = preg_replace('/[^A-Za-z]/', '', (string) ($data['middle_initial'] ?? ''));
        $middleInitial = $rawMiddle !== '' ? strtoupper(substr($rawMiddle, 0, 1)) : null;

        if ($firstName !== null && $firstName !== '' && $lastName !== null && $lastName !== '') {
            $fullName = $middleInitial
                ? "{$firstName} {$middleInitial}. {$lastName}"
                : "{$firstName} {$lastName}";
        } else {
            $fullName = preg_replace('/\s+/', ' ', trim((string) ($data['name'] ?? '')));
        }

        $attributes = [
            'name'                 => $fullName,
            'email'                => $data['email'],
            'password'             => Hash::make($data['password']),
            'role'                 => $data['role'],
            'onboarding_completed' => false,
            'terms_accepted_at'    => now(),
            'terms_version'        => '1.0',
            'terms_ip'             => $request->ip(),
        ];

        if (Schema::hasColumns('users', ['first_name', 'middle_initial', 'last_name'])) {
            $attributes['first_name']     = $firstName ?: null;
            $attributes['middle_initial'] = $middleInitial;
            $attributes['last_name']      = $lastName ?: null;
        }

        $user = User::create($attributes);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'first_name'           => $user->first_name ?? null,
                'middle_initial'       => $user->middle_initial ?? null,
                'last_name'            => $user->last_name ?? null,
                'email'                => $user->email,
                'role'                 => $user->role,
                'onboarding_completed' => $user->onboarding_completed,
                'terms_accepted_at'    => $user->terms_accepted_at?->toIso8601String(),
                'has_accepted_terms'   => true,
            ],
        ], 201)->withCookie(AuthCookieService::make($token));
    }
}
