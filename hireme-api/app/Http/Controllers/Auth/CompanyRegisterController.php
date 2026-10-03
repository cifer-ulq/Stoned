<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\CompanyRegistrationConfirmation;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class CompanyRegisterController extends Controller
{
    /**
     * POST /api/auth/register/company
     *
     * Public endpoint — companies self-register from the login portal.
     * Account is created with Pending status and no MOA.
     * They can log in but cannot post OJT/jobs until admin activates them.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'company_name'  => ['required', 'string', 'max:255'],
            'industry'      => ['required', 'string', 'max:255'],
            'location'      => ['nullable', 'string', 'max:255'],
            'contact_person'=> ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'         => ['nullable', 'string', 'max:50'],
            'password'      => ['required', 'confirmed', Password::min(8)],
        ]);

        // Create the user account
        $user = User::create([
            'name'                 => $data['company_name'],
            'email'                => $data['email'],
            'password'             => Hash::make($data['password']),
            'role'                 => 'company',
            'onboarding_completed' => true,
        ]);

        // Create the company profile — no MOA yet, pending status
        CompanyProfile::create([
            'user_id'          => $user->id,
            'company_name'     => $data['company_name'],
            'company_type'     => $data['industry'],
            'company_location' => $data['location'] ?? null,
            'contact_person'   => $data['contact_person'],
            'contact_email'    => $data['email'],
            'contact_phone'    => $data['phone'] ?? null,
            'moa_status'          => 'Pending',
            'status'              => 'Pending',
            'profile_completed'   => false,
            'registration_source' => 'self',
        ]);

        // Issue auth token so they can log in immediately
        $token = $user->createToken('auth_token')->plainTextToken;

        // Auto-send registration confirmation email
        $emailSent = false;
        try {
            Mail::to($user->email)->send(new CompanyRegistrationConfirmation(
                companyName:   $data['company_name'],
                contactPerson: $data['contact_person'],
                email:         $data['email'],
                industry:      $data['industry'],
                location:      $data['location'] ?? '—',
                phone:         $data['phone'] ?? '',
            ));
            $emailSent = true;
        } catch (\Throwable $e) {
            \Log::error('[CompanyRegister] Failed to send confirmation email: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => 'Company registered successfully. Your account is pending review.',
            'email_sent' => $emailSent,
            'token'      => $token,
            'user'       => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'onboarding_completed' => $user->onboarding_completed,
                'company_profile'      => [
                    'status'     => 'Pending',
                    'moa_status' => 'Pending',
                ],
            ],
        ], 201);
    }
}
