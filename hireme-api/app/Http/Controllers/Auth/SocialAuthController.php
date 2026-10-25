<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Resolve the normalized frontend base URL.
     */
    protected function getFrontendBaseUrl(Request $request = null): string
    {
        if ($request) {
            $origin = $request->headers->get('origin') ?: $request->headers->get('referer');
            if ($origin && str_contains($origin, 'vercel.app')) {
                $parsed = parse_url($origin);
                if (!empty($parsed['scheme']) && !empty($parsed['host'])) {
                    return $parsed['scheme'] . '://' . $parsed['host'] . '/login';
                }
            }
        }

        $baseUrl = config('app.login_app_url', env('LOGIN_APP_URL'));
        if (empty($baseUrl) || str_contains($baseUrl, 'stoned-two')) {
            $baseUrl = 'https://chmsu-hireme.vercel.app/login';
        }
        return rtrim($baseUrl, '/');
    }

    /**
     * Determine whether the provider is configured in environment/config.
     */
    protected function isProviderConfigured(string $provider): bool
    {
        $driverKey = $provider === 'linkedin' ? 'linkedin-openid' : $provider;
        $clientId = config("services.{$driverKey}.client_id") ?: config("services.{$provider}.client_id");
        $clientSecret = config("services.{$driverKey}.client_secret") ?: config("services.{$provider}.client_secret");

        return ! empty($clientId) && ! empty($clientSecret);
    }

    /**
     * Get the appropriate Socialite driver name.
     */
    protected function getDriverName(string $provider): string
    {
        if ($provider === 'linkedin') {
            return config('services.linkedin-openid.client_id') ? 'linkedin-openid' : 'linkedin';
        }
        return $provider;
    }

    /**
     * Get OAuth Authorization URL (returns JSON for frontend consumption).
     */
    public function getAuthUrl(Request $request, string $provider)
    {
        $normalizedProvider = strtolower(trim($provider));
        if (! in_array($normalizedProvider, ['google', 'linkedin'])) {
            return response()->json(['success' => false, 'message' => 'Unsupported provider.'], 400);
        }

        if (! $this->isProviderConfigured($normalizedProvider)) {
            return response()->json([
                'success' => false,
                'configured' => false,
                'message' => ucfirst($normalizedProvider) . ' OAuth credentials (Client ID and Secret) are not yet configured in the environment settings.',
            ], 422);
        }

        try {
            $driver = Socialite::driver($this->getDriverName($normalizedProvider))->stateless();
            
            // For Google, you can optionally prefer university accounts
            if ($normalizedProvider === 'google' && $request->query('prompt_domain') === 'chmsu') {
                $driver->with(['hd' => 'chmsu.edu.ph']);
            }

            $url = $driver->redirect()->getTargetUrl();

            return response()->json([
                'success'    => true,
                'configured' => true,
                'url'        => $url,
            ]);
        } catch (\Throwable $e) {
            \Log::error("[SocialAuth] Error getting auth URL for {$normalizedProvider}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Could not initiate ' . ucfirst($normalizedProvider) . ' authentication: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Browser redirect directly to Provider OAuth screen.
     */
    public function redirect(Request $request, string $provider)
    {
        $normalizedProvider = strtolower(trim($provider));
        $frontendUrl = $this->getFrontendBaseUrl();

        if (! in_array($normalizedProvider, ['google', 'linkedin'])) {
            return redirect($frontendUrl . '/?oauth_error=' . urlencode('Unsupported social provider.'));
        }

        if (! $this->isProviderConfigured($normalizedProvider)) {
            $msg = ucfirst($normalizedProvider) . ' sign-in is not yet configured on this server. Please contact your administrator to set up ' . ucfirst($normalizedProvider) . ' Client credentials.';
            return redirect($frontendUrl . '/?oauth_error=' . urlencode($msg));
        }

        try {
            $driver = Socialite::driver($this->getDriverName($normalizedProvider))->stateless();

            if ($normalizedProvider === 'google' && $request->query('prompt_domain') === 'chmsu') {
                $driver->with(['hd' => 'chmsu.edu.ph']);
            }

            return $driver->redirect();
        } catch (\Throwable $e) {
            \Log::error("[SocialAuth] Redirect error for {$normalizedProvider}: " . $e->getMessage());
            return redirect($frontendUrl . '/?oauth_error=' . urlencode('Could not connect to ' . ucfirst($normalizedProvider) . '.'));
        }
    }

    /**
     * Handle OAuth Callback from Provider.
     */
    public function handleCallback(Request $request, string $provider)
    {
        $normalizedProvider = strtolower(trim($provider));
        $frontendUrl = $this->getFrontendBaseUrl();

        if ($request->has('error') || $request->has('error_description')) {
            $err = $request->get('error_description') ?: $request->get('error') ?: 'Sign in cancelled.';
            return redirect($frontendUrl . '/?oauth_error=' . urlencode($err));
        }

        try {
            $driverName = $this->getDriverName($normalizedProvider);
            $socialUser = Socialite::driver($driverName)->stateless()->user();

            $email = strtolower(trim($socialUser->getEmail() ?? ''));
            if (empty($email)) {
                return redirect($frontendUrl . '/?oauth_error=' . urlencode('No email was provided by ' . ucfirst($normalizedProvider) . '. Please allow email access to proceed.'));
            }

            $socialId = (string) $socialUser->getId();
            $name     = $socialUser->getName() ?: ($socialUser->getNickname() ?: 'Student User');
            $avatar   = $socialUser->getAvatar();

            // Find existing user by email or provider ID
            $user = User::where('email', $email)
                ->orWhere(function ($q) use ($normalizedProvider, $socialId) {
                    if ($normalizedProvider === 'google') {
                        $q->where('google_id', $socialId);
                    } elseif ($normalizedProvider === 'linkedin') {
                        $q->where('linkedin_id', $socialId);
                    }
                })->first();

            $isNewUser = false;

            if ($user) {
                // Link OAuth ID to existing account
                if ($normalizedProvider === 'google' && empty($user->google_id)) {
                    $user->google_id = $socialId;
                }
                if ($normalizedProvider === 'linkedin' && empty($user->linkedin_id)) {
                    $user->linkedin_id = $socialId;
                }
                if (empty($user->avatar_url) && ! empty($avatar)) {
                    $user->avatar_url = $avatar;
                }
                $user->save();
            } else {
                // Register new user via Social Auth
                $isNewUser = true;
                $user = User::create([
                    'name'                 => $name,
                    'email'                => $email,
                    'password'             => Hash::make(Str::random(32)),
                    'role'                 => 'student', // Default role
                    'avatar_url'           => $avatar,
                    'google_id'            => $normalizedProvider === 'google' ? $socialId : null,
                    'linkedin_id'          => $normalizedProvider === 'linkedin' ? $socialId : null,
                    'provider'             => $normalizedProvider,
                    'must_change_password' => false,
                    'onboarding_completed' => false,
                ]);

                // Create associated student profile
                $user->studentProfile()->create([
                    'school'          => 'Carlos Hilado Memorial State University',
                    'campus'          => 'Main Campus',
                    'program'         => 'Bachelor of Science in Information Technology',
                    'year_level'      => '4th Year',
                    'status'          => 'regular',
                    'approval_status' => 'pending',
                ]);
            }

            $user->load(['companyProfile', 'studentProfile', 'supervisorProfile', 'jobseekerProfile', 'graduateProfile']);

            // Student approval check
            if ($user->role === 'student') {
                $approvalStatus = $user->studentProfile?->approval_status ?? 'approved';
                if ($approvalStatus === 'pending' && ! $isNewUser) {
                    return redirect($frontendUrl . '/?oauth_error=' . urlencode('Your student account is currently pending approval by your OJT Coordinator.'));
                }
                if ($approvalStatus === 'rejected') {
                    return redirect($frontendUrl . '/?oauth_error=' . urlencode('Your student account registration was declined. Please reach out to your OJT department.'));
                }
            }

            // Issue Sanctum Token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Route user: if new student who needs profile completion, pass new_account flag
            if ($isNewUser || ! $user->onboarding_completed) {
                return redirect($frontendUrl . '/?oauth_token=' . urlencode($token) . '&new_account=1');
            }

            // Otherwise, redirect to login page with token to complete session hydration
            return redirect($frontendUrl . '/?oauth_token=' . urlencode($token));

        } catch (\Throwable $e) {
            \Log::error("[SocialAuth] Callback error for {$normalizedProvider}: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect($frontendUrl . '/?oauth_error=' . urlencode('Social authentication failed: ' . $e->getMessage()));
        }
    }
}
