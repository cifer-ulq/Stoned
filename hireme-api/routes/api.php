<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\CompanyRegisterController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\OjtController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\JobseekerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CompanyPublicController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\EvaluationController;
use Illuminate\Support\Facades\Route;

// ── Notifications (shared across all portals) ─────────────────────────────
Route::middleware('auth:sanctum')->prefix('notifications')->group(function () {
    Route::get('/',              [NotificationController::class, 'index']);
    Route::get('/sync',          [NotificationController::class, 'sync']);
    Route::get('/unread-count',   [NotificationController::class, 'unreadCount']);
    Route::patch('/read-all',    [NotificationController::class, 'markAllRead']);
    Route::delete('/clear-all',  [NotificationController::class, 'clearAll']);
    Route::patch('/{id}/read',   [NotificationController::class, 'markRead']);
    Route::delete('/{id}',       [NotificationController::class, 'destroy']);
});

Route::prefix('auth')->group(function () {
    Route::post('register',          [RegisterController::class, 'register']);
    Route::post('register/company',  [CompanyRegisterController::class, 'register']); // company self-registration
    Route::post('login',         [LoginController::class,   'login']);
    Route::post('admin-login',   [LoginController::class,   'adminLogin']);
    Route::post('set-password',  [LoginController::class,   'setPassword']); // company onboarding

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',      [LoginController::class,      'logout']);
        Route::get('me',           [LoginController::class,      'me']);
        Route::post('onboarding',  [OnboardingController::class, 'store']);
    });
});

// ── OJT public (student-authenticated) routes ────────────────────────────────
Route::middleware('auth:sanctum')->prefix('ojt')->group(function () {
    Route::get('postings',             [OjtController::class, 'postings']);
    Route::get('my-interests',         [OjtController::class, 'myInterests']);
    Route::post('interest/{id}',       [OjtController::class, 'expressInterest']);
    Route::delete('interest/{id}',     [OjtController::class, 'removeInterest']);
});

// ── Company routes ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('company')->group(function () {
    Route::post('profile/complete',               [CompanyController::class, 'completeProfile']); // onboarding step 2
    Route::get('profile',                         [CompanyController::class, 'getProfile']);
    Route::post('profile',                        [CompanyController::class, 'saveProfile']);
    Route::post('request-moa',                    [CompanyController::class, 'requestMoa']);
    Route::get('dashboard',                       [CompanyController::class, 'dashboard']);
    Route::get('ojt-trainees',                    [CompanyController::class, 'ojtTrainees']);
    Route::get('ojt-postings',                    [CompanyController::class, 'ojtPostings']);
    Route::post('ojt-postings',                   [CompanyController::class, 'storeOjtPosting']);
    Route::put('ojt-postings/{id}',               [CompanyController::class, 'updateOjtPosting']);
    Route::delete('ojt-postings/{id}',            [CompanyController::class, 'deleteOjtPosting']);
    Route::get('ojt-postings/{id}/interests',     [CompanyController::class, 'postingInterests']);
    Route::post('ojt-postings/{postingId}/accept/{interestId}',               [CompanyController::class, 'acceptStudent']);
    Route::post('ojt-postings/{postingId}/reject/{interestId}',               [CompanyController::class, 'rejectStudent']);
    Route::post('ojt-postings/{postingId}/request-endorsement/{interestId}',  [CompanyController::class, 'requestEndorsement']);
    Route::post('ojt-postings/{postingId}/start-ojt/{interestId}',            [CompanyController::class, 'startOjt']);
    Route::post('ojt-postings/{postingId}/mark-viewed/{interestId}',             [CompanyController::class, 'markResumeViewed']);
    Route::post('ojt-postings/{postingId}/schedule-interview/{interestId}',      [CompanyController::class, 'scheduleOjtInterview']);
    Route::post('ojt-postings/{postingId}/accept-after-interview/{interestId}',  [CompanyController::class, 'acceptAfterInterview']);
    Route::post('ojt-postings/{postingId}/set-ojt-start/{interestId}',           [CompanyController::class, 'setOjtInstructions']);

    // Job Listings CRUD
    Route::get('jobs',              [CompanyController::class, 'listJobs']);
    Route::post('jobs',             [CompanyController::class, 'storeJob']);
    Route::put('jobs/{id}',         [CompanyController::class, 'updateJob']);
    Route::delete('jobs/{id}',      [CompanyController::class, 'deleteJob']);

    // Job Applications (incoming)
    Route::get('applications',                   [CompanyController::class, 'listApplications']);
    Route::patch('applications/{id}/status',     [CompanyController::class, 'updateApplicationStatus']);
    Route::get('applications/{id}/resume',       [CompanyController::class, 'getApplicantResume']);
    Route::post('applications/{id}/interview',   [CompanyController::class, 'scheduleInterview']);

    // Interviews
    Route::get('interviews',                       [CompanyController::class, 'listInterviews']);
    Route::put('interviews/{id}/cancel',           [CompanyController::class, 'cancelInterview']);
    Route::put('interviews/{id}/reschedule',       [CompanyController::class, 'rescheduleInterview']);

    // Analytics
    Route::get('analytics',                        [CompanyController::class, 'analytics']);

    // OJT Evaluations (Company Side)
    Route::get('evaluations/pending',              [EvaluationController::class, 'companyPendingEvaluations']);
    Route::get('evaluations/{id}',                 [EvaluationController::class, 'companyEvaluationForm']);
    Route::post('evaluations/{id}/submit',         [EvaluationController::class, 'submitEvaluation']);
});

