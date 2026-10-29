/**
 * complete_kevin_lifecycle.js
 * Completes the remaining lifecycle steps for Kevin Morales (Interest ID: 38):
 * 1. Na Ah Company marks resume viewed & accepts student for review (company_reviewed)
 * 2. Na Ah Company requests endorsement from supervisor (endorsement_requested)
 * 3. Supervisor Kate Bermejo approves & issues official endorsement letter (endorsed)
 * 4. Na Ah Company schedules technical interview (interview_scheduled)
 * 5. Wait 6.5s for interview window
 * 6. Na Ah Company accepts candidate post-interview (company_accepted)
 * 7. Supervisor Kate Bermejo grants final university academic approval (accepted)
 * 8. Na Ah Company sets OJT start date to today and shift parameters (ojt_confirmed)
 * 9. Kevin Morales loads OJT Tracker (auto-activates to ojt_started)
 * 10. Kevin Morales clocks in at Na Ah Tech Hub with GPS coordinates!
 */

const BASE_URL = 'https://stoned.onrender.com/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiRequest(path, method = 'GET', body = null, token = null) {
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('================================================================');
  console.log('🔄 CONTINUING OJT LIFECYCLE FOR KEVIN MORALES (INTEREST ID: 38)');
  console.log('================================================================\n');

  // Authenticate Actors
  console.log('📌 Authenticating Actors...');
  const naahLogin = await apiRequest('/auth/login', 'POST', {
    email: 'hr@naahcompany.com',
    password: 'Demo@1234',
  });
  const naahToken = naahLogin.data.token;
  console.log('   ✅ Na Ah Company HR authenticated');

  const supLogin = await apiRequest('/auth/login', 'POST', {
    email: 'katenicolebermejooo@gmail.com',
    password: 'Demo@1234',
  });
  const supToken = supLogin.data.token;
  console.log('   ✅ Supervisor Kate Bermejo authenticated');

  const stuLogin = await apiRequest('/auth/login', 'POST', {
    email: 'kevin.morales.bsit4b@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4B-006',
  });
  const stuToken = stuLogin.data.token;
  console.log('   ✅ Kevin Morales authenticated\n');

  const postingId = 3;
  const interestId = 38;

  // Step 1: Mark Viewed
  console.log('📌 Step 1: Na Ah Company viewing Kevin\'s resume...');
  const viewRes = await apiRequest(`/company/ojt-postings/${postingId}/mark-viewed/${interestId}`, 'POST', {}, naahToken);
  console.log('   Result:', viewRes.status, viewRes.data?.resume_viewed_at ? 'Viewed' : viewRes.data);

  // Step 2: Accept Student into Review (interested -> company_reviewed)
  console.log('\n📌 Step 2: Na Ah Company accepting application into review (interested -> company_reviewed)...');
  const reviewRes = await apiRequest(`/company/ojt-postings/${postingId}/accept/${interestId}`, 'POST', {
    company_note: 'Kevin\'s skills in Laravel and Vue match our project stack. Proceeding to request university endorsement letter.'
  }, naahToken);
  console.log('   Result:', reviewRes.status, reviewRes.data?.message || reviewRes.data);

  // Step 3: Request Endorsement (company_reviewed -> endorsement_requested)
  console.log('\n📌 Step 3: Na Ah Company requesting CHMSU Endorsement Letter...');
  const reqEndorseRes = await apiRequest(`/company/ojt-postings/${postingId}/request-endorsement/${interestId}`, 'POST', {}, naahToken);
  console.log('   Result:', reqEndorseRes.status, reqEndorseRes.data?.message || reqEndorseRes.data);

  // Step 4: Supervisor Issues Official Endorsement (endorsement_requested -> endorsed)
  console.log('\n📌 Step 4: Prof. Kate Bermejo issuing and uploading official Endorsement Letter...');
  const endorseRes = await apiRequest(`/supervisor/recommend/${interestId}`, 'POST', {}, supToken);
  console.log('   Result:', endorseRes.status, endorseRes.data?.message || endorseRes.data);

  // Step 5: Schedule Interview (endorsed -> interview_scheduled)
  console.log('\n📌 Step 5: Na Ah Company scheduling Technical Interview...');
  const interviewTime = new Date(Date.now() + 5000).toISOString().replace('T', ' ').substring(0, 19);
  const schedRes = await apiRequest(`/company/ojt-postings/${postingId}/schedule-interview/${interestId}`, 'POST', {
    interview_scheduled_at: interviewTime,
    interview_type: 'face_to_face',
    interview_location: 'Na Ah Tech Hub, Conference Room 2, Circumferential Rd, Bacolod City',
    company_note: 'Please bring your laptop and be prepared to demo your GitHub portfolio and Laravel projects.'
  }, naahToken);
  console.log('   Result:', schedRes.status, schedRes.data?.message || schedRes.data);

  console.log('\n⏳ Waiting 7 seconds for interview window to pass...');
  await sleep(7000);

  // Step 6: Company Accepts Post-Interview (interview_scheduled -> company_accepted)
  console.log('\n📌 Step 6: Na Ah Company accepting candidate after interview deliberation...');
  const acceptInterviewRes = await apiRequest(`/company/ojt-postings/${postingId}/accept-after-interview/${interestId}`, 'POST', {
    company_note: 'Outstanding technical demonstration! Kevin has passed our interview panel and code review with high remarks. We enthusiastically accept him for the 600-hour Web Development internship.'
  }, naahToken);
  console.log('   Result:', acceptInterviewRes.status, acceptInterviewRes.data?.message || acceptInterviewRes.data);

  // Step 7: Supervisor Final Academic Sign-Off (company_accepted -> accepted)
  console.log('\n📌 Step 7: Prof. Kate Bermejo granting final academic OJT approval...');
  const finalAcceptRes = await apiRequest(`/supervisor/final-accept/${interestId}`, 'POST', {
    coordinator_note: 'Approved for full academic credit. Pre-deployment requirements verified and company acceptance endorsed.'
  }, supToken);
  console.log('   Result:', finalAcceptRes.status, finalAcceptRes.data?.message || finalAcceptRes.data);

  // Step 8: Company Sets OJT Start Date as Today & Shift Parameters (accepted -> ojt_confirmed)
  console.log('\n📌 Step 8: Na Ah Company setting OJT start date to Today & shift schedule...');
  const todayDate = new Date().toISOString().split('T')[0];
  const setStartRes = await apiRequest(`/company/ojt-postings/${postingId}/set-ojt-start/${interestId}`, 'POST', {
    ojt_start_date: todayDate,
    ojt_instructions: 'Welcome to Na Ah Company! Please report to Reception at 07:45 AM on your start date. Wear your CHMSU institutional uniform and ID badge. You will receive your workstation credentials and team onboarding.',
    schedule_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift_start: '08:00',
    shift_end: '17:00',
    lunch_start: '12:00',
    lunch_end: '13:00',
    has_lunch_break: true,
    daily_hours: 8.0,
    weekly_hours: 40.0,
    allow_overtime: true,
    max_overtime_hours: 2.0
  }, naahToken);
  console.log('   Result:', setStartRes.status, setStartRes.data?.message || setStartRes.data);

  // Step 9: Kevin Morales Opens OJT Tracker (auto-activates)
  console.log('\n📌 Step 9: Kevin Morales opening OJT Tracker...');
  const trackerRes1 = await apiRequest('/student/ojt-tracker', 'GET', null, stuToken);
  console.log('   Tracker status code:', trackerRes1.status);
  console.log('   Deployment:', {
    company: trackerRes1.data?.deployment?.company,
    postingTitle: trackerRes1.data?.deployment?.postingTitle,
    location: trackerRes1.data?.deployment?.location,
    coordinates: `${trackerRes1.data?.deployment?.companyLat}, ${trackerRes1.data?.deployment?.companyLon}`,
    requiredHours: trackerRes1.data?.deployment?.requiredHours,
    locked: trackerRes1.data?.locked,
  });

  // Step 10: Kevin Morales Performs Morning Time-In
  console.log('\n📌 Step 10: Kevin Morales clocking in (Morning Time-In) with GPS...');
  const timeInRes = await apiRequest('/student/ojt-tracker/log-in', 'POST', {
    time_in: '08:00',
    latitude: 10.6765,
    longitude: 122.9509,
    session: 'morning'
  }, stuToken);
  console.log('   Time-In Result:', timeInRes.status, timeInRes.data);

  // Step 11: Final Tracker State
  console.log('\n📌 Step 11: Final OJT Tracker Verification...');
  const trackerRes2 = await apiRequest('/student/ojt-tracker', 'GET', null, stuToken);
  console.log('   - Student:', 'Kevin Morales (BSIT 4-B)');
  console.log('   - Host Company:', trackerRes2.data?.deployment?.company);
  console.log('   - Role:', trackerRes2.data?.deployment?.postingTitle);
  console.log('   - Location:', trackerRes2.data?.deployment?.location);
  console.log('   - Required Hours:', trackerRes2.data?.deployment?.requiredHours);
  console.log('   - Status:', trackerRes2.data?.locked ? 'Locked' : 'Active OJT (Unlocked)');
  console.log('   - Attendance Logs:', trackerRes2.data?.logs?.length || 0);
  if (trackerRes2.data?.logs?.length > 0) {
    const log = trackerRes2.data.logs[0];
    console.log(`     Log Date: ${log.log_date || log.date}, Morning In: ${log.morning_in || log.morningIn || log.time_in}`);
  }

  console.log('\n================================================================');
  console.log('🎉 ACTIVE OJT STUDENT IS LIVE, READY, AND CLOCKED IN!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('\n❌ ERROR:', err);
  process.exit(1);
});
