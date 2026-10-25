<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Mail\ResetPasswordMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        try {
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

            if ($user->role === 'student') {
                $approvalStatus = $user->studentProfile?->approval_status ?? 'approved';
                if ($approvalStatus === 'pending') {
                    $user->tokens()->delete();
                    return response()->json([
                        'success' => false,
                        'code'    => 'ACCOUNT_PENDING_APPROVAL',
                        'message' => 'Your student account is currently pending verification and approval by your OJT Coordinator or Administrator. You will be able to log in once your account has been reviewed.',
                    ], 403);
                }

                if ($approvalStatus === 'rejected') {
                    $user->tokens()->delete();
                    $reason = $user->studentProfile?->rejection_reason;
                    return response()->json([
                        'success' => false,
                        'code'    => 'ACCOUNT_REJECTED',
                        'message' => 'Your student account registration was not approved.' . ($reason ? ' Reason: ' . $reason : ' Please reach out to your OJT department.'),
                    ], 403);
                }
            }

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
                    'must_change_password' => (bool) $user->must_change_password,
                    'onboarding_completed' => $user->onboarding_completed,
                    'company_profile'      => $user->companyProfile,
                    'student_profile'      => $user->studentProfile,
                    'jobseeker_profile'    => $user->jobseekerProfile,
                    'graduate_profile'     => $user->graduateProfile,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Login error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage(),
                'error'   => $e->getMessage(),
                'file'    => $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
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
                'must_change_password' => (bool) $user->must_change_password,
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
                'must_change_password' => false,
                'onboarding_completed' => $user->onboarding_completed,
            ],
        ]);
    }

    /* ── POST /api/auth/change-temporary-password ── (authenticated via Sanctum token) */
    public function changeTemporaryPassword(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->password = Hash::make($data['password']);
        $user->must_change_password = false;
        $user->save();

        $user->load(['companyProfile', 'studentProfile', 'supervisorProfile', 'jobseekerProfile', 'graduateProfile']);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.',
            'user'    => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'status'               => $user->studentProfile?->status ?? 'regular',
                'must_change_password' => false,
                'onboarding_completed' => $user->onboarding_completed,
                'avatar_url'           => $user->avatar_url,
                'student_profile'      => $user->studentProfile,
            ],
        ]);
    }

    /* ── POST /api/auth/forgot-password ── (public, throttled) */
    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', strtolower(trim($data['email'])))->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address. Please check your spelling or register a new account.',
            ], 404);
        }

        try {
            // Generate standard password reset token
            $token = Password::createToken($user);

            // Determine frontend login URL (defaults to live production web if unconfigured or fallback)
            $baseUrl = config('app.login_app_url', env('LOGIN_APP_URL'));
            if (empty($baseUrl)) {
                $baseUrl = 'https://chmsu-hireme.vercel.app/login';
            }
            $baseUrl = rtrim($baseUrl, '/');

            // Construct link pointing to the dedicated reset password page
            $resetUrl = $baseUrl . '/reset-password.html?token=' . urlencode($token) . '&email=' . urlencode($user->email);

            // Send branded email notification
            Mail::to($user->email)->send(new ResetPasswordMail(
                userName:      $user->name,
                userEmail:     $user->email,
                userRole:      $user->role,
                resetUrl:      $resetUrl,
                expireMinutes: (int) config('auth.passwords.users.expire', 60)
            ));

            return response()->json([
                'success' => true,
                'message' => 'A password reset link has been sent to your email address.',
            ]);
        } catch (\Throwable $e) {
            Log::error('[forgotPassword] Mail delivery failure: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Could not send reset email at this moment. Please try again shortly or contact your administrator.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /* ── POST /api/auth/reset-password ── (public, token-based, throttled) */
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email'                 => ['required', 'email'],
            'token'                 => ['required', 'string'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $status = Password::reset(
            [
                'email'                 => strtolower(trim($data['email'])),
                'password'              => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token'                 => $data['token'],
            ],
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->must_change_password = false;
                $user->save();
                $user->tokens()->delete(); // invalidate all previous sessions for security
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'message' => match($status) {
                    Password::INVALID_TOKEN => 'This password reset link has expired or has already been used. Please request a new link.',
                    Password::INVALID_USER  => 'No account found with that email address.',
                    default                 => 'Unable to reset password. Please check your information and try again.',
                },
            ], 422);
        }

        $user = User::where('email', strtolower(trim($data['email'])))->first();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $user->load(['companyProfile', 'studentProfile', 'supervisorProfile', 'jobseekerProfile', 'graduateProfile']);

        // Check if student has pending or rejected approval status
        if ($user->role === 'student') {
            $approvalStatus = $user->studentProfile?->approval_status ?? 'approved';
            if ($approvalStatus === 'pending') {
                return response()->json([
                    'success'               => true,
                    'account_status'        => 'pending_approval',
                    'message'               => 'Password reset successfully! Please note that your student account is still pending verification by your OJT Coordinator.',
                    'requires_verification' => true,
                    'role'                  => $user->role,
                ]);
            }
            if ($approvalStatus === 'rejected') {
                return response()->json([
                    'success'               => true,
                    'account_status'        => 'rejected',
                    'message'               => 'Password reset successfully. Your student account registration was previously declined. Please contact your coordinator.',
                    'requires_verification' => true,
                    'role'                  => $user->role,
                ]);
            }
        }

        // Issue fresh Sanctum auth token for automatic sign-in
        $token = $user->createToken('auth_token')->plainTextToken;

        $isActiveOjt = false;
        if ($user->role === 'student') {
            $isActiveOjt = StudentOjtInterest::where('student_user_id', $user->id)
                ->whereIn('status', ['accepted', 'ojt_confirmed', 'ojt_started'])
                ->exists() || OjtRecord::where('user_id', $user->id)->whereIn('status', ['active', 'in_progress', 'ojt_started'])->exists();
        }

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully. You are now signed in.',
            'token'   => $token,
            'user'    => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'status'               => $isActiveOjt ? 'active_ojt' : ($user->studentProfile?->status ?? 'regular'),
                'is_active_ojt'        => $isActiveOjt,
                'must_change_password' => false,
                'onboarding_completed' => $user->onboarding_completed,
                'company_profile'      => $user->companyProfile,
                'student_profile'      => $user->studentProfile,
                'jobseeker_profile'    => $user->jobseekerProfile,
                'graduate_profile'     => $user->graduateProfile,
            ],
        ]);
    }
}
