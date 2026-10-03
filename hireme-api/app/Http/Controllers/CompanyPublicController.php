<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\JobListing;
use App\Models\OjtPosting;
use Illuminate\Http\Request;

class CompanyPublicController extends Controller
{
    /**
     * GET /api/companies
     * List all active companies (paginated, searchable).
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = CompanyProfile::where('status', 'Active')
            ->where('profile_completed', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('company_type', 'like', "%{$search}%")
                  ->orWhere('company_location', 'like', "%{$search}%");
            });
        }

        $companies = $query->orderBy('company_name')
            ->get()
            ->map(fn($c) => $this->formatCompany($c));

        return response()->json(['success' => true, 'data' => $companies]);
    }

    /**
     * GET /api/companies/{id}
     * Get a single company's public profile.
     */
    public function show($id)
    {
        $profile = CompanyProfile::where('user_id', $id)
            ->where('status', 'Active')
            ->where('profile_completed', true)
            ->first();

        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'Company not found.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->formatCompany($profile, true)]);
    }

    /**
     * GET /api/companies/{id}/jobs
     * Get active job listings for a company.
     */
    public function jobs($id)
    {
        $profile = CompanyProfile::where('user_id', $id)->where('status', 'Active')->first();
        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'Company not found.'], 404);
        }

        $jobs = JobListing::where('company_user_id', $id)
            ->where('status', 'open')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($j) => [
                'id'              => $j->id,
                'title'           => $j->title,
                'department'      => $j->department,
                'location'        => $j->location ?? 'Philippines',
                'employment_type' => $j->employment_type,
                'salary_range'    => $j->salary_range ?? 'Competitive',
                'description'     => $j->description ?? '',
                'required_skills' => $j->required_skills ?? [],
                'expires_at'      => $j->expires_at,
                'created_at'      => $j->created_at,
            ]);

        return response()->json(['success' => true, 'data' => $jobs]);
    }

    /**
     * GET /api/companies/{id}/ojt-postings
     * Get active OJT postings for a company.
     */
    public function ojtPostings($id)
    {
        $profile = CompanyProfile::where('user_id', $id)->where('status', 'Active')->first();
        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'Company not found.'], 404);
        }

        $postings = OjtPosting::where('company_user_id', $id)
            ->where('status', 'open')
            ->with(['interests' => fn($q) => $q->whereIn('status', ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'])])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($p) {
                $occupied = $p->interests->count();
                $slotsTotal = (int) ($p->slots_total ?? 1);
                $slotsRemaining = max(0, $slotsTotal - $occupied);
                if ($p->slots_remaining !== $slotsRemaining) {
                    $p->slots_remaining = $slotsRemaining;
                    $p->saveQuietly();
                }

                return [
                    'id'               => $p->id,
                    'title'            => $p->title,
                    'department'       => $p->department,
                    'industry'         => $p->industry,
                    'location'         => $p->location,
                    'description'      => $p->description,
                    'learning_outcomes'=> $p->learning_outcomes,
                    'required_skills'  => $p->required_skills ?? [],
                    'preferred_courses'=> $p->preferred_courses ?? [],
                    'slots_total'      => $slotsTotal,
                    'slots_remaining'  => $slotsRemaining,
                    'occupied_slots'   => $occupied,
                    'duration'         => $p->duration,
                    'schedule_type'    => $p->schedule_type,
                    'expires_at'       => $p->expires_at,
                    'created_at'       => $p->created_at,
                ];
            });

        return response()->json(['success' => true, 'data' => $postings]);
    }

    /**
     * Format a CompanyProfile for public API response.
     */
    private function formatCompany(CompanyProfile $c, bool $full = false): array
    {
        $base = [
            'id'               => $c->user_id,
            'company_name'     => $c->company_name,
            'company_type'     => $c->company_type,
            'company_location' => $c->company_location,
            'full_address'     => $c->full_address,
            'company_size'     => $c->company_size,
            'ownership_type'   => $c->ownership_type,
            'year_founded'     => $c->year_founded,
            'website'          => $c->website,
            'logo_url'         => $c->logo_url,
            'description'      => $c->description,
            'open_jobs_count'  => JobListing::where('company_user_id', $c->user_id)->where('status', 'open')->count(),
            'open_ojt_count'   => OjtPosting::where('company_user_id', $c->user_id)->where('status', 'open')->count(),
        ];

        if ($full) {
            $base['contact_email']  = $c->contact_email;
            $base['contact_phone']  = $c->contact_phone;
            $base['contact_person'] = $c->contact_person;
            $base['contact_title']  = $c->contact_title;
        }

        return $base;
    }
}
