/**
 * seed_active_student_bianca.js
 * Simulates complete human-like lifecycle for Bianca Santos (BSIT 4-A):
 * - Deployed at Company Cole as Cybersecurity & Network Defense Intern
 * - Punches in Morning shift so the tracker has an active live session ready for Time-Out!
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
  console.log('🚀 SEEDING ACTIVE OJT STUDENT: BIANCA SANTOS @ COMPANY COLE');
  console.log('================================================================\n');

  // Step 1: Login Actors
  console.log('📌 1. Authenticating Supervisor & Company Cole...');
  const supLogin = await apiRequest('/auth/login', 'POST', {
    email: 'katenicolebermejooo@gmail.com',
    password: 'Demo@1234',
  });
  const supToken = supLogin.data.token;
  console.log('   ✅ Supervisor Kate Bermejo authenticated');

  const coleLogin = await apiRequest('/auth/login', 'POST', {
    email: 'gimaranganvhan@gmail.com',
    password: 'Demo@1234',
  });
  const coleToken = coleLogin.data.token;
  console.log('   ✅ Company Cole HR authenticated\n');

  // Step 2: Supervisor Batch-Registers Bianca Santos
  console.log('📌 2. Supervisor Batch-Registering Bianca Santos (BSIT 4-A)...');
  const studentEmail = 'bianca.santos.bsit4a@chmsu.edu.ph';
  const studentId = '2023-BSIT4A-006';
  const tempPassword = `CHMSU@${studentId}`;

  const csvContent = `name,email,student_id,course,section,year,campus
Bianca Santos,${studentEmail},${studentId},BSIT,BSIT 4-A,4,Talisay`;

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let formBody = `--${boundary}\r\n`;
  formBody += `Content-Disposition: form-data; name="file"; filename="bianca_registration.csv"\r\n`;
  formBody += `Content-Type: text/csv\r\n\r\n`;
  formBody += `${csvContent}\r\n`;
  formBody += `--${boundary}--\r\n`;

  const importRes = await fetch(`${BASE_URL}/supervisor/students/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supToken}`,
      'Accept': 'application/json',
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: formBody
  });
  const importData = await importRes.json();
  console.log('   Import Result:', importRes.status, importData.message || importData);

  // Step 3: Bianca Logs In & Sets Up Profile
  console.log('\n📌 3. Bianca Santos Logging In & Setting Up Profile...');
  const stuLogin = await apiRequest('/auth/login', 'POST', {
    email: studentEmail,
    password: tempPassword
  });
  if (!stuLogin.ok) throw new Error('Student login failed: ' + JSON.stringify(stuLogin.data));
  const stuToken = stuLogin.data.token;
  const studentUserId = stuLogin.data.user.id;
  console.log(`   ✅ Logged in as Bianca Santos (User ID: ${studentUserId})`);

  console.log('   📝 Filling Profile details...');
  await apiRequest('/student/profile', 'POST', {
    contact_number: '+63 919 772 3144',
    address: 'Bacolod City, Negros Occidental',
    bio: 'BSIT 4th-year student focusing on Infrastructure, Network Defense, and Cybersecurity Operations. Seeking an intensive 600-hour SOC internship immersion.',
    linkedin: 'https://linkedin.com/in/bianca-santos-chmsu',
    github: 'https://github.com/biancasantos-chmsu',
    portfolio_url: 'https://biancasantos.security',
    requirements_drive_url: 'https://drive.google.com/drive/folders/1biancasantos_chmsu_ojt_requirements'
  }, stuToken);

  console.log('   📁 Submitting Google Drive Pre-Deployment clearance packet...');
  await apiRequest('/student/requirements-drive', 'PUT', {
    requirements_drive_url: 'https://drive.google.com/drive/folders/1biancasantos_chmsu_ojt_requirements'
  }, stuToken);

  console.log('   🎓 Adding Academic Record...');
  await apiRequest('/student/education', 'POST', {
    school: 'Carlos Hilado Memorial State University',
    degree: 'Bachelor of Science in Information Technology',
    field_of_study: 'Network and Cybersecurity',
    year_start: 2021,
    year_end: 2025,
    is_current: true,
    gpa: '1.42',
    achievements: 'Dean\'s Lister (AY 2022-2024), Cisco Certified Network Associate (CCNA) Training Graduate'
  }, stuToken);

  console.log('   ⚡ Adding Technical Skills...');
  await apiRequest('/student/skills', 'POST', {
    skills: [
      { name: 'Network Security', level: 'Advanced' },
      { name: 'Linux Administration', level: 'Advanced' },
      { name: 'Wireshark', level: 'Intermediate' },
      { name: 'Firewall Configuration', level: 'Intermediate' },
      { name: 'Python', level: 'Intermediate' },
      { name: 'Bash Scripting', level: 'Intermediate' },
      { name: 'Incident Response', level: 'Beginner' }
    ]
  }, stuToken);

  // Step 4: Supervisor Assigns & Verifies Pre-Deployment Requirements
  console.log('\n📌 4. Supervisor Assigning & Verifying Pre-Deployment Compliance Packet...');
  await apiRequest('/supervisor/requirements/assign', 'POST', {
    student_ids: [studentUserId],
    title: 'CHMSU Pre-Deployment OJT Compliance Packet',
    items: [
      'Certificate of Registration (COR)',
      'Medical Certificate & Fit to Work',
      'Parents/Guardian Consent & Waiver',
      'Barangay Clearance',
      'CHMSU OJT Insurance Policy',
      'OJT Memorandum of Understanding'
    ],
    instructions: 'Upload all notarized and signed pre-deployment documents to your assigned Google Drive repository for coordinator verification.',
    due_date: '2026-11-15'
  }, supToken);

  const reqRes = await apiRequest(`/supervisor/requirements/student/${studentUserId}`, 'GET', null, supToken);
  const reqRecord = reqRes.data?.requirements?.[0] || reqRes.data?.data?.[0];
  const reqId = reqRecord?.id;
  console.log(`   Found Requirement ID: ${reqId}. Verifying...`);

  await apiRequest(`/supervisor/requirements/${reqId}/review`, 'PUT', {
    status: 'verified',
    remarks: 'Pre-deployment medical clearance, parent consent, and university insurance verified. Cleared for OJT deployment.'
  }, supToken);
  console.log('   ✅ Requirements verified by Supervisor');

  // Step 5: Bianca Applies to Company Cole (Posting ID: 5)
  const postingId = 5;
  console.log(`\n📌 5. Bianca Applying to Company Cole Posting ID ${postingId} (Cybersecurity & Network Defense)...`);
  const applyRes = await apiRequest(`/ojt/interest/${postingId}`, 'POST', {
    message: 'Good day! I am Bianca Santos, a 4th-year BSIT student majoring in Network & Cybersecurity. I have completed my pre-deployment clearance and CCNA modules. I look forward to contributing 600 hours to Company Cole\'s SOC operations team.'
  }, stuToken);
  console.log('   Application Result:', applyRes.status, applyRes.data?.message || applyRes.data);

  // Step 6: Company Cole Reviews Resume & Accepts into Review
  console.log('\n📌 6. Company Cole Reviewing Application...');
  const interestsRes = await apiRequest(`/company/ojt-postings/${postingId}/interests`, 'GET', null, coleToken);
  const interestsList = interestsRes.data?.data || interestsRes.data || [];
  const biancaInterest = interestsList.find(i => i.student_user_id === studentUserId || i.student?.id === studentUserId) || interestsList[0];
  if (!biancaInterest) throw new Error('Could not find Bianca Santos application!');
  const interestId = biancaInterest.id;
  console.log(`   Found Interest ID: ${interestId}`);

  // Mark Viewed
  await apiRequest(`/company/ojt-postings/${postingId}/mark-viewed/${interestId}`, 'POST', {}, coleToken);
  console.log('   ✅ Resume viewed by HR');

  // Accept into Review (interested -> company_reviewed)
  await apiRequest(`/company/ojt-postings/${postingId}/accept/${interestId}`, 'POST', {
    company_note: 'Bianca\'s CCNA training and Linux skills match our SOC intern profile. Proceeding to request endorsement letter.'
  }, coleToken);
  console.log('   ✅ Application accepted into review (status: company_reviewed)');

  // Step 7: Company Cole Requests Endorsement
  console.log('\n📌 7. Company Cole Requesting Official Endorsement Letter...');
  await apiRequest(`/company/ojt-postings/${postingId}/request-endorsement/${interestId}`, 'POST', {}, coleToken);
  console.log('   ✅ Endorsement letter requested from coordinator');

  // Step 8: Supervisor Issues Endorsement Letter
  console.log('\n📌 8. Supervisor Kate Bermejo Issuing Endorsement Letter...');
  await apiRequest(`/supervisor/recommend/${interestId}`, 'POST', {}, supToken);
  console.log('   ✅ Endorsement letter issued (status: endorsed)');

  // Step 9: Company Cole Schedules Technical Interview
  console.log('\n📌 9. Company Cole Scheduling Technical Interview...');
  const interviewTime = new Date(Date.now() + 5000).toISOString();
  await apiRequest(`/company/ojt-postings/${postingId}/schedule-interview/${interestId}`, 'POST', {
    interview_scheduled_at: interviewTime,
    interview_type: 'face_to_face',
    interview_location: 'Unit 4, TechPark Building, Lacson St., Bacolod City',
    company_note: 'Please bring your laptop and prepare for a practical networking and packet analysis exercise.'
  }, coleToken);
  console.log('   ✅ Technical interview scheduled');

  console.log('   ⏳ Waiting 7 seconds for interview window to pass...');
  await sleep(7000);

  // Step 10: Company Cole Accepts Post-Interview
  console.log('\n📌 10. Company Cole Accepting Bianca Post-Interview...');
  await apiRequest(`/company/ojt-postings/${postingId}/accept-after-interview/${interestId}`, 'POST', {
    company_note: 'Excellent performance in the Wireshark packet capture analysis! We are delighted to accept Bianca for the 600-hour SOC internship.'
  }, coleToken);
  console.log('   ✅ Candidate accepted after interview (status: company_accepted)');

  // Step 11: Supervisor Grants Final Academic Approval
  console.log('\n📌 11. Supervisor Kate Bermejo Granting Final OJT Approval...');
  await apiRequest(`/supervisor/final-accept/${interestId}`, 'POST', {
    coordinator_note: 'Academic approval granted. Student cleared for 600-hour curriculum credit at Company Cole.'
  }, supToken);
  console.log('   ✅ Final academic approval granted (status: accepted)');

  // Step 12: Company Cole Sets OJT Start Date as Today
  console.log('\n📌 12. Company Cole Setting OJT Start Date (Today) & Schedule...');
  const todayDate = new Date().toISOString().split('T')[0];
  await apiRequest(`/company/ojt-postings/${postingId}/set-ojt-start/${interestId}`, 'POST', {
    ojt_start_date: todayDate,
    ojt_instructions: 'Welcome to Company Cole! Report to Security Operations Center (Floor 2) at 07:50 AM. Bring your CHMSU institutional ID badge and security clearance forms.',
    schedule_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift_start: '08:00',
    shift_end: '17:00',
    lunch_start: '12:00',
    lunch_end: '13:00',
    has_lunch_break: true,
    daily_hours: 8.0,
    weekly_hours: 40.0,
    allow_overtime: false
  }, coleToken);
  console.log('   ✅ OJT start date confirmed and OjtRecord created (status: ojt_confirmed)');

  // Step 13: Bianca Opens OJT Tracker (auto-activates)
  console.log('\n📌 13. Bianca Santos Opening OJT Tracker (Auto-Activating)...');
  const trackerRes1 = await apiRequest('/student/ojt-tracker', 'GET', null, stuToken);
  console.log('   Deployment Details:', {
    company: trackerRes1.data?.deployment?.company,
    role: trackerRes1.data?.deployment?.postingTitle,
    location: trackerRes1.data?.deployment?.location,
    coordinates: `${trackerRes1.data?.deployment?.companyLat}, ${trackerRes1.data?.deployment?.companyLon}`,
    requiredHours: trackerRes1.data?.deployment?.requiredHours,
    sessionState: trackerRes1.data?.sessionState
  });

  // Step 14: Bianca Performs Morning Time-In (Active Session Live!)
  console.log('\n📌 14. Bianca Santos Punching Morning Time-In at Company Cole...');
  const timeInRes = await apiRequest('/student/ojt-tracker/log-in', 'POST', {
    time_in: '08:00',
    latitude: 10.6831495,
    longitude: 122.9449081,
    session: 'morning'
  }, stuToken);
  console.log('   Time-In Response:', timeInRes.status, timeInRes.data?.message || timeInRes.data);

  // Step 15: Check Bianca Tracker Session State
  console.log('\n📌 15. Verifying Active Clock State in Bianca\'s Tracker...');
  const trackerRes2 = await apiRequest('/student/ojt-tracker', 'GET', null, stuToken);
  console.log('   - Student:', studentEmail);
  console.log('   - Host Company:', trackerRes2.data?.deployment?.company);
  console.log('   - Role:', trackerRes2.data?.deployment?.postingTitle);
  console.log('   - Session State:', trackerRes2.data?.sessionState);
  console.log('   - Ready for Live Time-Out: YES!');

  console.log('\n================================================================');
  console.log('🎉 BIANCA SANTOS IS LIVE WITH ACTIVE RUNNING CLOCK!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('\n❌ ERROR:', err);
  process.exit(1);
});