// ── Supervisor routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('supervisor')->group(function () {
    Route::get('dashboard',            [SupervisorController::class, 'dashboard']);
    Route::get('interests',            [SupervisorController::class, 'interests']);
    Route::get('interests/count',      [SupervisorController::class, 'interestCount']);
    Route::get('posting/{id}/applications', [SupervisorController::class, 'postingApplications']);
    Route::post('recommend/{id}',              [SupervisorController::class, 'recommend']);
    Route::post('reject/{id}',                 [SupervisorController::class, 'reject']);
    Route::post('request-endorsement/{id}',    [SupervisorController::class, 'requestEndorsement']);
    Route::post('final-accept/{id}',           [SupervisorController::class, 'finalAccept']);
    Route::get('trainees',                                [SupervisorController::class, 'trainees']);
    Route::post('students/import',                        [SupervisorController::class, 'importStudents']);
    Route::get('monitoring',                              [SupervisorController::class, 'monitoringOverview']);
    Route::get('monitoring/student/{userId}/logs',        [SupervisorController::class, 'monitoringStudentLogs']);
    Route::get('analytics',                               [SupervisorController::class, 'analytics']);

    // Requirements assignment & review
    Route::post('requirements/assign',                     [SupervisorController::class, 'assignRequirements']);
    Route::get('requirements/student/{studentId}',         [SupervisorController::class, 'getStudentRequirements']);
    Route::put('requirements/{id}/review',                 [SupervisorController::class, 'reviewRequirements']);

    // Evaluations (Supervisor / Coordinator Side)
    Route::get('evaluations/templates',                    [EvaluationController::class, 'listTemplates']);
    Route::post('evaluations/templates',                   [EvaluationController::class, 'createTemplate']);
    Route::get('evaluations/templates/{id}',               [EvaluationController::class, 'getTemplateById']);
    Route::put('evaluations/templates/{id}',               [EvaluationController::class, 'updateTemplate']);
    Route::delete('evaluations/templates/{id}',            [EvaluationController::class, 'deleteTemplate']);
    Route::get('evaluations/template',                     [EvaluationController::class, 'getTemplate']);
    Route::post('evaluations/template/question',           [EvaluationController::class, 'addQuestion']);
    Route::post('evaluations/templates/{template_id}/questions', [EvaluationController::class, 'addQuestion']);
    Route::put('evaluations/template/question/{id}',       [EvaluationController::class, 'updateQuestion']);
    Route::delete('evaluations/template/question/{id}',    [EvaluationController::class, 'deleteQuestion']);
    Route::get('evaluations/trainees',                     [EvaluationController::class, 'trainees']);
    Route::post('evaluations/send/{student_id}',           [EvaluationController::class, 'sendEvaluation']);
    Route::post('evaluations/send-batch',                  [EvaluationController::class, 'sendBatch']);
    Route::post('evaluations/remind/{id}',                 [EvaluationController::class, 'remindCompany']);
    Route::get('evaluations/{id}/details',                 [EvaluationController::class, 'evaluationDetails']);
});

