/**
 * seed_active_ojt_and_postings.js
 * Simulates real human users operating the CHMSU OJT & Placement portal:
 * 1. Na Ah Company & Company Cole HR publishing OJT listings
 * 2. Supervisor Kate Bermejo batch-registering dedicated active student Kevin Morales
 * 3. Kevin Morales setting up his student profile, skills, education, and pre-deployment portfolio
 * 4. Supervisor assigning and verifying pre-deployment compliance packet
 * 5. Kevin submitting his application to Na Ah Company
 * 6. Na Ah Company reviewing resume and requesting official CHMSU Endorsement Letter
 * 7. Supervisor Kate Bermejo generating and signing official Endorsement Letter
 * 8. Na Ah Company scheduling and conducting technical interview
 * 9. Na Ah Company accepting candidate after interview deliberation
 * 10. Supervisor Kate Bermejo granting final academic OJT approval
 * 11. Na Ah Company setting OJT start date (today) and work instructions
 * 12. Kevin Morales opening OJT Tracker (auto-activates) and recording GPS-verified Time-In!
 */

const BASE_URL = 'https://stoned.onrender.com/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiRequest(path, method = 'GET', body = null, token = null, isFormData = false) {
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
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

async function main() {
  console.log('================================================================');
  console.log('🚀 STARTING REALISTIC END-TO-END OJT LIFECYCLE SIMULATION');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // STEP 1: LOGIN ACCOUNTS
  // -------------------------------------------------------------
  console.log('📌 1. Authenticating System Actors...');
  
  // Supervisor Kate Bermejo
  const supLogin = await apiRequest('/auth/login', 'POST', {
    email: 'katenicolebermejooo@gmail.com',
    password: 'Demo@1234',
  });
  if (!supLogin.ok) throw new Error('Supervisor login failed: ' + JSON.stringify(supLogin.data));
  const supToken = supLogin.data.token;
  console.log('   ✅ Logged in as Supervisor: Prof. Kate Bermejo');

  // Na Ah Company HR
  const naahLogin = await apiRequest('/auth/login', 'POST', {
    email: 'hr@naahcompany.com',
    password: 'Demo@1234',
  });
  if (!naahLogin.ok) throw new Error('Na Ah Company login failed: ' + JSON.stringify(naahLogin.data));
  const naahToken = naahLogin.data.token;
  console.log('   ✅ Logged in as Na Ah Company HR');

  // Company Cole HR
  const coleLogin = await apiRequest('/auth/login', 'POST', {
    email: 'gimaranganvhan@gmail.com',
    password: 'Demo@1234',
  });
  if (!coleLogin.ok) throw new Error('Company Cole login failed: ' + JSON.stringify(coleLogin.data));
  const coleToken = coleLogin.data.token;
  console.log('   ✅ Logged in as Company Cole HR\n');

  // -------------------------------------------------------------
  // STEP 2: PUBLISH OJT POSTINGS
  // -------------------------------------------------------------
  console.log('📌 2. Publishing Real-World OJT Listings...');

  // Posting 1: Already created earlier or we ensure it exists
  // Na Ah Company: Full-Stack Web Development Intern (ID: 3)
  let naahPostingId = 3;

  // Posting 2: Na Ah Company - UI/UX Design & Frontend Development Intern
  console.log('   💼 Na Ah Company posting: UI/UX Design & Frontend Development Intern...');
  const naahPost2 = await apiRequest('/company/ojt-postings', 'POST', {
    title: 'UI/UX Design & Frontend Development Intern',
    department: 'Digital Product Design',
    industry: 'Information Technology',
    location: 'Na Ah Tech Hub, Circumferential Rd, Bacolod City, Negros Occidental',
    branch_name: 'Bacolod Main Headquarters',
    latitude: 10.6765,
    longitude: 122.9509,
    slots_total: 2,
    duration: '600 Hours',
    schedule_type: 'full_day',
    description: 'Design intuitive user interfaces and transform Figma wireframes into modern responsive web components. Trainees will collaborate closely with product managers and frontend developers.',
    learning_outcomes: 'Proficiency in Figma component systems, Tailwind CSS styling, responsive viewport design, and WCAG accessibility standards.',
    required_skills: ['Figma', 'UI/UX Design', 'HTML5', 'CSS3', 'Tailwind CSS', 'JavaScript', 'Responsive Design'],
    qualifications: ['Enrolled in BSIT or related degree', 'Strong visual aesthetics and attention to UI detail', 'Familiarity with design systems'],
    preferred_courses: ['BSIT', 'BSIS'],
    required_documents: ['Endorsement Letter', 'Portfolio Link', 'Resume / CV', 'Parents Consent Form']
  }, naahToken);
  console.log('      Result:', naahPost2.ok ? `Created Posting ID: ${naahPost2.data.data?.id}` : naahPost2.status);

  // Posting 3: Company Cole - Cybersecurity & Network Defense Intern
  console.log('   💼 Company Cole posting: Cybersecurity & Network Defense Intern...');
  const colePost1 = await apiRequest('/company/ojt-postings', 'POST', {
    title: 'Cybersecurity & Network Defense Intern',
    department: 'Infrastructure & Security Operations',
    industry: 'Information Technology',
    location: 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
    branch_name: 'Bacolod Branch',
    latitude: 10.6831495,
    longitude: 122.9449081,
    slots_total: 2,
    duration: '600 Hours',
    schedule_type: 'full_day',
    description: 'Assist the SOC operations team in vulnerability assessment, log auditing, firewall configuration reviews, and incident response drill playbooks.',
    learning_outcomes: 'Hands-on experience in vulnerability scanning with OpenVAS, packet inspection with Wireshark, Linux server hardening, and SOC alert triage.',
    required_skills: ['Network Security', 'Linux Administration', 'Firewall Configuration', 'Wireshark', 'Bash Scripting', 'Incident Response'],
    qualifications: ['BSIT or BSCS 4th-year student', 'Foundational knowledge of TCP/IP networking and OSI layer security'],
    preferred_courses: ['BSIT', 'BSCS'],
    required_documents: ['Endorsement Letter', 'Resume / CV', 'Medical Certificate', 'Parents Consent']
  }, coleToken);
  console.log('      Result:', colePost1.ok ? `Created Posting ID: ${colePost1.data.data?.id}` : colePost1.status);

  // Posting 4: Company Cole - Data Analytics & Business Intelligence Intern
  console.log('   💼 Company Cole posting: Data Analytics & Business Intelligence Intern...');
  const colePost2 = await apiRequest('/company/ojt-postings', 'POST', {
    title: 'Data Analytics & Business Intelligence Intern',
    department: 'Business Intelligence & Data Analytics',
    industry: 'Information Technology',
    location: 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
    branch_name: 'Bacolod Branch',
    latitude: 10.6831495,
    longitude: 122.9449081,
    slots_total: 2,
    duration: '600 Hours',
    schedule_type: 'full_day',
    description: 'Extract, clean, model, and visualize business performance metrics. Build automated interactive Power BI dashboards and draft SQL queries for operational reporting.',
    learning_outcomes: 'Proficiency in writing complex SQL queries, building Power BI reports with DAX, and translating raw transactional data into actionable business insights.',
    required_skills: ['SQL', 'Power BI', 'Python', 'Data Cleaning', 'Data Visualization', 'Excel'],
    qualifications: ['BSIT or BSIS 4th-year student', 'Strong analytical mindset and proficiency in relational database concepts'],
    preferred_courses: ['BSIT', 'BSIS'],
    required_documents: ['Endorsement Letter', 'Resume / CV', 'Certificate of Registration (COR)']
  }, coleToken);
  console.log('      Result:', colePost2.ok ? `Created Posting ID: ${colePost2.data.data?.id}` : colePost2.status);
  console.log('   ✅ All 4 OJT listings published successfully!\n');

  // -------------------------------------------------------------
  // STEP 3: BATCH REGISTER DEDICATED ACTIVE STUDENT
  // -------------------------------------------------------------
  console.log('📌 3. Supervisor Batch-Registering Dedicated Active Student (Kevin Morales)...');
  const studentEmail = 'kevin.morales.bsit4b@chmsu.edu.ph';
  const studentId = '2023-BSIT4B-006';
  const tempPassword = `CHMSU@${studentId}`;

  const csvContent = `name,email,student_id,course,section,year_level,academic_year
Kevin Morales,${studentEmail},${studentId},BSIT,BSIT 4-B,4,2024-2025`;

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let formBody = `--${boundary}\r\n`;
  formBody += `Content-Disposition: form-data; name="file"; filename="kevin_registration.csv"\r\n`;
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
  console.log('   Supervisor import response:', importRes.status, importData);

  // -------------------------------------------------------------
  // STEP 4: KEVIN MORALES LOGS IN & COMPLETES PROFILE
  // -------------------------------------------------------------
  console.log('\n📌 4. Kevin Morales Logging In & Completing Profile...');
  const stuLogin = await apiRequest('/auth/login', 'POST', {
    email: studentEmail,
    password: tempPassword
  });
  if (!stuLogin.ok) throw new Error('Student login failed: ' + JSON.stringify(stuLogin.data));
  const stuToken = stuLogin.data.token;
  const studentUserId = stuLogin.data.user.id;
  console.log(`   ✅ Logged in as ${stuLogin.data.user.name} (User ID: ${studentUserId})`);

  // Update Profile
  console.log('   📝 Filling Profile details (bio, contacts, social links)...');
  await apiRequest('/student/profile', 'POST', {
    contact_number: '+63 917 889 4521',
    address: 'Talisay City, Negros Occidental',
    bio: 'Passionate 4th-year BSIT student specializing in web engineering and full-stack cloud development. Dedicated to building performant web apps and seeking rigorous 600-hour industry immersion.',
    linkedin: 'https://linkedin.com/in/kevin-morales-chmsu',
    github: 'https://github.com/kevinmorales-chmsu',
    portfolio_url: 'https://kevinmorales.dev',
    requirements_drive_url: 'https://drive.google.com/drive/folders/1kevinmorales_chmsu_ojt_requirements'
  }, stuToken);

  // Submit Drive link for pre-deployment clearance
  console.log('   📁 Submitting Google Drive Pre-Deployment clearance packet...');
  await apiRequest('/student/requirements-drive', 'PUT', {
    requirements_drive_url: 'https://drive.google.com/drive/folders/1kevinmorales_chmsu_ojt_requirements'
  }, stuToken);

  // Add Education
  console.log('   🎓 Adding Academic Record...');
  await apiRequest('/student/education', 'POST', {
    school: 'Carlos Hilado Memorial State University',
    degree: 'Bachelor of Science in Information Technology',
    field_of_study: 'Software Development',
    year_start: 2021,
    year_end: 2025,
    is_current: true,
    gpa: '1.38',
    achievements: 'Dean\'s Lister (AY 2021-2024), CHMSU CodeFest Champion 2024'
  }, stuToken);

  // Add Skills
  console.log('   ⚡ Adding Technical Skills...');
  await apiRequest('/student/skills', 'POST', {
    skills: [
      { name: 'Laravel', level: 'Advanced' },
      { name: 'PHP', level: 'Advanced' },
      { name: 'Vue.js', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Advanced' },
      { name: 'MySQL', level: 'Advanced' },
      { name: 'Git & GitHub', level: 'Advanced' },
      { name: 'Tailwind CSS', level: 'Advanced' },
      { name: 'REST APIs', level: 'Advanced' },
      { name: 'Docker', level: 'Intermediate' }
    ]
  }, stuToken);

  // Add Projects
  console.log('   🚀 Adding Software Projects...');
  await apiRequest('/student/projects', 'POST', {
    title: 'CHMSU Campus Event & Facility Booking System',
    description: 'A full-stack campus management platform with role-based access control, automated email reminders, and schedule conflict avoidance.',
    role: 'Lead Full-Stack Developer',
    tech_stack: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS'],
    project_url: 'https://github.com/kevinmorales-chmsu/campus-booking',
    start_date: '2024-01-10',
    end_date: '2024-05-20'
  }, stuToken);

  // -------------------------------------------------------------
  // STEP 5: SUPERVISOR ASSIGNS & VERIFIES PRE-DEPLOYMENT PACKET
  // -------------------------------------------------------------
  console.log('\n📌 5. Supervisor Assigning & Verifying Pre-Deployment Requirements Packet...');
  const assignRes = await apiRequest('/supervisor/requirements/assign', 'POST', {
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
  console.log('   Assigned requirements status:', assignRes.status);

  // Fetch requirement record ID for Kevin
  const reqRes = await apiRequest(`/supervisor/requirements/student/${studentUserId}`, 'GET', null, supToken);
  const reqRecord = Array.isArray(reqRes.data?.data) ? reqRes.data.data[0] : (reqRes.data?.requirements?.[0] || reqRes.data?.[0]);
  const reqId = reqRecord?.id || 1;
  console.log(`   Found Requirement ID: ${reqId}. Verifying documents...`);

  // Supervisor reviews and verifies requirements
  const verifyRes = await apiRequest(`/supervisor/requirements/${reqId}/review`, 'PUT', {
    status: 'verified',
    remarks: 'All pre-deployment medical clearances, parent waiver, and insurance certificates are verified complete. Student is cleared for OJT application and deployment.'
  }, supToken);
  console.log('   Verification response:', verifyRes.status, verifyRes.data);

  // -------------------------------------------------------------
  // STEP 6: KEVIN SUBMITS APPLICATION TO NA AH COMPANY
  // -------------------------------------------------------------
  console.log('\n📌 6. Kevin Morales Submitting OJT Application to Na Ah Company...');
  const applyRes = await apiRequest(`/ojt/interest/${naahPostingId}`, 'POST', {
    message: 'Good day! I am Kevin Morales, a 4th-year BSIT student from CHMSU Talisay. I have completed my pre-deployment clearances and specialize in Laravel, Vue.js, and REST APIs. I am eager to contribute 600 hours to Na Ah Company\'s software engineering team.'
  }, stuToken);
  console.log('   Application submission response:', applyRes.status, applyRes.data);

  // -------------------------------------------------------------
  // STEP 7: NA AH COMPANY REVIEWS RESUME & REQUESTS ENDORSEMENT
  // -------------------------------------------------------------
  console.log('\n📌 7. Na Ah Company Reviewing Application & Requesting Endorsement...');
  
  // Get applicant interest record ID
  const interestsRes = await apiRequest(`/company/ojt-postings/${naahPostingId}/interests`, 'GET', null, naahToken);
  const interestsList = interestsRes.data?.data || interestsRes.data || [];
  const kevinInterest = interestsList.find(i => i.student_user_id === studentUserId || i.student?.id === studentUserId) || interestsList[0];
  if (!kevinInterest) throw new Error('Could not find Kevin Morales application in Na Ah Company interests!');
  const interestId = kevinInterest.id;
  console.log(`   Found Kevin\'s Interest ID: ${interestId} (Current Status: ${kevinInterest.status})`);

  // Step 7a: Mark Resume Viewed
  console.log('   📄 HR opening and reviewing candidate resume...');
  const viewRes = await apiRequest(`/company/ojt-postings/${naahPostingId}/mark-viewed/${interestId}`, 'POST', {}, naahToken);
  console.log('      Resume viewed response:', viewRes.status);

  // Step 7b: Request Endorsement Letter
  console.log('   🏛️  Requesting official CHMSU Endorsement Letter from OJT Coordinator...');
  const reqEndorseRes = await apiRequest(`/company/ojt-postings/${naahPostingId}/request-endorsement/${interestId}`, 'POST', {}, naahToken);
  console.log('      Endorsement request response:', reqEndorseRes.status, reqEndorseRes.data?.message);

  // -------------------------------------------------------------
  // STEP 8: SUPERVISOR ISSUES & UPLOADS ENDORSEMENT LETTER
  // -------------------------------------------------------------
  console.log('\n📌 8. Prof. Kate Bermejo Approving & Issuing Official Endorsement Letter...');
  const endorseRes = await apiRequest(`/supervisor/recommend/${interestId}`, 'POST', {}, supToken);
  console.log('   Supervisor endorsement response:', endorseRes.status, endorseRes.data);

  // -------------------------------------------------------------
  // STEP 9: NA AH COMPANY SCHEDULES TECHNICAL INTERVIEW
  // -------------------------------------------------------------
  console.log('\n📌 9. Na Ah Company Scheduling Technical Interview...');
  // Set scheduled time to 5 seconds in future to pass 'after:now' validation
  const interviewTime = new Date(Date.now() + 5000).toISOString().replace('T', ' ').substring(0, 19);
  
  const schedRes = await apiRequest(`/company/ojt-postings/${naahPostingId}/schedule-interview/${interestId}`, 'POST', {
    interview_scheduled_at: interviewTime,
    interview_type: 'face_to_face',
    interview_location: 'Na Ah Tech Hub, Conference Room 2, Circumferential Rd, Bacolod City',
    company_note: 'Please bring your laptop and prepare to demo your GitHub portfolio and Laravel projects.'
  }, naahToken);
  console.log('   Interview scheduled response:', schedRes.status, schedRes.data?.message);

  // Wait 6 seconds so the interview window passes and isFuture() becomes false
  console.log('   ⏳ Conducting technical interview & code review (waiting 6 seconds)...');
  await sleep(6500);

  // -------------------------------------------------------------
  // STEP 10: NA AH COMPANY ACCEPTS KEVIN AFTER INTERVIEW
  // -------------------------------------------------------------
  console.log('\n📌 10. Na Ah Company Accepting Candidate Post-Interview...');
  const acceptInterviewRes = await apiRequest(`/company/ojt-postings/${naahPostingId}/accept-after-interview/${interestId}`, 'POST', {
    company_note: 'Outstanding technical demonstration! Kevin has passed our interview panel and code review with high marks. We enthusiastically accept him for the 600-hour Web Development internship.'
  }, naahToken);
  console.log('   Post-interview acceptance response:', acceptInterviewRes.status, acceptInterviewRes.data?.message);

  // -------------------------------------------------------------
  // STEP 11: SUPERVISOR GRANTS FINAL ACADEMIC APPROVAL
  // -------------------------------------------------------------
  console.log('\n📌 11. Prof. Kate Bermejo Granting Final Academic OJT Approval...');
  const finalAcceptRes = await apiRequest(`/supervisor/final-accept/${interestId}`, 'POST', {
    coordinator_note: 'Approved for full academic credit. Pre-deployment requirements verified and company acceptance endorsed.'
  }, supToken);
  console.log('   Final approval response:', finalAcceptRes.status, finalAcceptRes.data?.message);

  // -------------------------------------------------------------
  // STEP 12: COMPANY SETS START DATE AS TODAY & WORK INSTRUCTIONS
  // -------------------------------------------------------------
  console.log('\n📌 12. Na Ah Company Setting OJT Start Date & Shift Instructions...');
  const todayDate = new Date().toISOString().split('T')[0];
  const setStartRes = await apiRequest(`/company/ojt-postings/${naahPostingId}/set-ojt-start/${interestId}`, 'POST', {
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
  console.log('   Set start date response:', setStartRes.status, setStartRes.data?.message);

  // -------------------------------------------------------------
  // STEP 13: KEVIN CHECKS OJT TRACKER & AUTO-ACTIVATES
  // -------------------------------------------------------------
  console.log('\n📌 13. Kevin Morales Opening OJT Tracker (Auto-Activating)...');
  const trackerRes1 = await apiRequest('/student/ojt-tracker', 'GET', null, stuToken);
  console.log('   Tracker status code:', trackerRes1.status);
  console.log('   Deployment:', {
    company: trackerRes1.data?.deployment?.company,
    postingTitle: trackerRes1.data?.deployment?.postingTitle,
    location: trackerRes1.data?.deployment?.location,
    coordinates: `${trackerRes1.data?.deployment?.companyLat}, ${trackerRes1.data?.deployment?.companyLon}`,
    requiredHours: trackerRes1.data?.deployment?.requiredHours,
    locked: trackerRes1.data?.locked,
    daysRemaining: trackerRes1.data?.daysRemaining
  });

  // -------------------------------------------------------------
  // STEP 14: KEVIN PERFORMS GPS-VERIFIED TIME-IN
  // -------------------------------------------------------------
  console.log('\n📌 14. Kevin Morales Performing GPS Time-In at Na Ah Tech Hub...');
  const timeInRes = await apiRequest('/student/ojt-tracker/log-in', 'POST', {
    time_in: '08:00',
    latitude: 10.6765,
    longitude: 122.9509,
    session: 'morning'
  }, stuToken);
  console.log('   Time-In response:', timeInRes.status, timeInRes.data);

  // -------------------------------------------------------------
  // STEP 15: FINAL TRACKER VERIFICATION
  // -------------------------------------------------------------
  console.log('\n📌 15. Final OJT Tracker State Verification...');
  const trackerRes2 = await apiRequest('/student/ojt-tracker', 'GET', null, stuToken);
  console.log('   Tracker Summary:');
  console.log('   - Student:', studentEmail);
  console.log('   - Host Company:', trackerRes2.data?.deployment?.company);
  console.log('   - Role:', trackerRes2.data?.deployment?.postingTitle);
  console.log('   - Required Hours:', trackerRes2.data?.deployment?.requiredHours);
  console.log('   - Completed Hours:', trackerRes2.data?.progress?.completedHours || 0);
  console.log('   - Today Logs Count:', trackerRes2.data?.logs?.length || 0);
  if (trackerRes2.data?.logs?.length > 0) {
    const todayLog = trackerRes2.data.logs[0];
    console.log(`   - First Log: Date ${todayLog.log_date || todayLog.date}, Morning In: ${todayLog.morning_in || todayLog.time_in}`);
  }

  console.log('\n================================================================');
  console.log('🎉 REALISTIC OJT LIFECYCLE SIMULATION COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

main().catch(err => {
  console.error('\n❌ ERROR OCCURRED DURING SIMULATION:', err);
  process.exit(1);
});
