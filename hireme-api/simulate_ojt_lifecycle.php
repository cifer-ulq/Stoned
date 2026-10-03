<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\StudentEvaluation;
use App\Models\StudentEvaluationAnswer;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

echo "==========================================================" . PHP_EOL;
echo "  OJT LIFECYCLE SIMULATION & ATTENDANCE GENERATOR" . PHP_EOL;
echo "==========================================================" . PHP_EOL . PHP_EOL;

// 1. Fetch Key Entities
$student = User::where('email', 'bea.castillo.bsit4b@chmsu.edu.ph')->first();
$company = User::where('email', 'hr@innotek.ph')->first();
$supervisor = User::where('email', 'supervisor@chmsu.edu.ph')->first();
$posting = OjtPosting::find(28);

if (!$student) {
    die("Error: Student Bea Bianca Castillo not found!" . PHP_EOL);
}
if (!$company) {
    die("Error: Company Innotek HR not found!" . PHP_EOL);
}
if (!$supervisor) {
    die("Error: Supervisor Prof. Alma Bernardo not found!" . PHP_EOL);
}
if (!$posting) {
    die("Error: OJT Posting #28 not found!" . PHP_EOL);
}

echo "[1/7] Verified entities:" . PHP_EOL;
echo "  - Student: {$student->name} ({$student->email}) [ID: {$student->id}]" . PHP_EOL;
echo "  - Company: {$company->name} ({$company->email}) [ID: {$company->id}]" . PHP_EOL;
echo "  - Supervisor: {$supervisor->name} ({$supervisor->email}) [ID: {$supervisor->id}]" . PHP_EOL;
echo "  - Posting: #{$posting->id} - {$posting->title}" . PHP_EOL . PHP_EOL;

// 2. Set Passwords to Demo@1234
$defaultPassword = Hash::make('Demo@1234');
$student->update(['password' => $defaultPassword]);
$company->update(['password' => $defaultPassword]);
$supervisor->update(['password' => $defaultPassword]);
echo "[2/7] Passwords reset to 'Demo@1234' for Student, Company, and Supervisor." . PHP_EOL . PHP_EOL;

// 3. Clean up any existing records for Bea to ensure a clean slate
StudentEvaluation::where('student_user_id', $student->id)->delete();
TimeLog::where('user_id', $student->id)->delete();
OjtRecord::where('user_id', $student->id)->delete();
StudentOjtInterest::where('student_user_id', $student->id)->delete();
echo "[3/7] Cleaned up previous OJT test records for {$student->name}." . PHP_EOL . PHP_EOL;

// 4. Calculate Timeline (15 weeks of workdays = 75 workdays)
// Let's make the 75th workday land last Friday (e.g. 2026-09-25)
$workDaysTarget = 75;
$endDate = Carbon::now()->subDays(5)->startOfWeek()->addDays(4); // Friday of last week
$current = clone $endDate;
$workDays = [];

while (count($workDays) < $workDaysTarget) {
    if (!$current->isWeekend()) {
        $workDays[] = $current->copy();
    }
    $current->subDay();
}
$workDays = array_reverse($workDays); // Chronological from earliest to latest
$startDate = $workDays[0]->copy();
$actualEndDate = $workDays[count($workDays) - 1]->copy();

$applicationDate = $startDate->copy()->subWeeks(2)->next(Carbon::MONDAY);
$endorsementReqDate = $applicationDate->copy()->addDays(2);
$endorsedDate = $applicationDate->copy()->addDays(4);
$acceptedDate = $applicationDate->copy()->addDays(7);

echo "[4/7] Timeline calculated:" . PHP_EOL;
echo "  - Application Date: " . $applicationDate->toDateString() . PHP_EOL;
echo "  - Endorsement Date: " . $endorsedDate->toDateString() . PHP_EOL;
echo "  - Placement Accepted: " . $acceptedDate->toDateString() . PHP_EOL;
echo "  - OJT Start Date: " . $startDate->toDateString() . PHP_EOL;
echo "  - OJT End Date: " . $actualEndDate->toDateString() . " (" . count($workDays) . " workdays)" . PHP_EOL . PHP_EOL;

