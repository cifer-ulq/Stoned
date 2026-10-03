/* ===========================
   Mock Data — Supervisor Portal
   =========================== */

export const mockData = {

  /* ── Dashboard Stats ── */
  dashboard_stats: {
    totalTrainees: 24,
    pendingEvaluations: 8,
    visitsThisMonth: 12,
    flaggedStudents: 3,
  },

  /* ── Upcoming Visits ── */
  dashboard_visits: [
    { id: 1, traineeId: 1, traineeName: 'Juan Dela Cruz', company: 'Acme Solutions Inc.', date: '2025-02-10', time: '10:00 AM', type: 'Routine' },
    { id: 2, traineeId: 3, traineeName: 'Pedro Santos', company: 'Globe Telecom Cebu', date: '2025-02-11', time: '2:00 PM', type: 'Follow-up' },
    { id: 3, traineeId: 5, traineeName: 'Angelica Rivera', company: 'NexGen Studios', date: '2025-02-13', time: '9:00 AM', type: 'Routine' },
    { id: 4, traineeId: 8, traineeName: 'Mark Villanueva', company: 'BPO Global Systems', date: '2025-02-14', time: '11:00 AM', type: 'Emergency' },
  ],

  /* ── Activities ── */
  dashboard_activities: [
    { id: 1, type: 'visit', text: 'Completed visit to Acme Solutions for Juan Dela Cruz', time: '2 hours ago' },
    { id: 2, type: 'eval', text: 'Submitted midterm evaluation for Ana Marie Gonzales', time: '5 hours ago' },
    { id: 3, type: 'flag', text: 'Flagged Mark Villanueva for low attendance', time: '1 day ago' },
    { id: 4, type: 'report', text: 'Generated deployment summary report', time: '1 day ago' },
    { id: 5, type: 'visit', text: 'Scheduled follow-up visit for Pedro Santos', time: '2 days ago' },
    { id: 6, type: 'eval', text: 'Reviewed final evaluation for Carlo Reyes', time: '3 days ago' },
  ],

  /* ── Trainees Ending Soon ── */
  dashboard_ending: [
    { id: 2, name: 'Ana Marie Gonzales', daysLeft: 12, hoursLeft: 48, course: 'BSIT' },
    { id: 6, name: 'Carlo Reyes', daysLeft: 18, hoursLeft: 72, course: 'BSCS' },
    { id: 9, name: 'Grace Lim', daysLeft: 22, hoursLeft: 88, course: 'BSIT' },
  ],

  /* ── Full Trainee List ── */
  trainees: [
    {
      id: 1, name: 'Juan Dela Cruz', course: 'BSIT', year: '4th Year',
      studentId: 'STU-2021-0001', email: 'juan.delacruz@chmsu.edu.ph', phone: '0917-123-4567',
      company: 'Acme Solutions Inc.', companyAddress: 'Colon St, Cebu City',
      supervisor: 'Mr. Roy Tan', startDate: '2025-01-06', endDate: '2025-04-06',
      requiredHours: 500, completedHours: 320, status: 'active',
      lat: 10.2934, lng: 123.9010,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Built user authentication module', status: 'approved' },
        { date: '2025-02-06', hours: 8, task: 'Database schema design', status: 'approved' },
        { date: '2025-02-05', hours: 8, task: 'Project requirements gathering', status: 'approved' },
      ],
      evaluations: { midterm: 'done', final: 'pending' },
      flag: null,
    },
    {
      id: 2, name: 'Ana Marie Gonzales', course: 'BSIT', year: '4th Year',
      studentId: 'STU-2021-0002', email: 'anamarie.gonzales@chmsu.edu.ph', phone: '0918-234-5678',
      company: 'TechHub Innovations', companyAddress: 'IT Park, Cebu City',
      supervisor: 'Ms. Lisa Chua', startDate: '2024-11-04', endDate: '2025-02-20',
      requiredHours: 500, completedHours: 452, status: 'active',
      lat: 10.3200, lng: 123.9050,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'UI testing and bug fixes', status: 'approved' },
        { date: '2025-02-06', hours: 8, task: 'Frontend development', status: 'pending' },
      ],
      evaluations: { midterm: 'done', final: 'pending' },
      flag: null,
    },
    {
      id: 3, name: 'Pedro Santos', course: 'BSCS', year: '4th Year',
      studentId: 'STU-2021-0003', email: 'pedro.santos@chmsu.edu.ph', phone: '0919-345-6789',
      company: 'Globe Telecom Cebu', companyAddress: 'Ayala Center, Cebu City',
      supervisor: 'Engr. Paulo Mendez', startDate: '2025-01-13', endDate: '2025-04-13',
      requiredHours: 500, completedHours: 180, status: 'active',
      lat: 10.3157, lng: 123.8854,
      dailyLogs: [
        { date: '2025-02-07', hours: 6, task: 'Network infrastructure monitoring', status: 'approved' },
      ],
      evaluations: { midterm: 'pending', final: 'locked' },
      flag: null,
    },
    {
      id: 4, name: 'Maria Clara Reyes', course: 'BSIT', year: '4th Year',
      studentId: 'STU-2021-0004', email: 'maria.reyes@chmsu.edu.ph', phone: '0920-456-7890',
      company: 'PixelForge PH', companyAddress: 'Mango Ave, Cebu City',
      supervisor: 'Mr. Ken Vega', startDate: '2025-01-06', endDate: '2025-04-06',
      requiredHours: 500, completedHours: 290, status: 'active',
      lat: 10.3084, lng: 123.8917,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Graphic design for client project', status: 'approved' },
      ],
      evaluations: { midterm: 'done', final: 'locked' },
      flag: null,
    },
    {
      id: 5, name: 'Angelica Rivera', course: 'BSCS', year: '4th Year',
      studentId: 'STU-2021-0005', email: 'angelica.rivera@chmsu.edu.ph', phone: '0921-567-8901',
      company: 'NexGen Studios', companyAddress: 'Banilad, Cebu City',
      supervisor: 'Ms. Joy Tan', startDate: '2025-01-13', endDate: '2025-04-13',
      requiredHours: 500, completedHours: 200, status: 'active',
      lat: 10.3340, lng: 123.8990,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Backend API development', status: 'pending' },
      ],
      evaluations: { midterm: 'pending', final: 'locked' },
      flag: null,
    },
    {
      id: 6, name: 'Carlo Reyes', course: 'BSCS', year: '4th Year',
      studentId: 'STU-2021-0006', email: 'carlo.reyes@chmsu.edu.ph', phone: '0922-678-9012',
      company: 'DataStream Analytics', companyAddress: 'AS Fortuna, Mandaue City',
      supervisor: 'Dr. Ramon Cruz', startDate: '2024-11-11', endDate: '2025-02-28',
      requiredHours: 500, completedHours: 428, status: 'active',
      lat: 10.3327, lng: 123.9232,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Data visualization dashboard', status: 'approved' },
      ],
      evaluations: { midterm: 'done', final: 'pending' },
      flag: null,
    },
    {
      id: 7, name: 'Diana Trinidad', course: 'BSIT', year: '4th Year',
      studentId: 'STU-2021-0007', email: 'diana.trinidad@chmsu.edu.ph', phone: '0923-789-0123',
      company: 'CloudNine Systems', companyAddress: 'Lahug, Cebu City',
      supervisor: 'Ms. Sarah Lee', startDate: '2025-01-06', endDate: '2025-04-06',
      requiredHours: 500, completedHours: 310, status: 'active',
      lat: 10.3191, lng: 123.8886,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Cloud deployment configuration', status: 'approved' },
      ],
      evaluations: { midterm: 'done', final: 'locked' },
      flag: null,
    },
    {
      id: 8, name: 'Mark Villanueva', course: 'BSCS', year: '4th Year',
      studentId: 'STU-2021-0008', email: 'mark.villanueva@chmsu.edu.ph', phone: '0924-890-1234',
      company: 'BPO Global Systems', companyAddress: 'J. Osmenia St, Cebu City',
      supervisor: 'Mr. Eric Santos', startDate: '2025-01-13', endDate: '2025-04-13',
      requiredHours: 500, completedHours: 120, status: 'flagged',
      lat: 10.3000, lng: 123.8950,
      dailyLogs: [
        { date: '2025-02-07', hours: 4, task: 'System troubleshooting', status: 'pending' },
      ],
      evaluations: { midterm: 'pending', final: 'locked' },
      flag: 'Low attendance — only 4 hrs logged on Feb 7',
    },
    {
      id: 9, name: 'Grace Lim', course: 'BSIT', year: '4th Year',
      studentId: 'STU-2021-0009', email: 'grace.lim@chmsu.edu.ph', phone: '0925-901-2345',
      company: 'WebCraft Solutions', companyAddress: 'Talamban, Cebu City',
      supervisor: 'Ms. Anna Garcia', startDate: '2024-11-18', endDate: '2025-03-07',
      requiredHours: 500, completedHours: 412, status: 'active',
      lat: 10.3445, lng: 123.9100,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'E-commerce module development', status: 'approved' },
      ],
      evaluations: { midterm: 'done', final: 'pending' },
      flag: null,
    },
    {
      id: 10, name: 'Leo Fernandez', course: 'BSCS', year: '4th Year',
      studentId: 'STU-2021-0010', email: 'leo.fernandez@chmsu.edu.ph', phone: '0926-012-3456',
      company: 'SkyNet Philippines', companyAddress: 'Mactan, Lapu-Lapu City',
      supervisor: 'Engr. Mike Torres', startDate: '2025-01-06', endDate: '2025-04-06',
      requiredHours: 500, completedHours: 250, status: 'flagged',
      lat: 10.3117, lng: 123.9681,
      dailyLogs: [
        { date: '2025-02-06', hours: 8, task: 'Hardware assembly and testing', status: 'approved' },
      ],
      evaluations: { midterm: 'pending', final: 'locked' },
      flag: 'Supervisor reports frequent tardiness',
    },
    {
      id: 11, name: 'Rosa Aquino', course: 'BSIT', year: '4th Year',
      studentId: 'STU-2021-0011', email: 'rosa.aquino@chmsu.edu.ph', phone: '0927-123-4567',
      company: 'InfoSec Guard PH', companyAddress: 'Capitol Site, Cebu City',
      supervisor: 'Mr. James Ong', startDate: '2025-01-13', endDate: '2025-04-13',
      requiredHours: 500, completedHours: 200, status: 'active',
      lat: 10.3175, lng: 123.8915,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Security audit documentation', status: 'approved' },
      ],
      evaluations: { midterm: 'pending', final: 'locked' },
      flag: null,
    },
    {
      id: 12, name: 'Kevin Bautista', course: 'BSCS', year: '4th Year',
      studentId: 'STU-2021-0012', email: 'kevin.bautista@chmsu.edu.ph', phone: '0928-234-5678',
      company: 'Acme Solutions Inc.', companyAddress: 'Colon St, Cebu City',
      supervisor: 'Mr. Roy Tan', startDate: '2025-01-06', endDate: '2025-04-06',
      requiredHours: 500, completedHours: 340, status: 'flagged',
      lat: 10.2934, lng: 123.9010,
      dailyLogs: [
        { date: '2025-02-07', hours: 8, task: 'Mobile app prototype testing', status: 'approved' },
      ],
      evaluations: { midterm: 'done', final: 'locked' },
      flag: 'Academic hold — missing clearance document',
    },
  ],

  /* ── Evaluation forms data ── */
  evaluations: [
    { traineeId: 1, type: 'midterm', status: 'done', submittedDate: '2025-02-01',
      scores: { professionalism: 4, technical: 5, communication: 4, initiative: 4, teamwork: 5 },
      remarks: 'Excellent performer. Shows strong technical ability.' },
    { traineeId: 2, type: 'midterm', status: 'done', submittedDate: '2025-01-15',
      scores: { professionalism: 5, technical: 4, communication: 5, initiative: 4, teamwork: 5 },
      remarks: 'Very professional and communicates well with team.' },
    { traineeId: 4, type: 'midterm', status: 'done', submittedDate: '2025-02-03',
      scores: { professionalism: 4, technical: 4, communication: 4, initiative: 3, teamwork: 4 },
      remarks: 'Good overall, could take more initiative.' },
    { traineeId: 6, type: 'midterm', status: 'done', submittedDate: '2025-01-20',
      scores: { professionalism: 5, technical: 5, communication: 3, initiative: 5, teamwork: 4 },
      remarks: 'Outstanding technical skills. Communication could improve.' },
    { traineeId: 7, type: 'midterm', status: 'done', submittedDate: '2025-02-05',
      scores: { professionalism: 4, technical: 4, communication: 5, initiative: 4, teamwork: 5 },
      remarks: 'Great team player with strong communication skills.' },
    { traineeId: 9, type: 'midterm', status: 'done', submittedDate: '2025-01-18',
      scores: { professionalism: 5, technical: 5, communication: 4, initiative: 5, teamwork: 4 },
      remarks: 'Self-driven student. Consistently delivers quality work.' },
    { traineeId: 12, type: 'midterm', status: 'done', submittedDate: '2025-02-02',
      scores: { professionalism: 3, technical: 4, communication: 3, initiative: 3, teamwork: 3 },
      remarks: 'Needs improvement in professionalism and communication.' },
  ],

  /* ── OJT Slots (mirror of company/student listings) ── */
  ojt_slots: [
    {
      id: 1, slotTitle: 'IT Support & Web Development Intern',
      company: 'TechCorp Solutions', companyInitial: 'T', companyColor: '#4A6CF7',
      department: 'IT Department', industry: 'Information Technology',
      duration: '3 months (600 hrs)', location: 'Bacolod City, Negros Occidental',
      scheduleType: 'full_day', schedule: 'Mon–Fri · Full Day',
      slots: 5, slotsRemaining: 3, status: 'open',
      preferredCourses: ['BSIT', 'BSCS'], postedDate: 'Apr 10, 2026',
      description: 'Join our IT team to work on real-world web applications and IT infrastructure.',
    },
    {
      id: 2, slotTitle: 'Accounting & Finance Trainee',
      company: 'GreenLeaf Corp', companyInitial: 'G', companyColor: '#10B981',
      department: 'Finance Department', industry: 'Finance & Accounting',
      duration: '3 months (600 hrs)', location: 'Bacolod City, Negros Occidental',
      scheduleType: 'full_day', schedule: 'Mon–Fri · Full Day',
      slots: 3, slotsRemaining: 1, status: 'filling_up',
      preferredCourses: ['BSA', 'BSBA'], postedDate: 'Apr 5, 2026',
      description: 'Work with our finance team handling bookkeeping and financial reports.',
    },
    {
      id: 3, slotTitle: 'Marketing & Digital Media Intern',
      company: 'CreativeLab PH', companyInitial: 'C', companyColor: '#F59E0B',
      department: 'Marketing Department', industry: 'Marketing & Analytics',
      duration: '3 months (243 hrs)', location: 'Bacolod City, Negros Occidental',
      scheduleType: 'half_day', schedule: 'Mon–Fri · Half Day AM',
      slots: 4, slotsRemaining: 4, status: 'open',
      preferredCourses: ['BSBA', 'BSEd', 'Any'], postedDate: 'Apr 12, 2026',
      description: 'Create social media content and assist with digital marketing campaigns.',
    },
    {
      id: 4, slotTitle: 'HR & Administrative Support Trainee',
      company: 'Meridian BPO', companyInitial: 'M', companyColor: '#8B5CF6',
      department: 'Human Resources', industry: 'Business Process Outsourcing',
      duration: '3 months (600 hrs)', location: 'Silay City, Negros Occidental',
      scheduleType: 'full_day', schedule: 'Mon–Fri · Full Day',
      slots: 6, slotsRemaining: 5, status: 'open',
      preferredCourses: ['BSBA', 'BSIT', 'Any'], postedDate: 'Mar 28, 2026',
      description: 'Support HR operations including recruitment coordination and record management.',
    },
    {
      id: 5, slotTitle: 'Software QA & Testing Intern',
      company: 'DataFlow Inc.', companyInitial: 'D', companyColor: '#EF4444',
      department: 'IT Department', industry: 'Information Technology',
      duration: '3 months (600 hrs)', location: 'Bacolod City, Negros Occidental',
      scheduleType: 'full_day', schedule: 'Mon–Fri · Full Day',
      slots: 2, slotsRemaining: 0, status: 'closed',
      preferredCourses: ['BSIT', 'BSCS', 'BSCpE'], postedDate: 'Mar 15, 2026',
      description: 'Execute test cases, document bugs, and ensure software quality.',
    },
  ],

  /* ── Student OJT Interest Records ── */
  supervisor_interests: [
    {
      id: 101, slotId: 1, slotTitle: 'IT Support & Web Development Intern',
      company: 'TechCorp Solutions',
      studentName: 'Miguel Santos', studentCourse: 'BSIT',
      studentEmail: 'miguel.santos@chmsu.edu.ph', studentYear: '4th Year',
      message: 'I have experience in web development and would love to apply my skills here.',
      status: 'endorsement_requested', createdAt: '2026-04-16T08:30:00.000Z',
    },
    {
      id: 102, slotId: 1, slotTitle: 'IT Support & Web Development Intern',
      company: 'TechCorp Solutions',
      studentName: 'Katrina Reyes', studentCourse: 'BSCS',
      studentEmail: 'katrina.reyes@chmsu.edu.ph', studentYear: '4th Year',
      message: 'Very interested. I have completed web dev projects and am eager to contribute.',
      status: 'company_accepted', createdAt: '2026-04-17T09:15:00.000Z',
    },
    {
      id: 103, slotId: 1, slotTitle: 'IT Support & Web Development Intern',
      company: 'TechCorp Solutions',
      studentName: 'Bryan Flores', studentCourse: 'BSIT',
      studentEmail: 'bryan.flores@chmsu.edu.ph', studentYear: '4th Year',
      message: '',
      status: 'recommended', createdAt: '2026-04-14T10:00:00.000Z',
      recommendedAt: '2026-04-18T11:00:00.000Z',
    },
    {
      id: 104, slotId: 2, slotTitle: 'Accounting & Finance Trainee',
      company: 'GreenLeaf Corp',
      studentName: 'Liza Mendoza', studentCourse: 'BSA',
      studentEmail: 'liza.mendoza@chmsu.edu.ph', studentYear: '4th Year',
      message: 'Accounting is my major and I am confident I can perform well.',
      status: 'interested', createdAt: '2026-04-15T14:00:00.000Z',
    },
    {
      id: 105, slotId: 3, slotTitle: 'Marketing & Digital Media Intern',
      company: 'CreativeLab PH',
      studentName: 'Jessa Villanueva', studentCourse: 'BSBA',
      studentEmail: 'jessa.villanueva@chmsu.edu.ph', studentYear: '4th Year',
      message: 'I manage my own social media pages and love creating content.',
      status: 'interested', createdAt: '2026-04-18T07:45:00.000Z',
    },
    {
      id: 106, slotId: 4, slotTitle: 'HR & Administrative Support Trainee',
      company: 'Meridian BPO',
      studentName: 'Ronald Cruz', studentCourse: 'BSBA',
      studentEmail: 'ronald.cruz@chmsu.edu.ph', studentYear: '4th Year',
      message: 'Excited to render my OJT hours at Meridian BPO.',
      status: 'company_accepted', createdAt: '2026-04-13T09:00:00.000Z',
    },
  ],

  /* ── Reports config ── */
  reports: [
    { id: 'deployment', title: 'Deployment Summary', desc: 'Overview of all trainee placements, companies, and duration.', icon: 'users', color: 'var(--color-primary)' },
    { id: 'visit-log', title: 'Visit Log Report', desc: 'Detailed record of all monitoring visits with findings.', icon: 'mapPin', color: 'var(--color-success)' },
    { id: 'evaluation-summary', title: 'Evaluation Summary', desc: 'Aggregate evaluation scores across all trainees.', icon: 'clipboardCheck', color: 'var(--color-warning)' },
    { id: 'flagged', title: 'Flagged Students', desc: 'List of students with issues requiring administrative attention.', icon: 'alertTriangle', color: 'var(--color-error)' },
  ],

  /* ── Monitoring Map Overview ── */
  monitoring_overview: [
    { postingId: 1, postingTitle: 'Software Development Intern', company: 'Acme Solutions Inc.', companyAddress: 'Colon St, Cebu City', lat: 10.2934, lng: 123.9010, color: '#4A6CF7', activeCount: 2, students: [
      { id: 1,  name: 'Juan Dela Cruz',    initials: 'JD', course: 'BSIT', studentId: 'STU-2021-0001', completedHours: 320, requiredHours: 500, status: 'active',  flag: null,  lastSeen: { lat: 10.2930, lng: 123.9005, time: 'Today, 8:02 AM' } },
      { id: 12, name: 'Kevin Bautista',    initials: 'KB', course: 'BSCS', studentId: 'STU-2021-0012', completedHours: 340, requiredHours: 500, status: 'flagged', flag: 'Academic hold — missing clearance document', lastSeen: { lat: 10.2938, lng: 123.9014, time: 'Today, 8:10 AM' } },
    ]},
    { postingId: 2, postingTitle: 'Frontend Development Intern', company: 'TechHub Innovations', companyAddress: 'IT Park, Cebu City', lat: 10.3200, lng: 123.9050, color: '#10B981', activeCount: 1, students: [
      { id: 2, name: 'Ana Marie Gonzales', initials: 'AM', course: 'BSIT', studentId: 'STU-2021-0002', completedHours: 452, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3203, lng: 123.9047, time: 'Today, 8:05 AM' } },
    ]},
    { postingId: 3, postingTitle: 'Network & Systems Intern', company: 'Globe Telecom Cebu', companyAddress: 'Ayala Center, Cebu City', lat: 10.3157, lng: 123.8854, color: '#2563EB', activeCount: 1, students: [
      { id: 3, name: 'Pedro Santos', initials: 'PS', course: 'BSCS', studentId: 'STU-2021-0003', completedHours: 180, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3155, lng: 123.8857, time: 'Today, 8:15 AM' } },
    ]},
    { postingId: 4, postingTitle: 'UI/UX & Graphics Intern', company: 'PixelForge PH', companyAddress: 'Mango Ave, Cebu City', lat: 10.3084, lng: 123.8917, color: '#F59E0B', activeCount: 1, students: [
      { id: 4, name: 'Maria Clara Reyes', initials: 'MC', course: 'BSIT', studentId: 'STU-2021-0004', completedHours: 290, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3082, lng: 123.8915, time: 'Today, 8:00 AM' } },
    ]},
    { postingId: 5, postingTitle: 'Backend Development Intern', company: 'NexGen Studios', companyAddress: 'Banilad, Cebu City', lat: 10.3340, lng: 123.8990, color: '#8B5CF6', activeCount: 1, students: [
      { id: 5, name: 'Angelica Rivera', initials: 'AR', course: 'BSCS', studentId: 'STU-2021-0005', completedHours: 200, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3343, lng: 123.8988, time: 'Today, 8:07 AM' } },
    ]},
    { postingId: 6, postingTitle: 'Data Analytics Intern', company: 'DataStream Analytics', companyAddress: 'AS Fortuna, Mandaue City', lat: 10.3327, lng: 123.9232, color: '#06B6D4', activeCount: 1, students: [
      { id: 6, name: 'Carlo Reyes', initials: 'CR', course: 'BSCS', studentId: 'STU-2021-0006', completedHours: 428, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3325, lng: 123.9235, time: 'Today, 8:03 AM' } },
    ]},
    { postingId: 7, postingTitle: 'Cloud Infrastructure Intern', company: 'CloudNine Systems', companyAddress: 'Lahug, Cebu City', lat: 10.3191, lng: 123.8886, color: '#64748B', activeCount: 1, students: [
      { id: 7, name: 'Diana Trinidad', initials: 'DT', course: 'BSIT', studentId: 'STU-2021-0007', completedHours: 310, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3188, lng: 123.8889, time: 'Today, 8:09 AM' } },
    ]},
    { postingId: 8, postingTitle: 'IT Support & Operations Intern', company: 'BPO Global Systems', companyAddress: 'J. Osmena St, Cebu City', lat: 10.3000, lng: 123.8950, color: '#EF4444', activeCount: 1, students: [
      { id: 8, name: 'Mark Villanueva', initials: 'MV', course: 'BSCS', studentId: 'STU-2021-0008', completedHours: 120, requiredHours: 500, status: 'flagged', flag: 'Low attendance — only 4 hrs logged on Feb 7', lastSeen: { lat: 10.3000, lng: 123.8950, time: 'Yesterday, 8:30 AM' } },
    ]},
    { postingId: 9, postingTitle: 'E-Commerce Developer Intern', company: 'WebCraft Solutions', companyAddress: 'Talamban, Cebu City', lat: 10.3445, lng: 123.9100, color: '#34C759', activeCount: 1, students: [
      { id: 9, name: 'Grace Lim', initials: 'GL', course: 'BSIT', studentId: 'STU-2021-0009', completedHours: 412, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3448, lng: 123.9097, time: 'Today, 8:01 AM' } },
    ]},
    { postingId: 10, postingTitle: 'Hardware & Systems Intern', company: 'SkyNet Philippines', companyAddress: 'Mactan, Lapu-Lapu City', lat: 10.3117, lng: 123.9681, color: '#F97316', activeCount: 1, students: [
      { id: 10, name: 'Leo Fernandez', initials: 'LF', course: 'BSCS', studentId: 'STU-2021-0010', completedHours: 250, requiredHours: 500, status: 'flagged', flag: 'Supervisor reports frequent tardiness', lastSeen: { lat: 10.3120, lng: 123.9678, time: 'Today, 9:15 AM' } },
    ]},
    { postingId: 11, postingTitle: 'Cybersecurity Intern', company: 'InfoSec Guard PH', companyAddress: 'Capitol Site, Cebu City', lat: 10.3175, lng: 123.8915, color: '#7C3AED', activeCount: 1, students: [
      { id: 11, name: 'Rosa Aquino', initials: 'RA', course: 'BSIT', studentId: 'STU-2021-0011', completedHours: 200, requiredHours: 500, status: 'active', flag: null, lastSeen: { lat: 10.3177, lng: 123.8912, time: 'Today, 8:04 AM' } },
    ]},
  ],

  /* ── Monitoring: Time Logs per Student (with GPS coordinates) ── */
  'monitoring/student/1/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:02 AM', timeOut:'5:01 PM', hours:8.0, status:'approved', task:'Built user authentication module',    locationValidity:'Valid',   distanceMeters:38,  inLat:10.2930, inLon:123.9005, outLat:10.2932, outLon:123.9007 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Database schema design & migration', locationValidity:'Valid',   distanceMeters:45,  inLat:10.2935, inLon:123.9008, outLat:10.2934, outLon:123.9010 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:05 AM', timeOut:'5:03 PM', hours:8.0, status:'approved', task:'API integration for dashboard',       locationValidity:'Valid',   distanceMeters:52,  inLat:10.2931, inLon:123.9009, outLat:10.2933, outLon:123.9011 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'8:01 AM', timeOut:'5:00 PM', hours:8.0, status:'pending',  task:'Code review and documentation',      locationValidity:'Valid',   distanceMeters:60,  inLat:10.2934, inLon:123.9013, outLat:10.2935, outLon:123.9010 },
    { id:5, date:'Apr 21, 2026', dayLabel:'Mon Apr 21', timeIn:'8:00 AM', timeOut:'4:59 PM', hours:8.0, status:'approved', task:'Unit testing & bug fixes',            locationValidity:'Valid',   distanceMeters:41,  inLat:10.2932, inLon:123.9011, outLat:10.2934, outLon:123.9010 },
  ],
  'monitoring/student/2/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:05 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'UI testing and bug fixes',      locationValidity:'Valid', distanceMeters:55, inLat:10.3203, inLon:123.9047, outLat:10.3202, outLon:123.9049 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:02 AM', timeOut:'5:01 PM', hours:8.0, status:'approved', task:'Frontend component library',    locationValidity:'Valid', distanceMeters:48, inLat:10.3201, inLon:123.9052, outLat:10.3200, outLon:123.9050 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'React component optimization',  locationValidity:'Valid', distanceMeters:62, inLat:10.3198, inLon:123.9048, outLat:10.3199, outLon:123.9051 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'8:03 AM', timeOut:'5:02 PM', hours:8.0, status:'pending',  task:'Design system documentation',  locationValidity:'Valid', distanceMeters:70, inLat:10.3204, inLon:123.9046, outLat:10.3202, outLon:123.9050 },
    { id:5, date:'Apr 21, 2026', dayLabel:'Mon Apr 21', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Accessibility improvements',   locationValidity:'Valid', distanceMeters:44, inLat:10.3200, inLon:123.9049, outLat:10.3201, outLon:123.9051 },
  ],
  'monitoring/student/3/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:15 AM', timeOut:'5:10 PM', hours:8.0, status:'approved', task:'Network monitoring dashboard', locationValidity:'Valid', distanceMeters:30, inLat:10.3155, inLon:123.8857, outLat:10.3156, outLon:123.8855 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:10 AM', timeOut:'2:10 PM', hours:6.0, status:'approved', task:'Firewall configuration audit', locationValidity:'Valid', distanceMeters:44, inLat:10.3156, inLon:123.8856, outLat:10.3157, outLon:123.8854 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:07 AM', timeOut:'5:05 PM', hours:8.0, status:'pending',  task:'Server maintenance report',   locationValidity:'Valid', distanceMeters:55, inLat:10.3154, inLon:123.8858, outLat:10.3155, outLon:123.8856 },
  ],
  'monitoring/student/4/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Graphic design for client project', locationValidity:'Valid', distanceMeters:40, inLat:10.3082, inLon:123.8915, outLat:10.3083, outLon:123.8917 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:01 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Social media asset creation',       locationValidity:'Valid', distanceMeters:52, inLat:10.3084, inLon:123.8916, outLat:10.3083, outLon:123.8918 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:03 AM', timeOut:'5:01 PM', hours:8.0, status:'pending',  task:'Brand identity guidelines',        locationValidity:'Valid', distanceMeters:65, inLat:10.3081, inLon:123.8917, outLat:10.3082, outLon:123.8919 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Client presentation deck',          locationValidity:'Valid', distanceMeters:47, inLat:10.3083, inLon:123.8914, outLat:10.3084, outLon:123.8916 },
  ],
  'monitoring/student/5/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:07 AM', timeOut:'5:05 PM', hours:8.0, status:'pending',  task:'Backend API development',      locationValidity:'Valid', distanceMeters:35, inLat:10.3343, inLon:123.8988, outLat:10.3341, outLon:123.8990 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:05 AM', timeOut:'5:03 PM', hours:8.0, status:'approved', task:'REST API documentation',        locationValidity:'Valid', distanceMeters:48, inLat:10.3341, inLon:123.8991, outLat:10.3342, outLon:123.8989 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:03 AM', timeOut:'5:01 PM', hours:8.0, status:'approved', task:'Database query optimization',   locationValidity:'Valid', distanceMeters:61, inLat:10.3340, inLon:123.8992, outLat:10.3341, outLon:123.8990 },
  ],
  'monitoring/student/6/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:03 AM', timeOut:'5:02 PM', hours:8.0, status:'approved', task:'Data visualization dashboard',  locationValidity:'Valid', distanceMeters:28, inLat:10.3325, inLon:123.9235, outLat:10.3326, outLon:123.9233 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:01 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'ETL pipeline development',      locationValidity:'Valid', distanceMeters:40, inLat:10.3327, inLon:123.9231, outLat:10.3326, outLon:123.9232 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Report generation module',      locationValidity:'Valid', distanceMeters:55, inLat:10.3326, inLon:123.9233, outLat:10.3327, outLon:123.9231 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'8:02 AM', timeOut:'5:01 PM', hours:8.0, status:'pending',  task:'ML model integration testing',  locationValidity:'Valid', distanceMeters:62, inLat:10.3328, inLon:123.9230, outLat:10.3327, outLon:123.9232 },
    { id:5, date:'Apr 21, 2026', dayLabel:'Mon Apr 21', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Data cleaning & preprocessing', locationValidity:'Valid', distanceMeters:36, inLat:10.3327, inLon:123.9234, outLat:10.3325, outLon:123.9233 },
  ],
  'monitoring/student/7/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:09 AM', timeOut:'5:07 PM', hours:8.0, status:'approved', task:'Cloud deployment configuration', locationValidity:'Valid', distanceMeters:42, inLat:10.3188, inLon:123.8889, outLat:10.3190, outLon:123.8887 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:04 AM', timeOut:'5:02 PM', hours:8.0, status:'approved', task:'Docker container setup',          locationValidity:'Valid', distanceMeters:38, inLat:10.3190, inLon:123.8886, outLat:10.3191, outLon:123.8885 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:06 AM', timeOut:'5:04 PM', hours:8.0, status:'pending',  task:'CI/CD pipeline configuration',   locationValidity:'Valid', distanceMeters:50, inLat:10.3192, inLon:123.8888, outLat:10.3190, outLon:123.8887 },
  ],
  'monitoring/student/8/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'9:30 AM', timeOut:'1:30 PM', hours:4.0, status:'pending',  task:'System troubleshooting',      locationValidity:'Too Far', distanceMeters:820, inLat:10.3100, inLon:123.9100, outLat:10.3000, outLon:123.8950 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:30 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Helpdesk ticket resolution',   locationValidity:'Valid',   distanceMeters:65,  inLat:10.3002, inLon:123.8948, outLat:10.3001, outLon:123.8950 },
    { id:3, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'10:00 AM', timeOut:'2:00 PM', hours:4.0, status:'pending', task:'Hardware inventory check',     locationValidity:'Too Far', distanceMeters:640, inLat:10.3150, inLon:123.9020, outLat:10.3000, outLon:123.8953 },
  ],
  'monitoring/student/9/logs':  [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:01 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'E-commerce module development', locationValidity:'Valid', distanceMeters:33, inLat:10.3448, inLon:123.9097, outLat:10.3447, outLon:123.9099 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Payment gateway integration',   locationValidity:'Valid', distanceMeters:46, inLat:10.3446, inLon:123.9101, outLat:10.3447, outLon:123.9100 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:03 AM', timeOut:'5:01 PM', hours:8.0, status:'approved', task:'Inventory management module',   locationValidity:'Valid', distanceMeters:58, inLat:10.3445, inLon:123.9102, outLat:10.3446, outLon:123.9100 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'8:01 AM', timeOut:'5:00 PM', hours:8.0, status:'pending',  task:'Admin panel UI redesign',       locationValidity:'Valid', distanceMeters:40, inLat:10.3447, inLon:123.9098, outLat:10.3448, outLon:123.9097 },
    { id:5, date:'Apr 21, 2026', dayLabel:'Mon Apr 21', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Product catalog module',        locationValidity:'Valid', distanceMeters:37, inLat:10.3445, inLon:123.9099, outLat:10.3446, outLon:123.9101 },
  ],
  'monitoring/student/10/logs': [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'9:15 AM', timeOut:'5:00 PM', hours:7.0, status:'pending',  task:'Hardware assembly and testing',    locationValidity:'Too Far', distanceMeters:540, inLat:10.3200, inLon:123.9400, outLat:10.3117, outLon:123.9681 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:05 AM', timeOut:'5:02 PM', hours:8.0, status:'approved', task:'Network cabling and setup',         locationValidity:'Valid',   distanceMeters:50,  inLat:10.3118, inLon:123.9679, outLat:10.3117, outLon:123.9682 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:10 AM', timeOut:'5:08 PM', hours:8.0, status:'approved', task:'Server rack installation',          locationValidity:'Valid',   distanceMeters:60,  inLat:10.3116, inLon:123.9683, outLat:10.3117, outLon:123.9681 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'9:30 AM', timeOut:'4:30 PM', hours:7.0, status:'pending',  task:'Driver installation & diagnostics', locationValidity:'Too Far', distanceMeters:380, inLat:10.3250, inLon:123.9500, outLat:10.3117, outLon:123.9682 },
  ],
  'monitoring/student/11/logs': [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:04 AM', timeOut:'5:02 PM', hours:8.0, status:'approved', task:'Security audit documentation',   locationValidity:'Valid', distanceMeters:38, inLat:10.3177, inLon:123.8912, outLat:10.3176, outLon:123.8914 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:01 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Vulnerability assessment report', locationValidity:'Valid', distanceMeters:44, inLat:10.3175, inLon:123.8916, outLat:10.3176, outLon:123.8915 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:02 AM', timeOut:'5:01 PM', hours:8.0, status:'pending',  task:'Incident response drill',        locationValidity:'Valid', distanceMeters:55, inLat:10.3176, inLon:123.8913, outLat:10.3175, outLon:123.8915 },
  ],
  'monitoring/student/12/logs': [
    { id:1, date:'Apr 25, 2026', dayLabel:'Fri Apr 25', timeIn:'8:10 AM', timeOut:'5:05 PM', hours:8.0, status:'approved', task:'Mobile app prototype testing',    locationValidity:'Valid',   distanceMeters:50,  inLat:10.2938, inLon:123.9014, outLat:10.2937, outLon:123.9012 },
    { id:2, date:'Apr 24, 2026', dayLabel:'Thu Apr 24', timeIn:'8:05 AM', timeOut:'12:05 PM', hours:4.0, status:'pending', task:'Unit tests for API endpoints',    locationValidity:'Too Far', distanceMeters:710, inLat:10.3300, inLon:123.9200, outLat:10.2938, outLon:123.9013 },
    { id:3, date:'Apr 23, 2026', dayLabel:'Wed Apr 23', timeIn:'8:02 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Code review & refactoring',       locationValidity:'Valid',   distanceMeters:48,  inLat:10.2936, inLon:123.9011, outLat:10.2937, outLon:123.9012 },
    { id:4, date:'Apr 22, 2026', dayLabel:'Tue Apr 22', timeIn:'8:00 AM', timeOut:'5:00 PM', hours:8.0, status:'approved', task:'Integration testing',             locationValidity:'Valid',   distanceMeters:55,  inLat:10.2937, inLon:123.9013, outLat:10.2936, outLon:123.9012 },
  ],

};
