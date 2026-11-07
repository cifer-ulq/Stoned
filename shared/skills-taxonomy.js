/**
 * CHMSU HireMe — Standardized Skills Taxonomy & Client Normalizer
 * Shared single source of truth across Student, Alumni, and Employer portals.
 */

export const SKILL_CATEGORIES = {
  language: {
    key: 'language',
    label: 'Programming Languages',
    shortLabel: 'Languages',
    emoji: '💻',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  framework: {
    key: 'framework',
    label: 'Frameworks & Libraries',
    shortLabel: 'Frameworks',
    emoji: '🧩',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  database: {
    key: 'database',
    label: 'Databases & Storage',
    shortLabel: 'Databases',
    emoji: '🗄️',
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.12)',
  },
  tool: {
    key: 'tool',
    label: 'Developer Tools & Cloud',
    shortLabel: 'Tools',
    emoji: '🔧',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  it_support: {
    key: 'it_support',
    label: 'IT Support & Systems',
    shortLabel: 'IT Support',
    emoji: '🖥️',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  design: {
    key: 'design',
    label: 'Creative & UI/UX Design',
    shortLabel: 'Design',
    emoji: '🎨',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)',
  },
  business_accounting: {
    key: 'business_accounting',
    label: 'Business, Accounting & Finance',
    shortLabel: 'Accounting',
    emoji: '📊',
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.12)',
  },
  marketing_management: {
    key: 'marketing_management',
    label: 'Marketing & Project Management',
    shortLabel: 'Management',
    emoji: '📢',
    color: '#14B8A6',
    bg: 'rgba(20, 184, 166, 0.12)',
  },
  soft_skill: {
    key: 'soft_skill',
    label: 'Professional & Soft Skills',
    shortLabel: 'Soft Skills',
    emoji: '🤝',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.12)',
  },
  other: {
    key: 'other',
    label: 'Specialized & Other',
    shortLabel: 'Other',
    emoji: '✨',
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