// 5. Create Lifecycle Transitions in StudentOjtInterest
$interest = StudentOjtInterest::create([
    'student_user_id'            => $student->id,
    'ojt_posting_id'             => $posting->id,
    'status'                     => 'ojt_started',
    'student_message'            => "Good day! I am Bea Bianca Castillo, a 4th-year BSIT student eager to render my 600-hour internship at Innotek as a Mobile App Development Intern.",
    'resume_viewed_at'           => $endorsementReqDate,
    'company_note'               => "Strong academic background in mobile development. Endorsement requested.",
    'endorsement_requested_at'   => $endorsementReqDate,
    'endorsed_by'                => $supervisor->id,
    'endorsed_at'                => $endorsedDate,
    'endorsement_letter'         => "endorsements/endorsement_bea_castillo_innotek.pdf",
    'endorsement_letter_sent_at' => $endorsedDate,
    'coordinator_note'           => "Endorsed for 600 hours OJT. Student has satisfied all curriculum prerequisites.",
    'company_accepted_at'        => $acceptedDate,
    'ojt_start_date'             => $startDate->toDateString(),
    'ojt_started_at'             => $startDate,
    'estimated_end_date'         => $actualEndDate->toDateString(),
    'schedule_days'              => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    'shift_start'                => '08:00',
    'shift_end'                  => '17:00',
    'lunch_start'                => '12:00',
    'lunch_end'                  => '13:00',
    'has_lunch_break'            => true,
    'daily_hours'                => 8.0,
    'weekly_hours'               => 40.0,
    'ojt_instructions'           => "Report to Innotek Digital Solutions Bacolod Development Hub at 8:00 AM. Bring your company ID and developer laptop.",
    'created_at'                 => $applicationDate,
    'updated_at'                 => $actualEndDate,
]);
echo "[5/7] StudentOjtInterest lifecycle record created (ID: {$interest->id})." . PHP_EOL . PHP_EOL;

// 6. Create OjtRecord
$ojtRecord = OjtRecord::create([
    'user_id'              => $student->id,
    'company_name'         => $posting->company_name ?? 'Innotek Digital Solutions Philippines Corp.',
    'supervisor_name'      => $supervisor->name,
    'supervisor_email'     => $supervisor->email,
    'location'             => $posting->location ?? 'Bacolod City, Negros Occidental',
    'start_date'           => $startDate->toDateString(),
    'end_date'             => $actualEndDate->toDateString(),
    'required_hours'       => 600.00,
    'completed_hours'      => 600.00,
    'status'               => 'completed',
    'company_instructions' => "Report to Innotek Digital Solutions Bacolod Development Hub at 8:00 AM. Bring your company ID and developer laptop.",
    'schedule_days'        => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    'shift_start'          => '08:00',
    'shift_end'            => '17:00',
    'lunch_start'          => '12:00',
    'lunch_end'            => '13:00',
    'has_lunch_break'      => true,
    'daily_hours'          => 8.0,
    'weekly_hours'         => 40.0,
    'allow_overtime'       => false,
    'max_overtime_hours'   => 0,
    'estimated_end_date'   => $actualEndDate->toDateString(),
    'created_at'           => $startDate,
    'updated_at'           => $actualEndDate,
]);
echo "[6/7] OjtRecord created (ID: {$ojtRecord->id}) with 600/600 hours completed." . PHP_EOL . PHP_EOL;

// 7. Generate 75 TimeLogs (8 hours each = 600 hours total)
echo "[7/7] Generating 75 daily attendance logs..." . PHP_EOL;

