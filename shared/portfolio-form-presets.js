/**
 * CHMSU HireMe — Shared Portfolio Form Presets & Helpers
 * Powers dynamic, low-typing Experience and Education modals across Student & Graduate portals.
 */

export const CHMSU_CAMPUSES = [
  { key: 'talisay', label: 'Talisay (Main Campus)', full: 'Carlos Hilado Memorial State University - Talisay (Main Campus)', city: 'Talisay City' },
  { key: 'fortune_towne', label: 'Fortune Towne', full: 'Carlos Hilado Memorial State University - Fortune Towne Campus', city: 'Bacolod City' },
  { key: 'binalbagan', label: 'Binalbagan', full: 'Carlos Hilado Memorial State University - Binalbagan Campus', city: 'Binalbagan' },
  { key: 'alijis', label: 'Alijis', full: 'Carlos Hilado Memorial State University - Alijis Campus', city: 'Bacolod City' },
];

export const REGIONAL_SCHOOLS = [
  'Carlos Hilado Memorial State University - Talisay (Main Campus)',
  'Carlos Hilado Memorial State University - Fortune Towne Campus',
  'Carlos Hilado Memorial State University - Binalbagan Campus',
  'Carlos Hilado Memorial State University - Alijis Campus',
  'University of St. La Salle (USLS)',
  'STI West Negros University',
  'Riverside College',
  'University of Negros Occidental - Recoletos (UNO-R)',
  'Technological University of the Philippines Visayas (TUPV)',
  'Bacolod City College (BCC)',
  'Colegio San Agustin - Bacolod',
  'VMA Global College',
  'Carlos Hilado Memorial State College',
  'Senior High School',
];

export const DEGREE_ACRONYM_MAP = [
  // IT & Computing
  { acronym: 'BSIT', title: 'Bachelor of Science in Information Technology', category: 'it' },
  { acronym: 'BSCS', title: 'Bachelor of Science in Computer Science', category: 'it' },
  { acronym: 'BSIS', title: 'Bachelor of Science in Information Systems', category: 'it' },
  { acronym: 'BSCPE', title: 'Bachelor of Science in Computer Engineering', category: 'it' },
  { acronym: 'BSINDTECH', title: 'Bachelor of Science in Industrial Technology', category: 'it' },
  // Business & Management
  { acronym: 'BSBA', title: 'Bachelor of Science in Business Administration', category: 'business' },
  { acronym: 'BSA', title: 'Bachelor of Science in Accountancy', category: 'business' },
  { acronym: 'BSHM', title: 'Bachelor of Science in Hospitality Management', category: 'business' },
  { acronym: 'BSTM', title: 'Bachelor of Science in Tourism Management', category: 'business' },
  // Education & Engineering
  { acronym: 'BSED', title: 'Bachelor of Secondary Education', category: 'education' },
  { acronym: 'BEED', title: 'Bachelor of Elementary Education', category: 'education' },
  { acronym: 'BSCE', title: 'Bachelor of Science in Civil Engineering', category: 'engineering' },
  { acronym: 'BSEE', title: 'Bachelor of Science in Electrical Engineering', category: 'engineering' },
  { acronym: 'BSME', title: 'Bachelor of Science in Mechanical Engineering', category: 'engineering' },
  { acronym: 'BSCRIM', title: 'Bachelor of Science in Criminology', category: 'other' },
  // Senior High Tracks
  { acronym: 'SHS-ICT', title: 'Senior High School - TVL (ICT Track)', category: 'shs' },
  { acronym: 'SHS-STEM', title: 'Senior High School - STEM Strand', category: 'shs' },
  { acronym: 'SHS-ABM', title: 'Senior High School - ABM Strand', category: 'shs' },
  { acronym: 'SHS-HUMSS', title: 'Senior High School - HUMSS Strand', category: 'shs' },
  { acronym: 'TESDA', title: 'TESDA Computer Systems Servicing NC II', category: 'vocational' },
];

export const HONORS_PRESETS = [
  "Dean's Lister",
  "President's Lister",
  "Magna Cum Laude",
  "Cum Laude",
  "Academic Scholar",
  "Student Council Officer",
  "Best Capstone Project",
  "Leadership Awardee",
];

export const GPA_PRESETS = ['1.00', '1.25', '1.50', '1.75', '2.00'];

export const ROLE_SUGGESTIONS_BY_TYPE = {
  'OJT': [
    'Software Engineer Intern',
    'Web Developer Trainee',
    'IT Support Intern',
    'QA Tester Intern',
    'Network Admin Assistant',
    'UI/UX Design Intern',
    'Database Admin Trainee',
    'Administrative / Tech Assistant',
  ],
  'Freelance': [
    'Freelance Web Developer',
    'Frontend Developer',
    'WordPress Specialist',
    'Graphic Designer',
    'Virtual Assistant',
    'Content Creator / Video Editor',
  ],
  'Volunteer': [
    'Student Org President / Officer',
    'Tech Event Coordinator',
    'Peer Tutor',
    'Campus IT Volunteer',
    'Hackathon Lead / Organizer',
  ],
  'Full-time': [
    'Junior Full-Stack Developer',
    'Junior Web Developer',
    'Technical Support Specialist',
    'System Administrator',
    'Junior QA Engineer',
    'Data Analyst',
    'Network Support Engineer',
  ],
  'Part-time': [
    'Part-time Web Developer',
    'Technical Support Representative',
    'IT Lab Assistant',
    'Data Entry Specialist',
    'Computer Technician',
  ],
};