// ── Student routes ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('student')->group(function () {
    Route::get('dashboard', [StudentController::class, 'dashboard']);
    Route::get('profile',   [StudentController::class, 'profile']);
    Route::get('portfolio', [StudentController::class, 'portfolio']);
    Route::post('avatar',   [StudentController::class, 'uploadAvatar']);

    // About & Resume
    Route::put('about',              [StudentController::class, 'updateAbout']);
    Route::put('resume',             [StudentController::class, 'updateResume']);
    Route::put('requirements-drive', [StudentController::class, 'updateRequirementsDrive']);
    Route::get('requirements',       [StudentController::class, 'getRequirements']);
    Route::put('requirements/submit',[StudentController::class, 'submitRequirementsDrive']);

    // Education
    Route::post('education',       [StudentController::class, 'storeEducation']);
    Route::put('education/{id}',   [StudentController::class, 'updateEducation']);
    Route::delete('education/{id}',[StudentController::class, 'deleteEducation']);

    // Experience
    Route::post('experience',       [StudentController::class, 'storeExperience']);
    Route::put('experience/{id}',   [StudentController::class, 'updateExperience']);
    Route::delete('experience/{id}',[StudentController::class, 'deleteExperience']);

    // Skills
    Route::post('skills',       [StudentController::class, 'storeSkill']);
    Route::put('skills/{id}',   [StudentController::class, 'updateSkill']);
    Route::delete('skills/{id}',[StudentController::class, 'deleteSkill']);

    // Projects
    Route::post('projects/upload-image', [StudentController::class, 'uploadProjectImage']);
    Route::post('projects',              [StudentController::class, 'storeProject']);
    Route::put('projects/{id}',          [StudentController::class, 'updateProject']);
    Route::delete('projects/{id}',       [StudentController::class, 'deleteProject']);

    // Achievements
    Route::post('achievements/upload-certificate', [StudentController::class, 'uploadAchievementCertificate']);
    Route::post('achievements',                    [StudentController::class, 'storeAchievement']);
    Route::put('achievements/{id}',                [StudentController::class, 'updateAchievement']);
    Route::delete('achievements/{id}',             [StudentController::class, 'deleteAchievement']);

    // OJT Tracker
    Route::get('ojt-tracker',           [StudentController::class, 'ojtTracker']);
    Route::post('ojt-tracker/log',      [StudentController::class, 'logAttendance']);
    Route::post('ojt-tracker/log-in',   [StudentController::class, 'logTimeIn']);
    Route::post('ojt-tracker/log-out',  [StudentController::class, 'logTimeOut']);

    // Jobs, Applications & Interviews
    Route::get('jobs',                  [StudentController::class, 'jobs']);
    Route::get('external-jobs',         [StudentController::class, 'externalJobs']);
    Route::get('applications',          [StudentController::class, 'applications']);
    Route::post('apply/{jobId}',        [StudentController::class, 'apply']);
    Route::delete('applications/{id}',  [StudentController::class, 'withdrawApplication']);
    Route::get('interviews',            [StudentController::class, 'interviews']);

    // Employment / OJT status gate (used by jobs & OJT pages)
    Route::get('employment-status',     [StudentController::class, 'employmentStatus']);

    // Sidebar — People You Know
    Route::get('people-you-know',       [StudentController::class, 'peopleYouKnow']);

    // OJT Evaluation (Student View)
    Route::get('evaluation',            [EvaluationController::class, 'studentEvaluation']);

    // Alumni PEO Survey & Self-Assessment
    Route::get('peo-survey',            [StudentController::class, 'getPeoSurvey']);
    Route::post('peo-survey',           [StudentController::class, 'submitPeoSurvey']);
});

// ── Jobseeker routes ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('jobseeker')->group(function () {
    Route::get('profile',           [JobseekerController::class, 'getProfile']);
    Route::post('profile',          [JobseekerController::class, 'saveProfile']);
    Route::get('dashboard',         [JobseekerController::class, 'dashboard']);
    Route::get('portfolio',         [JobseekerController::class, 'portfolio']);
    Route::get('jobs',              [JobseekerController::class, 'jobs']);
    Route::get('external-jobs',     [JobseekerController::class, 'externalJobs']);
    Route::get('applications',      [JobseekerController::class, 'applications']);
    Route::delete('applications/{id}', [JobseekerController::class, 'withdrawApplication']);
    Route::post('applications/{id}/accept-offer', [JobseekerController::class, 'acceptOffer']);
    Route::post('applications/{id}/reject-offer', [JobseekerController::class, 'rejectOffer']);
    Route::post('apply/{jobId}',    [JobseekerController::class, 'apply']);
    Route::get('interviews',        [JobseekerController::class, 'interviews']);

    // About
    Route::put('about',             [JobseekerController::class, 'updateAbout']);

    // Education
    Route::post('education',        [JobseekerController::class, 'storeEducation']);
    Route::put('education/{id}',    [JobseekerController::class, 'updateEducation']);
    Route::delete('education/{id}', [JobseekerController::class, 'deleteEducation']);

    // Experience
    Route::post('experience',       [JobseekerController::class, 'storeExperience']);
    Route::put('experience/{id}',   [JobseekerController::class, 'updateExperience']);
    Route::delete('experience/{id}',[JobseekerController::class, 'deleteExperience']);

    // Skills
    Route::post('skills',           [JobseekerController::class, 'storeSkill']);
    Route::put('skills/{id}',       [JobseekerController::class, 'updateSkill']);
    Route::delete('skills/{id}',    [JobseekerController::class, 'deleteSkill']);

    // Projects
    Route::post('projects/upload-image', [JobseekerController::class, 'uploadProjectImage']);
    Route::post('projects',              [JobseekerController::class, 'storeProject']);
    Route::put('projects/{id}',          [JobseekerController::class, 'updateProject']);
    Route::delete('projects/{id}',       [JobseekerController::class, 'deleteProject']);

    // Achievements
    Route::post('achievements/upload-certificate', [JobseekerController::class, 'uploadAchievementCertificate']);
    Route::post('achievements',                    [JobseekerController::class, 'storeAchievement']);
    Route::put('achievements/{id}',                [JobseekerController::class, 'updateAchievement']);
    Route::delete('achievements/{id}',             [JobseekerController::class, 'deleteAchievement']);

    // People You May Know
    Route::get('people-you-may-know',   [JobseekerController::class, 'peopleYouMayKnow']);

    // Profile Completeness
    Route::get('profile-completeness',  [JobseekerController::class, 'profileCompleteness']);

    // Employment status gate (used by jobs page)
    Route::get('employment-status',     [JobseekerController::class, 'employmentStatus']);
});

