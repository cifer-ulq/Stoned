<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Revoke all old tokens and issue a fresh one
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $user->load(['companyProfile', 'studentProfile', 'supervisorProfile', 'jobseekerProfile', 'graduateProfile']);

        $isActiveOjt = false;
        if ($user->role === 'student') {
            $isActiveOjt = StudentOjtInterest::where('student_user_id', $user->id)
                ->whereIn('status', ['accepted', 'ojt_confirmed', 'ojt_started'])
                ->exists() || OjtRecord::where('user_id', $user->id)->whereIn('status', ['active', 'in_progress', 'ojt_started'])->exists();
        }

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'status'               => $isActiveOjt ? 'active_ojt' : ($user->studentProfile?->status ?? 'regular'),
                'is_active_ojt'        => $isActiveOjt,
                'onboarding_completed' => $user->onboarding_completed,
                'company_profile'      => $user->companyProfile,
                'student_profile'      => $user->studentProfile,
                'jobseeker_profile'    => $user->jobseekerProfile,
                'graduate_profile'     => $user->graduateProfile,
            ],
        ]);
    }

    public function adminLogin(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Access denied. Admin accounts only.'], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['companyProfile', 'studentProfile', 'supervisorProfile', 'jobseekerProfile', 'graduateProfile']);

        $isActiveOjt = false;
        if ($user->role === 'student') {
            $isActiveOjt = StudentOjtInterest::where('student_user_id', $user->id)
                ->whereIn('status', ['accepted', 'ojt_confirmed', 'ojt_started'])
                ->exists() || OjtRecord::where('user_id', $user->id)->whereIn('status', ['active', 'in_progress', 'ojt_started'])->exists();
        }

        $data = [
            'success' => true,
            'data'    => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'status'               => $isActiveOjt ? 'active_ojt' : ($user->studentProfile?->status ?? 'regular'),
                'is_active_ojt'        => $isActiveOjt,
                'onboarding_completed' => $user->onboarding_completed,
                'avatar_url'           => $user->avatar_url,
                'company_profile'      => $user->companyProfile,
                'student_profile'      => $user->studentProfile,
                'supervisor_profile'   => $user->supervisorProfile,
                'jobseeker_profile'    => $user->jobseekerProfile,
                'graduate_profile'     => $user->graduateProfile,
            ],
        ];

        return response()->json($data);
    }

    /* ── POST /api/auth/set-password ── (public, token-based) */
    public function setPassword(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'token'    => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            [
                'email'                 => $data['email'],
                'password'              => $data['password'],
                'password_confirmation' => $data['password_confirmation'] ?? $data['password'],
                'token'                 => $data['token'],
            ],
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->save();
                $user->tokens()->delete(); // invalidate any old tokens
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => match($status) {
                    Password::INVALID_TOKEN => 'This link has expired or is invalid. Please request a new invitation.',
                    Password::INVALID_USER  => 'No account found with that email address.',
                    default                 => 'Unable to reset password. Please try again.',
                },
            ], 422);
        }

        // Auto-login after password set
        $user = User::where('email', $data['email'])->first();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Password set successfully.',
            'token'   => $token,
            'user'    => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'onboarding_completed' => $user->onboarding_completed,
            ],
        ]);
    }
}