export const PARTNER_COMPANIES_FALLBACK = [
  { name: 'Ubiquity Global Services', location: 'Bacolod City' },
  { name: 'Concentrix', location: 'Bacolod City' },
  { name: 'Teleperformance', location: 'Bacolod City' },
  { name: 'Arbisoft Philippines', location: 'Bacolod City' },
  { name: 'CHMSU Management Information Systems Office', location: 'Talisay City' },
  { name: 'Provincial IT Center - Negros Occidental', location: 'Bacolod City' },
  { name: 'Panasiatic Solutions', location: 'Bacolod City' },
  { name: 'Bacolod City Government - IT Dept', location: 'Bacolod City' },
  { name: 'Teletech / TTEC', location: 'Bacolod City' },
];

export const BULLET_STARTERS = {
  general: [
    'Assisted in developing and maintaining software applications and web pages.',
    'Diagnosed and resolved hardware, software, and local network issues.',
    'Collaborated with team leads on debugging, code reviews, and Git version control.',
    'Completed required training hours with high performance evaluations.',
    'Participated actively in daily standups and agile sprint reviews.',
    'Built responsive user interface components using modern web technologies.',
    'Assisted end-users with technical support tickets and documented solutions.',
    'Designed and implemented database schemas, queries, and RESTful APIs.',
  ],
  it_support: [
    'Diagnosed and resolved hardware, software, and local network issues.',
    'Configured workstations, OS installations, and network peripherals.',
    'Assisted end-users with technical support tickets and documented solutions.',
    'Monitored server health and assisted in routine system backups.',
  ],
  developer: [
    'Assisted in building responsive web pages and reusable UI components.',
    'Collaborated with team leads on debugging, code reviews, and Git version control.',
    'Integrated RESTful APIs and optimized database queries.',
    'Conducted unit testing and documented software release notes.',
  ],
  ojt: [
    'Completed required OJT industry practicum hours with outstanding evaluations.',
    'Applied theoretical knowledge to real-world production systems and workflows.',
    'Participated in daily standups, team meetings, and task retrospectives.',
    'Received mentorship from senior industry professionals and engineers.',
  ],
};

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Parses freeform date strings (e.g. "Jan 2024", "2024", "January 2024", "01/2024")
 * into normalized { month, year }.
 */
export function parseMonthYear(str) {
  if (!str || typeof str !== 'string') return { month: '', year: '' };
  const s = str.trim();
  if (!s || s.toLowerCase() === 'present') return { month: '', year: '' };

  const currentYear = new Date().getFullYear();

  // Check 4-digit year
  const yearMatch = s.match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? yearMatch[1] : '';

  // Check month name or abbreviation
  for (let i = 0; i < MONTHS.length; i++) {
    const m = MONTHS[i];
    const regex = new RegExp(`\\b${m}`, 'i');
    if (regex.test(s)) {
      return { month: m, year: year || String(currentYear) };
    }
  }

  // Check numeric month mm/yyyy
  const numMatch = s.match(/^(\d{1,2})[\/\-](\d{2,4})$/);
  if (numMatch) {
    const mIdx = parseInt(numMatch[1], 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      let y = numMatch[2];
      if (y.length === 2) y = '20' + y;
      return { month: MONTHS[mIdx], year: y };
    }
  }

  return { month: '', year: year || '' };
}

/**
 * Formats month and year into standard "Mon YYYY" or "YYYY".
 */
export function formatMonthYear(month, year) {
  const y = String(year || '').trim();
  const m = String(month || '').trim();
  if (m && y) return `${m} ${y}`;
  return y || m || '';
}

/**
 * Calculates human-readable duration between start and end (or present).
 */
export function calcDuration(startMonth, startYear, endMonth, endYear, isCurrent) {
  const sy = parseInt(startYear, 10);
  if (!sy || isNaN(sy)) return '';

  const smIdx = MONTHS.indexOf(startMonth);
  const sm = smIdx >= 0 ? smIdx : 0;

  const now = new Date();
  let ey, em;

  if (isCurrent) {
    ey = now.getFullYear();
    em = now.getMonth();
  } else {
    ey = parseInt(endYear, 10);
    if (!ey || isNaN(ey)) return '';
    const emIdx = MONTHS.indexOf(endMonth);
    em = emIdx >= 0 ? emIdx : 11;
  }

  const totalMonths = (ey - sy) * 12 + (em - sm) + 1;
  if (totalMonths <= 0) return '';

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);

  return parts.length ? `(${parts.join(' ')})` : '';
}

/**
 * Appends a bullet point to textarea content or removes it if already there.
 */
export function toggleBulletInText(currentText, bullet) {
  const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '').trim();
  const lines = (currentText || '').split('\n').map(l => l.trim()).filter(Boolean);
  const targetPattern = new RegExp(`^[•\\-\\*\s]*${cleanBullet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  const existingIdx = lines.findIndex(l => targetPattern.test(l));
  if (existingIdx >= 0) {
    // Remove if already present
    lines.splice(existingIdx, 1);
  } else {
    // Append
    lines.push(`• ${cleanBullet}`);
  }

  return lines.join('\n');
}
