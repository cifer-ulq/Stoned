/* ── Mock Data — Admin Portal (all 8 pages) ── */

export const mockData = {

  /* ═══════════════════ DASHBOARD ═══════════════════ */
  dashboard_stats: {
    totalStudents: 2847,
    activeCompanies: 156,
    activePostings: 89,
    ojtDeployed: 423,
    graduatesPlaced: 1204,
    pendingApprovals: 14,
  },

  dashboard_employment_chart: [
    { year: '2019', employed: 68, underemployed: 14, unemployed: 18 },
    { year: '2020', employed: 58, underemployed: 18, unemployed: 24 },
    { year: '2021', employed: 65, underemployed: 15, unemployed: 20 },
    { year: '2022', employed: 72, underemployed: 13, unemployed: 15 },
    { year: '2023', employed: 78, underemployed: 11, unemployed: 11 },
    { year: '2024', employed: 82, underemployed: 10, unemployed: 8 },
  ],

  dashboard_mismatch: { matchRate: 74, partialMatch: 16, mismatch: 10 },

  dashboard_ojt_status: { onTrack: 312, delayed: 67, completed: 44, total: 423 },

  dashboard_pending: [
    { id: 'PA-001', type: 'company', name: 'NexGen Solutions', detail: 'Company registration pending verification', time: '2 hours ago' },
    { id: 'PA-002', type: 'job', name: 'Full-Stack Dev Intern', detail: 'Job posting flagged for review', time: '3 hours ago' },
    { id: 'PA-003', type: 'moa', name: 'CloudFirst PH', detail: 'MOA renewal due in 15 days', time: '5 hours ago' },
    { id: 'PA-004', type: 'company', name: 'DataStream Corp', detail: 'New company registration', time: '6 hours ago' },
    { id: 'PA-005', type: 'student', name: 'Maria Santos', detail: 'OJT document waiver request', time: '8 hours ago' },
  ],

  dashboard_activities: [
    { id: 'A-01', icon: 'check', color: 'success', text: 'Company "TechHub Cebu" approved and activated', time: '15 min ago' },
    { id: 'A-02', icon: 'briefcase', color: 'info', text: 'New job posting: UI/UX Designer Intern at CreativeForge', time: '32 min ago' },
    { id: 'A-03', icon: 'users', color: 'primary', text: '12 new student profiles imported from registrar batch', time: '1 hr ago' },
    { id: 'A-04', icon: 'alertTriangle', color: 'warning', text: 'Job posting flagged: "Data Entry Clerk" — salary below minimum', time: '2 hrs ago' },
    { id: 'A-05', icon: 'fileText', color: 'info', text: 'Tracer study report generated for AY 2023–2024', time: '3 hrs ago' },
    { id: 'A-06', icon: 'clipboardCheck', color: 'success', text: 'OJT evaluation completed for Batch 2024-A', time: '4 hrs ago' },
    { id: 'A-07', icon: 'building', color: 'primary', text: 'MOA signed with Philippine Data Inc.', time: '5 hrs ago' },
  ],

  dashboard_events: [
    { id: 'E-01', title: 'Job Fair 2025', date: 'Jan 28, 2025', type: 'event' },
    { id: 'E-02', title: 'OJT Orientation (Batch B)', date: 'Feb 3, 2025', type: 'orientation' },
    { id: 'E-03', title: 'CHED Compliance Deadline', date: 'Feb 15, 2025', type: 'deadline' },
    { id: 'E-04', title: 'Industry Partners Meeting', date: 'Feb 20, 2025', type: 'meeting' },
  ],

  /* ═══════════════════ COMPANIES ═══════════════════ */
  companies: [
    { id: 'C-001', name: 'TechHub Cebu', industry: 'Software Development', status: 'Verified', moaStatus: 'Active', moaExpiry: '2025-12-31', jobPostings: 8, ojtSlots: 15, slotsUsed: 12, contactPerson: 'Engr. James Tan', email: 'james@techhubecebu.ph', phone: '032-1234567', address: 'Cebu IT Park, Cebu City', registeredDate: '2022-03-15', documents: ['Business Permit', 'SEC Registration', 'MOA'] },
    { id: 'C-002', name: 'NexGen Solutions', industry: 'IT Consulting', status: 'Pending', moaStatus: 'Pending', moaExpiry: null, jobPostings: 2, ojtSlots: 5, slotsUsed: 0, contactPerson: 'Maria Liza Ong', email: 'mliza@nexgen.ph', phone: '02-8123456', address: 'Makati City, Metro Manila', registeredDate: '2025-01-10', documents: ['Business Permit'] },
    { id: 'C-003', name: 'CloudFirst PH', industry: 'Cloud Services', status: 'Verified', moaStatus: 'Expiring', moaExpiry: '2025-02-15', jobPostings: 5, ojtSlots: 10, slotsUsed: 8, contactPerson: 'Dr. Roberto Cruz', email: 'rcruz@cloudfirst.ph', phone: '032-7654321', address: 'Cebu Business Park, Cebu City', registeredDate: '2021-06-20', documents: ['Business Permit', 'SEC Registration', 'MOA', 'DTI Certificate'] },
    { id: 'C-004', name: 'DataStream Corp', industry: 'Data Analytics', status: 'Pending', moaStatus: 'Pending', moaExpiry: null, jobPostings: 1, ojtSlots: 3, slotsUsed: 0, contactPerson: 'Anna Rodriguez', email: 'anna@datastream.ph', phone: '02-9876543', address: 'BGC, Taguig City', registeredDate: '2025-01-12', documents: [] },
    { id: 'C-005', name: 'Philippine Data Inc.', industry: 'Big Data & AI', status: 'Verified', moaStatus: 'Active', moaExpiry: '2026-06-30', jobPostings: 6, ojtSlots: 12, slotsUsed: 10, contactPerson: 'Engr. Paolo Santos', email: 'psantos@phildata.com.ph', phone: '032-4567890', address: 'Lahug, Cebu City', registeredDate: '2020-09-01', documents: ['Business Permit', 'SEC Registration', 'MOA'] },
    { id: 'C-006', name: 'CreativeForge Studio', industry: 'Digital Design', status: 'Verified', moaStatus: 'Active', moaExpiry: '2025-08-15', jobPostings: 3, ojtSlots: 6, slotsUsed: 4, contactPerson: 'Sarah Mendez', email: 'sarah@creativeforge.ph', phone: '032-2223334', address: 'Mandaue City, Cebu', registeredDate: '2023-01-10', documents: ['Business Permit', 'SEC Registration', 'MOA'] },
    { id: 'C-007', name: 'Accenture PH', industry: 'IT Outsourcing', status: 'Verified', moaStatus: 'Active', moaExpiry: '2026-03-31', jobPostings: 12, ojtSlots: 25, slotsUsed: 20, contactPerson: 'Mark Anthony Lim', email: 'ma.lim@accenture.com', phone: '02-5551234', address: 'Cebu IT Park, Cebu City', registeredDate: '2019-04-15', documents: ['Business Permit', 'SEC Registration', 'MOA'] },
    { id: 'C-008', name: 'Globe Telecom', industry: 'Telecommunications', status: 'Verified', moaStatus: 'Active', moaExpiry: '2025-11-30', jobPostings: 4, ojtSlots: 8, slotsUsed: 6, contactPerson: 'Jennifer Ramos', email: 'j.ramos@globe.com.ph', phone: '02-7301234', address: 'Mandaluyong City, Metro Manila', registeredDate: '2020-02-01', documents: ['Business Permit', 'SEC Registration', 'MOA'] },
    { id: 'C-009', name: 'Collabera Digital', industry: 'Software Engineering', status: 'Verified', moaStatus: 'Active', moaExpiry: '2025-09-30', jobPostings: 7, ojtSlots: 10, slotsUsed: 7, contactPerson: 'Daniel Cheng', email: 'd.cheng@collabera.ph', phone: '032-8889999', address: 'Cebu IT Park, Cebu City', registeredDate: '2022-07-01', documents: ['Business Permit', 'SEC Registration', 'MOA'] },
    { id: 'C-010', name: 'BPO Connect Inc.', industry: 'BPO Services', status: 'Suspended', moaStatus: 'Expired', moaExpiry: '2024-06-30', jobPostings: 0, ojtSlots: 0, slotsUsed: 0, contactPerson: 'Rachel Yu', email: 'rachel@bpoconnect.ph', phone: '032-1110000', address: 'Mabolo, Cebu City', registeredDate: '2021-11-15', documents: ['Business Permit'] },
  ],

  /* ═══════════════════ OJT MANAGEMENT ═══════════════════ */
  ojt_deployments: [
    { id: 'D-001', studentId: 'S-001', studentName: 'Maria Santos', company: 'TechHub Cebu', supervisor: 'Engr. James Tan', program: 'BSIT', startDate: '2024-09-01', endDate: '2025-03-01', hoursCompleted: 320, hoursRequired: 600, status: 'On Track', documents: { endorsementLetter: true, parentConsent: true, medicalCert: true, insurance: true, dailyLog: false, completionReport: false } },
    { id: 'D-002', studentId: 'S-004', studentName: 'Carlo Mendoza', company: 'CloudFirst PH', supervisor: 'Dr. Roberto Cruz', program: 'BSCpE', startDate: '2024-08-15', endDate: '2025-02-15', hoursCompleted: 480, hoursRequired: 600, status: 'On Track', documents: { endorsementLetter: true, parentConsent: true, medicalCert: true, insurance: true, dailyLog: true, completionReport: false } },
    { id: 'D-003', studentId: 'S-006', studentName: 'Mark Villanueva', company: 'DataStream Corp', supervisor: 'Anna Rodriguez', program: 'BSIT', startDate: '2024-10-01', endDate: '2025-04-01', hoursCompleted: 200, hoursRequired: 600, status: 'Delayed', documents: { endorsementLetter: true, parentConsent: true, medicalCert: false, insurance: true, dailyLog: false, completionReport: false } },
    { id: 'D-004', studentId: 'S-009', studentName: 'Patricia Aquino', company: 'Accenture PH', supervisor: 'Mark Anthony Lim', program: 'BSIS', startDate: '2024-09-15', endDate: '2025-03-15', hoursCompleted: 400, hoursRequired: 600, status: 'On Track', documents: { endorsementLetter: true, parentConsent: true, medicalCert: true, insurance: true, dailyLog: true, completionReport: false } },
    { id: 'D-005', studentId: 'S-012', studentName: 'Rafael Navarro', company: 'Collabera Digital', supervisor: 'Daniel Cheng', program: 'BSCS', startDate: '2024-09-01', endDate: '2025-03-01', hoursCompleted: 350, hoursRequired: 600, status: 'On Track', documents: { endorsementLetter: true, parentConsent: true, medicalCert: true, insurance: false, dailyLog: false, completionReport: false } },
  ],

  ojt_supervisors: [
    { id: 'SUP-001', name: 'Engr. James Tan', company: 'TechHub Cebu', trainees: 3, rating: 4.5 },
    { id: 'SUP-002', name: 'Dr. Roberto Cruz', company: 'CloudFirst PH', trainees: 2, rating: 4.8 },
    { id: 'SUP-003', name: 'Mark Anthony Lim', company: 'Accenture PH', trainees: 5, rating: 4.2 },
    { id: 'SUP-004', name: 'Daniel Cheng', company: 'Collabera Digital', trainees: 2, rating: 4.6 },
    { id: 'SUP-005', name: 'Anna Rodriguez', company: 'DataStream Corp', trainees: 1, rating: 3.9 },
  ],

  /* ═══════════════════ JOB POSTINGS ═══════════════════ */
  job_postings: [
    { id: 'J-001', title: 'Full-Stack Developer Intern', company: 'TechHub Cebu', companyId: 'C-001', type: 'OJT', status: 'Active', posted: '2025-01-05', applicants: 24, salary: '₱8,000/mo', skills: ['JavaScript', 'React', 'Node.js'], moderationStatus: 'Approved' },
    { id: 'J-002', title: 'Data Entry Clerk', company: 'DataStream Corp', companyId: 'C-004', type: 'Part-time', status: 'Flagged', posted: '2025-01-12', applicants: 5, salary: '₱3,500/mo', skills: ['Excel', 'Typing'], moderationStatus: 'Flagged', flagReason: 'Salary below minimum wage' },
    { id: 'J-003', title: 'UI/UX Designer Intern', company: 'CreativeForge Studio', companyId: 'C-006', type: 'OJT', status: 'Active', posted: '2025-01-08', applicants: 18, salary: '₱7,500/mo', skills: ['Figma', 'Adobe XD', 'Prototyping'], moderationStatus: 'Approved' },
    { id: 'J-004', title: 'Network Engineer Trainee', company: 'Globe Telecom', companyId: 'C-008', type: 'OJT', status: 'Active', posted: '2025-01-03', applicants: 11, salary: '₱10,000/mo', skills: ['Cisco', 'Linux', 'Networking'], moderationStatus: 'Approved' },
    { id: 'J-005', title: 'AWS Cloud Intern', company: 'CloudFirst PH', companyId: 'C-003', type: 'OJT', status: 'Pending', posted: '2025-01-14', applicants: 0, salary: '₱9,000/mo', skills: ['AWS', 'Python', 'DevOps'], moderationStatus: 'Pending' },
    { id: 'J-006', title: 'Software QA Intern', company: 'Accenture PH', companyId: 'C-007', type: 'OJT', status: 'Active', posted: '2024-12-20', applicants: 31, salary: '₱8,500/mo', skills: ['Selenium', 'JIRA', 'Test Cases'], moderationStatus: 'Approved' },
    { id: 'J-007', title: 'Mobile App Developer', company: 'Collabera Digital', companyId: 'C-009', type: 'OJT', status: 'Active', posted: '2025-01-06', applicants: 15, salary: '₱9,500/mo', skills: ['Flutter', 'Dart', 'Firebase'], moderationStatus: 'Approved' },
    { id: 'J-008', title: 'Business Analyst Intern', company: 'Philippine Data Inc.', companyId: 'C-005', type: 'OJT', status: 'Closed', posted: '2024-11-15', applicants: 22, salary: '₱8,000/mo', skills: ['Power BI', 'SQL', 'Excel'], moderationStatus: 'Approved' },
  ],

  job_fairs: [
    { id: 'JF-001', title: 'CHMSU Job Fair 2025', date: '2025-01-28', venue: 'CHMSU Gymnasium', status: 'Upcoming', companies: 24, positions: 85 },
    { id: 'JF-002', title: 'IT Career Day 2024', date: '2024-10-15', venue: 'CHMSU Auditorium', status: 'Completed', companies: 18, positions: 62 },
  ],

  /* ═══════════════════ MATCHING & SCORING ═══════════════════ */
  matching_config: {
    weights: {
      academic: 35,
      skills: 35,
      ojtEvaluation: 30,
    },
    academicFactors: [
      { name: 'GPA', weight: 50 },
      { name: 'Relevant Coursework', weight: 30 },
      { name: 'Certifications', weight: 20 },
    ],
    skillsFactors: [
      { name: 'Technical Skills Match', weight: 60 },
      { name: 'Soft Skills', weight: 25 },
      { name: 'Tools Proficiency', weight: 15 },
    ],
    ojtFactors: [
      { name: 'Supervisor Rating', weight: 40 },
      { name: 'Attendance & Punctuality', weight: 30 },
      { name: 'Task Completion', weight: 30 },
    ],
  },

  skill_taxonomy: [
    { category: 'Programming', skills: ['JavaScript', 'Python', 'Java', 'C++', 'PHP', 'C#', 'TypeScript', 'Dart', 'Ruby', 'Go'] },
    { category: 'Web Development', skills: ['React', 'Vue.js', 'Angular', 'Node.js', 'Laravel', 'Django', 'Express', 'HTML/CSS', 'Bootstrap', 'Tailwind'] },
    { category: 'Data & AI', skills: ['SQL', 'Python ML', 'TensorFlow', 'Power BI', 'Tableau', 'R', 'Pandas', 'Scikit-learn', 'Big Data', 'NLP'] },
    { category: 'Cloud & DevOps', skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'Jenkins', 'Git'] },
    { category: 'Mobile', skills: ['Flutter', 'React Native', 'Android (Kotlin)', 'iOS (Swift)', 'Firebase', 'SQLite'] },
    { category: 'Design', skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Prototyping'] },
    { category: 'Networking', skills: ['Cisco', 'Network Security', 'Firewall', 'VPN', 'CCNA', 'Routing/Switching'] },
    { category: 'Business', skills: ['SAP', 'Business Analysis', 'Project Management', 'Agile/Scrum', 'JIRA', 'Excel Advanced'] },
  ],

  course_alignment: [
    { program: 'Bachelor of Science in Information Technology', topMatches: ['Web Developer', 'Full-Stack Developer', 'System Administrator', 'QA Engineer'] },
    { program: 'Bachelor of Science in Computer Science', topMatches: ['Software Engineer', 'Data Scientist', 'ML Engineer', 'Backend Developer'] },
    { program: 'Bachelor of Science in Information Systems', topMatches: ['Business Analyst', 'ERP Consultant', 'IT Auditor', 'Project Manager'] },
    { program: 'Bachelor of Science in Computer Engineering', topMatches: ['Embedded Systems Engineer', 'IoT Developer', 'Network Engineer', 'Hardware Engineer'] },
  ],

  /* ═══════════════════ REPORTS ═══════════════════ */
  reports_list: [
    { id: 'R-01', name: 'Employment Outcome Report', description: 'Graduate employment rates, salary ranges, and industry distribution', lastGenerated: '2025-01-10', frequency: 'Quarterly' },
    { id: 'R-02', name: 'Tracer Study Report', description: 'CHED-mandated graduate tracking survey results and analytics', lastGenerated: '2024-12-15', frequency: 'Annual' },
    { id: 'R-03', name: 'OJT Completion Report', description: 'OJT deployment status, completion rates, and supervisor feedback summary', lastGenerated: '2025-01-13', frequency: 'Monthly' },
    { id: 'R-04', name: 'Skills Mismatch Analysis', description: 'Gap analysis between graduate competencies and industry requirements', lastGenerated: '2024-11-30', frequency: 'Semester' },
    { id: 'R-05', name: 'Partner Engagement Report', description: 'Company partnership metrics, MOA status, and job posting trends', lastGenerated: '2025-01-08', frequency: 'Quarterly' },
    { id: 'R-06', name: 'Competency Gap Report', description: 'Curriculum alignment with industry demand per program', lastGenerated: '2024-10-20', frequency: 'Annual' },
  ],

  reports_employment: {
    overall: { employed: 82, underemployed: 10, unemployed: 8 },
    byProgram: [
      { program: 'BSIT', employed: 85, underemployed: 8, unemployed: 7 },
      { program: 'BSCS', employed: 88, underemployed: 7, unemployed: 5 },
      { program: 'BSIS', employed: 78, underemployed: 12, unemployed: 10 },
      { program: 'BSCpE', employed: 76, underemployed: 14, unemployed: 10 },
    ],
    salaryRange: { min: 15000, median: 22000, max: 45000, average: 24500 },
  },

  /* ═══════════════════ SETTINGS ═══════════════════ */
  settings_calendar: {
    academicYear: '2024-2025',
    semester: '2nd Semester',
    semStart: '2025-01-06',
    semEnd: '2025-05-30',
    ojtPeriod: { start: '2025-01-20', end: '2025-05-15' },
  },

  settings_users: [
    { id: 'U-001', name: 'Dr. Elena Magsaysay', email: 'elena.m@chmsu.edu.ph', role: 'Admin', status: 'Active', lastLogin: '2025-01-14' },
    { id: 'U-002', name: 'Prof. Ricardo Flores', email: 'ricardo.f@chmsu.edu.ph', role: 'Coordinator', status: 'Active', lastLogin: '2025-01-13' },
    { id: 'U-003', name: 'Ms. Sarah Lim', email: 'sarah.l@chmsu.edu.ph', role: 'Staff', status: 'Active', lastLogin: '2025-01-14' },
    { id: 'U-004', name: 'Engr. Pedro Reyes', email: 'pedro.r@chmsu.edu.ph', role: 'Coordinator', status: 'Inactive', lastLogin: '2024-11-20' },
  ],

  settings_audit_log: [
    { id: 'AL-001', action: 'Company Approved', user: 'Dr. Elena Magsaysay', target: 'TechHub Cebu', timestamp: '2025-01-14 09:30', ip: '192.168.1.45' },
    { id: 'AL-002', action: 'Job Posting Flagged', user: 'Ms. Sarah Lim', target: 'Data Entry Clerk', timestamp: '2025-01-13 14:15', ip: '192.168.1.52' },
    { id: 'AL-003', action: 'Student Record Updated', user: 'Prof. Ricardo Flores', target: 'Maria Santos (S-001)', timestamp: '2025-01-13 10:00', ip: '192.168.1.38' },
    { id: 'AL-004', action: 'Matching Weights Updated', user: 'Dr. Elena Magsaysay', target: 'Academic: 35%, Skills: 35%, OJT: 30%', timestamp: '2025-01-12 16:45', ip: '192.168.1.45' },
    { id: 'AL-005', action: 'Report Generated', user: 'Ms. Sarah Lim', target: 'Employment Outcome Report Q4 2024', timestamp: '2025-01-10 11:20', ip: '192.168.1.52' },
    { id: 'AL-006', action: 'User Account Created', user: 'Dr. Elena Magsaysay', target: 'Ms. Sarah Lim (U-003)', timestamp: '2025-01-05 08:30', ip: '192.168.1.45' },
  ],
};
