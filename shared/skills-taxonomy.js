/**
 * CHMSU HireMe — Standardized Skills Taxonomy & Client Normalizer
 * Shared single source of truth across Student, Alumni, and Employer portals.
 */

export const SKILL_CATEGORIES = {
  language: {
    key: 'language',
    label: 'Programming Languages',
    shortLabel: 'Languages',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`,
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  framework: {
    key: 'framework',
    label: 'Frameworks & Libraries',
    shortLabel: 'Frameworks',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/></svg>`,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  database: {
    key: 'database',
    label: 'Databases & Storage',
    shortLabel: 'Databases',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.12)',
  },
  tool: {
    key: 'tool',
    label: 'Developer Tools & Cloud',
    shortLabel: 'Tools',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  it_support: {
    key: 'it_support',
    label: 'IT Support & Systems',
    shortLabel: 'IT Support',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  design: {
    key: 'design',
    label: 'Creative & UI/UX Design',
    shortLabel: 'Design',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)',
  },
  business_accounting: {
    key: 'business_accounting',
    label: 'Business, Accounting & Finance',
    shortLabel: 'Accounting',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.12)',
  },
  marketing_management: {
    key: 'marketing_management',
    label: 'Marketing & Project Management',
    shortLabel: 'Management',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
    color: '#14B8A6',
    bg: 'rgba(20, 184, 166, 0.12)',
  },
  soft_skill: {
    key: 'soft_skill',
    label: 'Professional & Soft Skills',
    shortLabel: 'Soft Skills',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>`,
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.12)',
  },
  other: {
    key: 'other',
    label: 'Specialized & Other',
    shortLabel: 'Other',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
    color: '#84CC16',
    bg: 'rgba(132, 204, 22, 0.12)',
  },
};

export const SKILL_TAXONOMY = [
  // ── Languages ──
  { canonical: 'JavaScript', slug: 'javascript', category: 'language', aliases: ['js', 'vanilla js', 'javascript es6', 'ecmascript', 'es6', 'java script'] },
  { canonical: 'TypeScript', slug: 'typescript', category: 'language', aliases: ['ts', 'type script'] },
  { canonical: 'Python', slug: 'python', category: 'language', aliases: ['py', 'python3', 'python 3'] },
  { canonical: 'Java', slug: 'java', category: 'language', aliases: ['core java', 'j2ee', 'j2se', 'java 8', 'java 11', 'java 17'] },
  { canonical: 'PHP', slug: 'php', category: 'language', aliases: ['php8', 'php 8', 'php7', 'php 7'] },
  { canonical: 'C#', slug: 'csharp', category: 'language', aliases: ['c sharp', 'c-sharp', 'cs'] },
  { canonical: 'C++', slug: 'cpp', category: 'language', aliases: ['c plus plus', 'cplusplus'] },
  { canonical: 'C', slug: 'c', category: 'language', aliases: ['c language', 'ansi c'] },
  { canonical: 'HTML', slug: 'html', category: 'language', aliases: ['html5', 'html 5'] },
  { canonical: 'CSS', slug: 'css', category: 'language', aliases: ['css3', 'css 3'] },
  { canonical: 'HTML/CSS', slug: 'html-css', category: 'language', aliases: ['html and css', 'html & css', 'html/css3'] },
  { canonical: 'SQL', slug: 'sql', category: 'language', aliases: ['pl/sql', 't-sql', 'plsql'] },
  { canonical: 'Dart', slug: 'dart', category: 'language', aliases: ['dartlang'] },
  { canonical: 'Kotlin', slug: 'kotlin', category: 'language', aliases: ['kt'] },
  { canonical: 'Swift', slug: 'swift', category: 'language', aliases: ['swiftui'] },
  { canonical: 'R', slug: 'r', category: 'language', aliases: ['r programming'] },
  { canonical: 'Bash / Shell', slug: 'bash', category: 'language', aliases: ['bash', 'shell', 'shell scripting', 'sh', 'powershell'] },
  { canonical: 'Go', slug: 'golang', category: 'language', aliases: ['go', 'golang'] },
  { canonical: 'Rust', slug: 'rust', category: 'language', aliases: ['rustlang'] },
  { canonical: 'Ruby', slug: 'ruby', category: 'language', aliases: ['rubylang'] },

  // ── Frameworks & Libraries ──
  { canonical: 'React', slug: 'react', category: 'framework', aliases: ['react.js', 'reactjs', 'react js'] },
  { canonical: 'Vue.js', slug: 'vue', category: 'framework', aliases: ['vue', 'vuejs', 'vue js', 'vue 3'] },
  { canonical: 'Angular', slug: 'angular', category: 'framework', aliases: ['angularjs', 'angular.js', 'angular 2+'] },
  { canonical: 'Next.js', slug: 'nextjs', category: 'framework', aliases: ['next', 'next.js', 'nextjs', 'next js'] },
  { canonical: 'Nuxt.js', slug: 'nuxtjs', category: 'framework', aliases: ['nuxt', 'nuxt.js', 'nuxtjs'] },
  { canonical: 'Svelte', slug: 'svelte', category: 'framework', aliases: ['sveltejs', 'svelte.js', 'sveltekit'] },
  { canonical: 'Laravel', slug: 'laravel', category: 'framework', aliases: ['laravel framework', 'laravel 11', 'laravel 12'] },
  { canonical: 'Node.js', slug: 'nodejs', category: 'framework', aliases: ['node', 'node.js', 'nodejs', 'node js'] },
  { canonical: 'Express.js', slug: 'express', category: 'framework', aliases: ['express', 'express.js', 'expressjs'] },
  { canonical: 'Django', slug: 'django', category: 'framework', aliases: ['django rest framework', 'drf'] },
  { canonical: 'Flask', slug: 'flask', category: 'framework', aliases: ['flask python'] },
  { canonical: 'FastAPI', slug: 'fastapi', category: 'framework', aliases: ['fast api'] },
  { canonical: 'Spring Boot', slug: 'spring-boot', category: 'framework', aliases: ['spring', 'springboot', 'spring boot java'] },
  { canonical: 'ASP.NET Core', slug: 'aspnet-core', category: 'framework', aliases: ['asp.net', 'asp.net core', 'dotnet', '.net', '.net core', 'c# .net'] },
  { canonical: 'Flutter', slug: 'flutter', category: 'framework', aliases: ['flutter mobile'] },
  { canonical: 'React Native', slug: 'react-native', category: 'framework', aliases: ['reactnative', 'rn'] },
  { canonical: 'Tailwind CSS', slug: 'tailwind-css', category: 'framework', aliases: ['tailwind', 'tailwindcss'] },
  { canonical: 'Bootstrap', slug: 'bootstrap', category: 'framework', aliases: ['bootstrap 5', 'bootstrap 4'] },
  { canonical: 'SASS/SCSS', slug: 'sass-scss', category: 'framework', aliases: ['sass', 'scss'] },

  // ── Databases ──
  { canonical: 'MySQL', slug: 'mysql', category: 'database', aliases: ['my sql', 'mariadb'] },
  { canonical: 'PostgreSQL', slug: 'postgresql', category: 'database', aliases: ['postgres', 'psql', 'postgres sql'] },
  { canonical: 'MongoDB', slug: 'mongodb', category: 'database', aliases: ['mongo', 'nosql mongodb'] },
  { canonical: 'SQLite', slug: 'sqlite', category: 'database', aliases: ['sqlite3'] },
  { canonical: 'Redis', slug: 'redis', category: 'database', aliases: ['redis cache'] },
  { canonical: 'Firebase', slug: 'firebase', category: 'database', aliases: ['firestore', 'firebase realtime db'] },
  { canonical: 'Supabase', slug: 'supabase', category: 'database', aliases: ['supabase db'] },
  { canonical: 'Oracle Database', slug: 'oracle-db', category: 'database', aliases: ['oracle', 'oracle db', 'oracle sql'] },
  { canonical: 'Microsoft SQL Server', slug: 'mssql', category: 'database', aliases: ['ms sql', 'mssql', 'sql server'] },

  // ── Tools & Cloud ──
  { canonical: 'Git', slug: 'git', category: 'tool', aliases: ['git version control'] },
  { canonical: 'GitHub', slug: 'github', category: 'tool', aliases: ['gh', 'git hub', 'github actions'] },
  { canonical: 'GitLab', slug: 'gitlab', category: 'tool', aliases: ['git lab'] },
  { canonical: 'Docker', slug: 'docker', category: 'tool', aliases: ['containerization'] },
  { canonical: 'Kubernetes', slug: 'kubernetes', category: 'tool', aliases: ['k8s'] },
  { canonical: 'Linux', slug: 'linux', category: 'tool', aliases: ['ubuntu', 'debian', 'centos'] },
  { canonical: 'AWS', slug: 'aws', category: 'tool', aliases: ['amazon web services', 'ec2', 's3'] },
  { canonical: 'Google Cloud Platform', slug: 'gcp', category: 'tool', aliases: ['google cloud', 'gcp'] },
  { canonical: 'Microsoft Azure', slug: 'azure', category: 'tool', aliases: ['azure', 'ms azure'] },
  { canonical: 'Postman', slug: 'postman', category: 'tool', aliases: ['postman api'] },
  { canonical: 'CI/CD', slug: 'cicd', category: 'tool', aliases: ['jenkins', 'ci cd'] },
  { canonical: 'Jira', slug: 'jira', category: 'tool', aliases: ['jira software'] },

  // ── IT Support & Hardware / Networking ──
  { canonical: 'Technical Support', slug: 'technical-support', category: 'it_support', aliases: ['tech support', 'it support', 'helpdesk', 'it helpdesk', 'desktop support'] },
  { canonical: 'Troubleshooting', slug: 'troubleshooting', category: 'it_support', aliases: ['hardware troubleshooting', 'pc troubleshooting', 'system diagnostics'] },
  { canonical: 'Computer Networking', slug: 'networking', category: 'it_support', aliases: ['network administration', 'lan/wan', 'cisco', 'router configuration', 'network cabling'] },
  { canonical: 'Computer Hardware & Assembly', slug: 'computer-assembly', category: 'it_support', aliases: ['pc assembly', 'hardware assembly', 'computer repair', 'pc repair', 'hardware repair', 'computer hardware'] },
  { canonical: 'System Administration', slug: 'system-admin', category: 'it_support', aliases: ['sysadmin', 'windows server', 'active directory'] },
  { canonical: 'Cybersecurity', slug: 'cybersecurity', category: 'it_support', aliases: ['information security', 'network security', 'infosec'] },

  // ── Design & UI/UX ──
  { canonical: 'UI/UX Design', slug: 'ui-ux-design', category: 'design', aliases: ['ui/ux', 'ui design', 'ux design', 'user interface design', 'ux research', 'wireframing', 'prototyping'] },
  { canonical: 'Figma', slug: 'figma', category: 'design', aliases: ['figma design', 'figma prototyping'] },
  { canonical: 'Canva', slug: 'canva', category: 'design', aliases: ['canva design'] },
  { canonical: 'Adobe Photoshop', slug: 'photoshop', category: 'design', aliases: ['photoshop', 'ps'] },
  { canonical: 'Adobe Illustrator', slug: 'illustrator', category: 'design', aliases: ['illustrator', 'ai'] },
  { canonical: 'Graphic Design', slug: 'graphic-design', category: 'design', aliases: ['digital arts', 'visual design'] },
  { canonical: 'Video Editing', slug: 'video-editing', category: 'design', aliases: ['premiere pro', 'capcut', 'after effects'] },

  // ── Business & Accounting ──
  { canonical: 'Microsoft Excel / Spreadsheets', slug: 'ms-excel', category: 'business_accounting', aliases: ['excel', 'ms excel', 'spreadsheets', 'google sheets', 'pivot tables', 'vlookup'] },
  { canonical: 'Bookkeeping', slug: 'bookkeeping', category: 'business_accounting', aliases: ['book keeping', 'general ledger', 'accounts payable', 'accounts receivable', 'ap/ar'] },
  { canonical: 'Financial Reporting', slug: 'financial-reporting', category: 'business_accounting', aliases: ['financial reports', 'balance sheets'] },
  { canonical: 'Financial Analysis', slug: 'financial-analysis', category: 'business_accounting', aliases: ['financial modeling', 'budgeting'] },
  { canonical: 'Auditing', slug: 'auditing', category: 'business_accounting', aliases: ['internal audit', 'financial audit'] },
  { canonical: 'Payroll Processing', slug: 'payroll', category: 'business_accounting', aliases: ['payroll', 'compensation and benefits'] },
  { canonical: 'Tax Compliance', slug: 'tax-compliance', category: 'business_accounting', aliases: ['taxation', 'bir filing'] },
  { canonical: 'Accounting Software', slug: 'accounting-software', category: 'business_accounting', aliases: ['quickbooks', 'xero', 'sap', 'zoho books'] },

  // ── Marketing & Management ──
  { canonical: 'Project Management', slug: 'project-management', category: 'marketing_management', aliases: ['pm', 'scrum', 'agile', 'scrum master', 'kanban'] },
  { canonical: 'Digital Marketing', slug: 'digital-marketing', category: 'marketing_management', aliases: ['online marketing', 'social media marketing', 'smm', 'facebook ads'] },
  { canonical: 'Content Writing', slug: 'content-writing', category: 'marketing_management', aliases: ['copywriting', 'blog writing', 'technical writing'] },
  { canonical: 'SEO', slug: 'seo', category: 'marketing_management', aliases: ['search engine optimization', 'sem', 'seo/sem'] },
  { canonical: 'Customer Service', slug: 'customer-service', category: 'marketing_management', aliases: ['client relations', 'customer support', 'crm'] },
  { canonical: 'Human Resources & Recruitment', slug: 'human-resources', category: 'marketing_management', aliases: ['hr', 'recruitment', 'talent acquisition'] },

  // ── Professional Soft Skills ──
  { canonical: 'Communication Skills', slug: 'communication', category: 'soft_skill', aliases: ['verbal communication', 'written communication', 'public speaking'] },
  { canonical: 'Problem Solving', slug: 'problem-solving', category: 'soft_skill', aliases: ['analytical thinking', 'critical thinking'] },
  { canonical: 'Teamwork & Collaboration', slug: 'teamwork', category: 'soft_skill', aliases: ['teamwork', 'collaboration', 'team player'] },
  { canonical: 'Time Management', slug: 'time-management', category: 'soft_skill', aliases: ['multitasking', 'punctuality'] },
  { canonical: 'Leadership', slug: 'leadership', category: 'soft_skill', aliases: ['team leadership', 'people management'] },

  // ── Specialized Domains ──
  { canonical: 'REST API', slug: 'rest-api', category: 'other', aliases: ['rest', 'restful api', 'api integration', 'api development'] },
  { canonical: 'GraphQL', slug: 'graphql', category: 'other', aliases: ['graphql api'] },
  { canonical: 'Machine Learning', slug: 'machine-learning', category: 'other', aliases: ['ml', 'ai', 'artificial intelligence', 'data science', 'deep learning'] },
  { canonical: 'Data Analysis', slug: 'data-analysis', category: 'other', aliases: ['data analytics', 'power bi', 'tableau', 'pandas', 'data visualization'] },
  { canonical: 'DevOps', slug: 'devops', category: 'other', aliases: ['cloud infrastructure', 'sre'] },
  { canonical: 'QA & Software Testing', slug: 'qa-testing', category: 'other', aliases: ['qa', 'software testing', 'manual testing', 'automated testing', 'selenium', 'cypress'] },
];

// Pre-indexed lookup map for O(1) alias resolution
const _lookupMap = new Map();
SKILL_TAXONOMY.forEach(item => {
  _lookupMap.set(item.canonical.toLowerCase().trim(), item);
  _lookupMap.set(item.slug.toLowerCase().trim(), item);
  (item.aliases || []).forEach(alias => {
    _lookupMap.set(alias.toLowerCase().trim(), item);
  });
});

/**
 * Resolve any raw input string to its canonical representation.
 */
export function normalizeSkill(raw) {
  if (!raw || typeof raw !== 'string') {
    return { canonical: '', slug: '', category: 'other', isStandard: false };
  }
  const clean = raw.trim();
  const lower = clean.toLowerCase();

  // 1. Exact alias match
  if (_lookupMap.has(lower)) {
    const item = _lookupMap.get(lower);
    return {
      canonical: item.canonical,
      slug: item.slug,
      category: item.category,
      isStandard: true,
    };
  }

  // 2. Stripped punctuation match
  const stripped = lower.replace(/[^a-z0-9+#]/g, '');
  if (_lookupMap.has(stripped)) {
    const item = _lookupMap.get(stripped);
    return {
      canonical: item.canonical,
      slug: item.slug,
      category: item.category,
      isStandard: true,
    };
  }

  // 3. Fallback title-cased custom skill
  const canonical = clean.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
  const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return {
    canonical,
    slug: slug || 'custom',
    category: 'other',
    isStandard: false,
  };
}

/**
 * Autocomplete search across canonical skills and aliases.
 */
export function searchSkills(query, category = null, limit = 25) {
  const q = (query || '').toLowerCase().trim();
  const results = [];

  for (const item of SKILL_TAXONOMY) {
    if (category && category !== 'all' && item.category !== category) {
      continue;
    }

    let isMatch = false;
    let matchedAlias = null;

    if (!q) {
      isMatch = true;
    } else {
      if (item.canonical.toLowerCase().includes(q)) {
        isMatch = true;
      } else {
        for (const alias of item.aliases) {
          if (alias.toLowerCase().includes(q)) {
            isMatch = true;
            matchedAlias = alias;
            break;
          }
        }
      }
    }

    if (isMatch) {
      results.push({
        canonical: item.canonical,
        slug: item.slug,
        category: item.category,
        matchedAlias,
      });

      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

/**
 * Group skills by category for chip grids.
 */
export function getSkillsGroupedByCategory() {
  const grouped = {};
  Object.keys(SKILL_CATEGORIES).forEach(k => {
    grouped[k] = [];
  });

  SKILL_TAXONOMY.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item.canonical);
  });

  return grouped;
}