$tasks = [
    "Attended company orientation, signed NDA and workspace policies, received development laptop and set up workstation.",
    "Installed Flutter SDK, Android Studio, VS Code extensions, and configured Android emulator and iOS simulator.",
    "Reviewed Innotek mobile coding standards, Git branch naming rules, and Gitlab CI/CD workflow documentation.",
    "Cloned client mobile application repository, resolved dependency version conflicts, and successfully executed initial build.",
    "Explored project architecture and folder structure (Clean Architecture + Bloc pattern state management).",
    "Created feature branch for redesigning user profile screen using custom Innotek design tokens.",
    "Implemented reusable CustomButton and CustomTextField widgets with validation logic and unit tests.",
    "Developed responsive profile dashboard view adhering to Figma designs across phone and tablet breakpoints.",
    "Integrated form validation for user contact information, email formatting, and phone number verification.",
    "Refactored profile screen state handling using Flutter Bloc (ProfileBloc, ProfileEvent, ProfileState).",
    "Configured Dio HTTP client with interceptors for automatic JWT bearer token injection and logging.",
    "Implemented authentication repository methods for login, registration, and refresh token rotation.",
    "Added persistent secure token storage using flutter_secure_storage with encryption.",
    "Built user session timeout dialog and automated redirect to login screen upon 401 Unauthorized response.",
    "Created custom error handler interceptor to transform HTTP exception codes into user-friendly snackbars.",
    "Designed and implemented product catalog listing screen with multi-category tab filtration.",
    "Implemented pull-to-refresh and infinite scroll pagination for product list using scroll controllers.",
    "Optimized network image caching using cached_network_image package to reduce bandwidth usage.",
    "Implemented product search bar with debounced input to limit repetitive API requests.",
    "Added filter modal sheet allowing filtering by price range, availability, rating, and category tags.",
    "Built product details view displaying high-res image carousel, specifications table, and action buttons.",
    "Implemented shopping cart state management with real-time total price calculation and item quantity counters.",
    "Added local cart persistence using Hive NoSQL database for offline shopping basket resilience.",
    "Created checkout overview page displaying shipping address selection, billing summary, and payment options.",
    "Integrated mock payment gateway webview with success and failure callback handling.",
    "Implemented push notification handler using Firebase Cloud Messaging (FCM) background message service.",
    "Configured local notifications using flutter_local_notifications for foreground notification alerts.",
    "Created deep linking router using GoRouter to open specific product screens directly from notification clicks.",
    "Conducted unit tests for CartBloc covering adding items, removing items, and clearing cart upon checkout.",
    "Executed widget tests for ProductCard widget verifying title, price label, and favorite button render correctly.",
    "Implemented dark mode theme support using ThemeData with dynamic system theme brightness listener.",
    "Added internationalization (i18n) support with English and Filipino localization ARB resource files.",
    "Refactored hardcoded UI strings across product and checkout modules to use AppLocalizations.",
    "Created order history screen showing past orders, fulfillment timeline status tracker, and receipts.",
    "Implemented PDF receipt download and share feature using pdf and open_file packages.",
    "Integrated device camera and photo gallery picker using image_picker for user avatar uploads.",
    "Added client-side image compression using flutter_image_compress before upload to reduce payload size.",
    "Integrated AWS S3 pre-signed URL upload flow for uploading customer verification documents securely.",
    "Tested file upload progress indicator and handled connection interruptions during file transfer.",
    "Reviewed pull request feedback with senior mobile engineer and refined code formatting based on Dart analyzer.",
    "Implemented offline data synchronization queue using sqflite to store pending user actions when offline.",
    "Integrated connectivity_plus package to detect network transitions from offline to online automatically.",
    "Tested sync worker to flush cached offline transactions to the backend upon network reconnection.",
    "Optimized SQLite database queries with indexes to enhance search speed across 1,000+ cached items.",
    "Performed stress test on SQLite sync queue simulating sudden Wi-Fi disconnections during high load.",
    "Built in-app chat customer support interface with WebSocket connection for real-time messaging.",
    "Implemented chat bubble widgets with delivery indicators (sent, delivered, read) and timestamps.",
    "Added support for sending image attachments and typing indicators within the chat channel.",
    "Implemented local caching for chat messages to enable instant conversation history rendering upon launch.",
    "Fixed memory leak related to WebSocket stream subscriptions when navigating away from the chat screen.",
    "Configured Google Maps Flutter plugin and added custom map pins for Innotek service branch locations.",
    "Implemented geolocation service using geolocator package to show nearest branch distance to user.",
    "Added route directions polyline overlay on Google Map connecting user position to selected branch.",
    "Integrated biometric authentication (FaceID and fingerprint recognition) using local_auth package.",
    "Implemented fallback PIN security dialog when biometric hardware is unavailable or disabled by user.",
    "Audited app memory consumption using DevTools Memory profiler and eliminated unclosed controllers.",
    "Resolved widget rebuild inefficiencies in product list by converting components into const constructors.",
    "Audited app startup time using Flutter DevTools CPU profiler and deferred initialization of non-critical SDKs.",
    "Reduced app APK bundle size by enabling ProGuard code shrinking, resource shrinking, and split-per-ABI.",
    "Performed cross-device compatibility testing across Samsung Galaxy, Xiaomi, and Google Pixel test devices.",
    "Documented REST API contract changes and submitted feedback to the backend API team via Postman workspace.",
    "Created integration tests using integration_test package covering complete end-to-end checkout flow.",
    "Configured automated GitHub Actions workflow to run flutter test and flutter analyze on every pull request.",
    "Conducted peer code reviews for junior intern peers on the mobile team and provided constructive feedback.",
    "Fixed UI overflow bugs on small screen devices (iPhone SE and Android 360dp width screens).",
    "Implemented custom in-app update notification prompting users when critical mandatory app updates are published.",
    "Configured Sentry error logging SDK for real-time crash reporting and unhandled exception monitoring.",
    "Resolved crash report on Android 14 related to background service permission declarations in Manifest.",
    "Assisted senior developer in preparing release build keystore signing and ProGuard mapping files.",
    "Prepared release notes and app store screenshots for staging environment deployment.",
    "Organized user acceptance testing (UAT) session with internal quality assurance team and recorded bug tickets.",
    "Triaged and resolved 8 reported QA tickets including typography alignment and button ripple color defects.",
    "Completed comprehensive technical documentation and system architecture handover guide for the mobile app.",
    "Delivered final OJT project presentation showcasing the completed mobile modules to the Innotek engineering team.",
    "Completed final exit interview, completed exit clearances with Innotek HR, and finalized 600-hour OJT turnover."
];

