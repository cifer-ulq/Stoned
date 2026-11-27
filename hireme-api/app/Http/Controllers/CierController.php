<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\User;
use App\Services\CompanyPartnershipService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CierController extends Controller
{
    public function __construct(
        private readonly CompanyPartnershipService $partnerships
    ) {}

    private function requireCier(Request $request): void
    {
        if ($request->user()?->role !== 'cier') {
            abort(403, 'CIER access required.');
        }
    }

    /* ── GET /api/cier/companies ── */
    public function listCompanies(Request $request)
    {
        $this->requireCier($request);

        return response()->json($this->partnerships->listCompanies());
    }

    /* ── POST /api/cier/companies ── */
    public function storeCompany(Request $request)
    {
        $this->requireCier($request);

        $data = $request->validate([
            'company_name'    => ['required', 'string', 'max:255'],
            'industry'        => ['required', 'string', 'max:255'],
            'ownership_type'  => ['nullable', 'string', 'max:100'],
            'company_size'    => ['nullable', 'string', 'max:50'],
            'year_founded'    => ['nullable', 'string', 'max:4'],
            'website'         => ['nullable', 'url', 'max:255'],
            'email'           => ['required', 'email', 'unique:users,email'],
            'contact_person'  => ['required', 'string', 'max:255'],
            'contact_title'   => ['nullable', 'string', 'max:100'],
            'phone'           => ['nullable', 'string', 'max:50'],
            'location'        => ['nullable', 'string', 'max:255'],
            'full_address'    => ['nullable', 'string', 'max:500'],
            'description'     => ['nullable', 'string', 'max:1000'],
            'moa_file'        => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'moa_start_date'  => ['nullable', 'date'],
            'moa_duration'    => ['nullable', 'integer', 'min:1', 'max:50'],
            'moa_end_date'    => ['nullable', 'date'],
        ]);

        $result = $this->partnerships->createPartnerCompany($data, $request->file('moa_file'));

        return response()->json($result, 201);
    }

    /* ── POST /api/cier/companies/{id}/send-invitation ── */
    public function sendInvitation(Request $request, $id)
    {
        $this->requireCier($request);

        return response()->json($this->partnerships->sendInvitation($id));
    }

    /* ── DELETE /api/cier/companies/{id} ── (Pending only) */
    public function deleteCompany(Request $request, $id)
    {
        $this->requireCier($request);

        if (!$this->partnerships->deletePendingCompany($id)) {
            return response()->json(['message' => 'Only Pending companies can be deleted.'], 403);
        }

        return response()->json(['message' => 'Company deleted successfully.']);
    }

    /* ── PATCH /api/cier/companies/{id}/status ── */
    public function updateCompanyStatus(Request $request, $id)
    {
        $this->requireCier($request);

        $data = $request->validate([
            'status' => ['required', 'string', 'in:Active,Pending,Suspended,Inactive'],
        ]);

        $this->partnerships->updateStatus($id, $data['status']);

        return response()->json(['message' => 'Status updated.', 'status' => $data['status']]);
    }

    /* ── POST /api/cier/companies/{id}/moa ── */
    public function uploadMoa(Request $request, $id)
    {
        $this->requireCier($request);

        $data = $request->validate([
            'moa_file'       => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'moa_start_date' => ['nullable', 'date'],
            'moa_end_date'   => ['nullable', 'date'],
            'moa_duration'   => ['nullable', 'integer', 'min:1', 'max:50'],
            'moa_status'     => ['nullable', 'string', 'in:Active,Pending,Expired,Requested,Terminated'],
        ]);

        $result = $this->partnerships->uploadAndUpdateMoa($id, $data, $request->file('moa_file'));

        return response()->json($result);
    }

    /* ── GET /api/cier/sidebar ── */
    public function sidebar(Request $request)
    {
        $this->requireCier($request);

        $pendingCompanies = CompanyProfile::with('user')
            ->where(function ($q) {
                $q->where('status', 'Pending')
                  ->orWhere('moa_status', 'Requested');
            })
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get()
            ->map(fn ($p) => [
                'type'   => strtolower((string) $p->moa_status) === 'requested' ? 'moa' : 'company',
                'name'   => $p->company_name ?? $p->user?->name ?? 'Unknown Company',
                'detail' => strtolower((string) $p->moa_status) === 'requested'
                    ? 'MOA partnership review requested'
                    : 'Company registration pending verification',
            ]);

        $recentCompanies = User::where('role', 'company')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(fn ($u) => [
                'icon'  => 'briefcase',
                'color' => 'primary',
                'text'  => 'Company registered: ' . $u->name,
                'time'  => $u->created_at?->diffForHumans(),
                '_ts'   => $u->created_at?->timestamp ?? 0,
            ]);

        $recentMoas = CompanyProfile::with('user')
            ->whereNotNull('moa_start_date')
            ->where('moa_status', 'Active')
            ->orderByDesc('updated_at')
            ->limit(4)
            ->get()
            ->map(fn ($p) => [
                'icon'  => 'file',
                'color' => 'success',
                'text'  => 'MOA active: ' . ($p->company_name ?? $p->user?->name ?? 'Partner'),
                'time'  => $p->updated_at?->diffForHumans(),
                '_ts'   => $p->updated_at?->timestamp ?? 0,
            ]);

        $activities = $recentCompanies
            ->concat($recentMoas)
            ->sortByDesc('_ts')
            ->take(7)
            ->map(fn ($item) => [
                'icon'  => $item['icon'],
                'color' => $item['color'],
                'text'  => $item['text'],
                'time'  => $item['time'],
            ])
            ->values();

        $upcoming = CompanyProfile::with('user')
            ->whereNotNull('moa_end_date')
            ->whereDate('moa_end_date', '>=', Carbon::now()->toDateString())
            ->whereDate('moa_end_date', '<=', Carbon::now()->addDays(60)->toDateString())
            ->orderBy('moa_end_date')
            ->limit(6)
            ->get()
            ->map(fn ($p) => [
                'type'  => 'moa',
                'title' => ($p->company_name ?? $p->user?->name ?? 'Company') . ' MOA',
                'date'  => Carbon::parse($p->moa_end_date)->format('M d, Y'),
                'days'  => Carbon::now()->diffInDays(Carbon::parse($p->moa_end_date), false),
            ]);

        return response()->json([
            'pending'    => $pendingCompanies->values(),
            'activities' => $activities,
            'upcoming'   => $upcoming->values(),
        ]);
    }
}