// ── Company Public Profile (any authenticated user) ───────────────────────────
Route::middleware('auth:sanctum')->prefix('companies')->group(function () {
    Route::get('/',                  [CompanyPublicController::class, 'index']);
    Route::get('/{id}',              [CompanyPublicController::class, 'show']);
    Route::get('/{id}/jobs',         [CompanyPublicController::class, 'jobs']);
    Route::get('/{id}/ojt-postings', [CompanyPublicController::class, 'ojtPostings']);
});

// ── Student Public Profile (viewable by any authenticated user e.g. company) ──
Route::middleware('auth:sanctum')->get('students/{userId}/public-profile', [StudentController::class, 'publicProfile']);


// ── Chat (bidirectional messaging between applicants and companies) ───────────
Route::middleware('auth:sanctum')->prefix('chat')->group(function () {
    Route::get('conversations',          [ChatController::class, 'conversations']);
    Route::get('unread-count',           [ChatController::class, 'unreadCount']);
    Route::get('coordinators',           [ChatController::class, 'listCoordinators']);
    Route::get('companies',              [ChatController::class, 'listCompanies']);
    Route::get('init/{type}/{id}',       [ChatController::class, 'init']);
    Route::get('{key}/messages',         [ChatController::class, 'messages']);
    Route::post('{key}/messages',        [ChatController::class, 'send']);
});

// ── Admin routes ──────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('dashboard',                        [AdminController::class, 'dashboard']);
    Route::get('sidebar',                          [AdminController::class, 'sidebar']);
    Route::get('students',                         [AdminController::class, 'listStudents']);
    Route::post('students/import',                 [AdminController::class, 'importStudents']);
    Route::post('alumni/import',                   [AdminController::class, 'importAlumni']);
    Route::post('students/promote-graduates',      [AdminController::class, 'promoteGraduates']);

    Route::get('ojt',                              [AdminController::class, 'listOjt']);
    Route::get('companies',                        [AdminController::class, 'listCompanies']);
    Route::post('companies',                       [AdminController::class, 'storeCompany']);
    Route::post('companies/{id}/send-invitation',  [AdminController::class, 'sendInvitation']);
    Route::patch('companies/{id}/status',          [AdminController::class, 'updateCompanyStatus']);
    Route::post('companies/{id}/moa',             [AdminController::class, 'uploadMoa']);
    Route::delete('companies/{id}',                [AdminController::class, 'deleteCompany']);
    Route::get('jobs',                             [AdminController::class, 'listJobs']);
    Route::get('alumni-analytics',                 [AdminController::class, 'alumniAnalytics']);
    Route::get('peo-analytics',                    [AdminController::class, 'peoAnalytics']);
    Route::get('skills-matching',                  [AdminController::class, 'skillsMatching']);

    // Supervisors
    Route::get('supervisors',                      [AdminController::class, 'listSupervisors']);
    Route::post('supervisors',                     [AdminController::class, 'storeSupervisor']);
    Route::delete('supervisors/{id}',              [AdminController::class, 'deleteSupervisor']);

    // OJT Analytics
    Route::get('ojt-analytics',                    [AdminController::class, 'ojtAnalytics']);

    // Notifications & Broadcast
    Route::post('notifications/broadcast',         [NotificationController::class, 'broadcastToStudents']);
});