// Office coords: Lat 10.6765, Lon 122.9509 (Innotek Bacolod City office)
$baseLat = 10.676520;
$baseLon = 122.950910;

$createdLogs = 0;
foreach ($workDays as $index => $date) {
    $dateStr = $date->toDateString();
    $taskDesc = $tasks[$index] ?? "Rendered 8 hours of mobile application development and debugging tasks.";
    
    // Slight realistic GPS variance within 10-30 meters
    $latVariance = (rand(-20, 20) / 100000);
    $lonVariance = (rand(-20, 20) / 100000);
    $currentLat = $baseLat + $latVariance;
    $currentLon = $baseLon + $lonVariance;

    TimeLog::create([
        'user_id'            => $student->id,
        'ojt_record_id'      => $ojtRecord->id,
        'log_date'           => $dateStr,
        'morning_in'         => '08:00:00',
        'morning_out'        => '12:00:00',
        'afternoon_in'       => '13:00:00',
        'afternoon_out'      => '17:00:00',
        'morning_hours'      => 4.00,
        'afternoon_hours'    => 4.00,
        'hours_rendered'     => 8.00,
        'time_in'            => '08:00:00',
        'time_out'           => '17:00:00',
        'morning_in_lat'     => $currentLat,
        'morning_in_lon'     => $currentLon,
        'morning_out_lat'    => $currentLat,
        'morning_out_lon'    => $currentLon,
        'afternoon_in_lat'   => $currentLat,
        'afternoon_in_lon'   => $currentLon,
        'afternoon_out_lat'  => $currentLat,
        'afternoon_out_lon'  => $currentLon,
        'morning_validity'   => 'In Site',
        'afternoon_validity' => 'In Site',
        'location_validity'  => 'In Site',
        'distance_meters'    => rand(8, 25),
        'latitude'           => $currentLat,
        'longitude'          => $currentLon,
        'status'             => 'approved',
        'description'        => $taskDesc,
        'created_at'         => Carbon::parse("{$dateStr} 17:05:00"),
        'updated_at'         => Carbon::parse("{$dateStr} 17:05:00"),
    ]);

    $createdLogs++;
}

echo "  Successfully generated {$createdLogs} daily TimeLogs." . PHP_EOL;
echo "  Total Hours Rendered: " . ($createdLogs * 8.0) . " / 600.00 hours." . PHP_EOL . PHP_EOL;

// 8. Verification query
$totalHoursLogged = TimeLog::where('user_id', $student->id)->sum('hours_rendered');
$refreshedRecord = OjtRecord::find($ojtRecord->id);

echo "==========================================================" . PHP_EOL;
echo "  SIMULATION COMPLETED SUCCESSFULLY!" . PHP_EOL;
echo "==========================================================" . PHP_EOL;
echo "Summary:" . PHP_EOL;
echo "  - Student: {$student->name} ({$student->email})" . PHP_EOL;
echo "  - OJT Posting: {$posting->title} at {$posting->company_name}" . PHP_EOL;
echo "  - Total TimeLogs: {$createdLogs} days" . PHP_EOL;
echo "  - Hours Logged: {$totalHoursLogged} hrs" . PHP_EOL;
echo "  - OjtRecord Completed Hours: {$refreshedRecord->completed_hours} hrs" . PHP_EOL;
echo "  - OjtRecord Status: {$refreshedRecord->status}" . PHP_EOL;
echo "  - Interest Status: {$interest->status}" . PHP_EOL . PHP_EOL;
echo "Login Credentials for Testing (Password for all: Demo@1234):" . PHP_EOL;
echo "  1. Student:    {$student->email}" . PHP_EOL;
echo "  2. Company:    {$company->email}" . PHP_EOL;
echo "  3. Supervisor: {$supervisor->email}" . PHP_EOL;
echo "==========================================================" . PHP_EOL;
