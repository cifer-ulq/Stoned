<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', 'unique:users'],
            'password'       => ['required', Password::min(8)],
            'role'           => ['required', 'in:student,graduate,jobseeker,company,supervisor,admin'],
            'terms_accepted' => ['required', 'accepted'],
        ], [
            'terms_accepted.accepted' => 'You must read and agree to the Terms of Service and Privacy Policy to register an account.',
            'terms_accepted.required' => 'You must read and agree to the Terms of Service and Privacy Policy to register an account.',
        ]);

        $user = User::create([
            'name'                 => $data['name'],
            'email'                => $data['email'],
            'password'             => Hash::make($data['password']),
            'role'                 => $data['role'],
            'onboarding_completed' => false,
            'terms_accepted_at'    => now(),
            'terms_version'        => '1.0',
            'terms_ip'             => $request->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'onboarding_completed' => $user->onboarding_completed,
                'terms_accepted_at'    => $user->terms_accepted_at?->toIso8601String(),
                'has_accepted_terms'   => true,
            ],
        ], 201);
    }
}
