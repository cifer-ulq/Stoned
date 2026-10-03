/**
 * CHMSU HireMe — Post / Edit Job Page (Dynamic Wizard v2)
 * Multi-step form: Step 1 → Step 2 → Step 3 → Review & Submit
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiPut } from '../api/client.js';
import { navigate } from '../router.js';
import { getState } from '../store.js';
import { openMoaRequestModal } from '../components/moa-modal.js';

/* ── Preset data ─────────────────────────────────────────── */
const EMPLOYMENT_TYPES = [
  { value: 'Full-time',  label: 'Full-time',  ico: 'briefcase',  desc: 'Regular 40h/week' },
  { value: 'Part-time',  label: 'Part-time',  ico: 'clock',      desc: 'Less than 40h/week' },
  { value: 'Contract',   label: 'Contract',   ico: 'fileText',   desc: 'Fixed-term contract' },
  { value: 'Freelance',  label: 'Freelance',  ico: 'zap',        desc: 'Project-based' },
  { value: 'Remote',     label: 'Remote',     ico: 'globe',      desc: 'Work from anywhere' },
];

/* Department categories: each has an icon, a colour class, and a list of sub-departments */
const DEPT_CATEGORIES = [
  {
    group: 'Technology',
    ico: 'zap',
    color: 'blue',
    items: ['Engineering','Software Development','DevOps','QA / Testing','Data Science','AI / Machine Learning','Cybersecurity','IT Support','Cloud Infrastructure'],
  },
  {
    group: 'Design & Product',
    ico: 'layers',
    color: 'purple',
    items: ['UI / UX Design','Graphic Design','Product Management','Brand Design','Motion Design'],
  },
  {
    group: 'Business & Sales',
    ico: 'trendingUp',
    color: 'green',
    items: ['Sales','Business Development','Account Management','Partnerships','Customer Success'],
  },
  {
    group: 'Marketing',
    ico: 'target',
    color: 'orange',
    items: ['Digital Marketing','Content Marketing','SEO / SEM','Social Media','Email Marketing','Growth / Performance'],
  },
  {
    group: 'Operations',
    ico: 'settings',
    color: 'gray',
    items: ['Operations','Supply Chain','Logistics','Project Management','Process Improvement'],
  },
  {
    group: 'Finance & Legal',
    ico: 'dollarSign',
    color: 'teal',
    items: ['Finance','Accounting','Audit','Legal / Compliance','Risk Management'],
  },
  {
    group: 'People & Culture',
    ico: 'users',
    color: 'pink',
    items: ['Human Resources','Talent Acquisition','Learning & Development','Payroll','Employee Relations'],
  },
  {
    group: 'Customer Experience',
    ico: 'messageSquare',
    color: 'cyan',
    items: ['Customer Support','Technical Support','Community Management','Client Relations'],
  },
];

/* Flat list derived from DEPT_CATEGORIES (used for autocomplete search) */
const DEPARTMENTS_FLAT = DEPT_CATEGORIES.flatMap(c => c.items);

const PH_CITIES = [
  'Bacolod City','Cebu City','Davao City','Manila','Quezon City',
  'Makati City','Taguig City','Pasig City','Iloilo City','Cagayan de Oro',
  'Zamboanga City','General Santos City','Remote / Work from Home',
];

/* Categorised skill library */
const SKILL_CATEGORIES = [
  {
    label: 'Front End',
    ico: 'globe',
    skills: ['HTML','CSS','JavaScript','TypeScript','React','Vue.js','Angular','Next.js','Nuxt.js','Svelte','Tailwind CSS','Bootstrap','SASS/SCSS','Webpack','Vite','jQuery'],
  },
  {
    label: 'Back End',
    ico: 'zap',
    skills: ['Node.js','Express.js','Python','Django','Flask','FastAPI','Java','Spring Boot','PHP','Laravel','Ruby on Rails','Go','Rust','C#','.NET','REST API','GraphQL','gRPC'],
  },
  {
    label: 'Mobile',
    ico: 'phone',
    skills: ['React Native','Flutter','Swift','Kotlin','Android Development','iOS Development','Ionic','Xamarin'],
  },
  {
    label: 'Database',
    ico: 'layers',
    skills: ['MySQL','PostgreSQL','SQLite','MongoDB','Redis','Firebase','Supabase','Oracle DB','Microsoft SQL Server','Elasticsearch','DynamoDB'],
  },
  {
    label: 'Cloud & DevOps',
    ico: 'settings',
    skills: ['AWS','Google Cloud','Azure','Docker','Kubernetes','CI/CD','Terraform','Ansible','Linux','Nginx','Jenkins','GitHub Actions'],
  },
  {
    label: 'Data & AI',
    ico: 'barChart',
    skills: ['Python','R','Pandas','NumPy','TensorFlow','PyTorch','Scikit-learn','Data Visualization','Tableau','Power BI','SQL','Machine Learning','Deep Learning','NLP','Computer Vision'],
  },
  {
    label: 'Design & Creative',
    ico: 'target',
    skills: ['Figma','Adobe XD','Photoshop','Illustrator','InDesign','Sketch','Canva','After Effects','Premiere Pro','3D Modeling','UI Design','UX Research'],
  },
  {
    label: 'Business & Management',
    ico: 'briefcase',
    skills: ['Project Management','Agile / Scrum','Jira','Confluence','Product Management','Business Analysis','Strategic Planning','OKRs','Stakeholder Management','Risk Management'],
  },
  {
    label: 'Marketing & Sales',
    ico: 'trendingUp',
    skills: ['SEO','SEM','Google Ads','Facebook Ads','Content Writing','Copywriting','Email Marketing','HubSpot','Salesforce','Social Media Marketing','Branding','Market Research','CRM'],
  },
  {
    label: 'Soft Skills',
    ico: 'users',
    skills: ['Communication','Leadership','Teamwork','Problem Solving','Critical Thinking','Time Management','Adaptability','Creativity','Emotional Intelligence','Negotiation','Public Speaking','Mentoring'],
  },
];

/* Flat deduplicated list for autocomplete */
const SKILL_SUGGESTIONS = [...new Set(SKILL_CATEGORIES.flatMap(c => c.skills))];

const BENEFIT_PRESETS = [
  '13th Month Pay','Health Insurance (HMO)','Life Insurance',
  'Paid Vacation Leave','Paid Sick Leave','Performance Bonus',
  'Remote Work Option','Flexible Hours','Internet Allowance',
  'Meal Allowance','Transportation Allowance','Training & Development',
];

const EXPERIENCE_LEVELS = [
  { value: 'Entry Level',    label: 'Entry Level',    ico: 'graduationCap', exp: '0–1 yrs', desc: 'Fresh graduates & starters' },
  { value: 'Junior',         label: 'Junior',         ico: 'user',          exp: '1–3 yrs', desc: 'Early career professionals' },
  { value: 'Mid-Level',      label: 'Mid-Level',      ico: 'award',         exp: '3–5 yrs', desc: 'Independent specialists' },
  { value: 'Senior',         label: 'Senior',         ico: 'star',          exp: '5+ yrs',  desc: 'Deep expertise & mentoring' },
  { value: 'Lead / Manager', label: 'Lead / Manager', ico: 'shield',        exp: '7+ yrs',  desc: 'Technical & team leadership' },
];

const NICHE_PRESETS = {
  software_dev: {
    label: 'Software Development',
    responsibilities: [
      'Design, develop, and maintain clean, scalable, and efficient code',
      'Participate in agile sprints, daily standups, code reviews, and sprint planning',
      'Collaborate with UI/UX designers, product managers, and backend/frontend teams',
      'Troubleshoot, debug, and optimize application performance and system bottlenecks',
      'Write comprehensive unit, integration, and automated end-to-end tests',
      'Design and integrate RESTful APIs and modern database schemas',
      'Document technical architecture, workflow diagrams, and code specifications',
    ],
    requirements: [
      "Bachelor's degree in Computer Science, Information Technology, or equivalent practical experience",
      'Proficiency in modern programming languages and web/mobile frameworks',
      'Hands-on experience with relational or NoSQL databases (MySQL, PostgreSQL, MongoDB)',
      'Solid grasp of version control systems (Git, GitHub, GitLab) and collaborative branching',
      'Understanding of software design patterns, clean code principles, and data structures',
    ],
    recommendedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PHP', 'Laravel', 'Git', 'SQL', 'REST API', 'Docker', 'HTML/CSS'],
    topCategory: 'Front End',
  },
  ai_data: {
    label: 'AI & Data Science',
    responsibilities: [
      'Research, train, evaluate, and fine-tune machine learning models and AI algorithms',
      'Build end-to-end data pipelines for preprocessing, feature engineering, and model inference',
      'Implement generative AI solutions, prompt engineering, and LLM integrations',
      'Collaborate with software engineers to deploy, containerize, and serve models in production',
      'Analyze complex, multi-source datasets to discover actionable patterns and statistical insights',
      'Monitor model drift, latency, resource utilization, and prediction accuracy in production',
      'Document experimental hypotheses, model benchmarks, and mathematical methodologies',
    ],
    requirements: [
      "Degree in Computer Science, Data Science, Artificial Intelligence, Mathematics, or Statistics",
      'Strong programming proficiency in Python and statistical data analysis packages',
      'Experience with deep learning frameworks such as PyTorch, TensorFlow, or Scikit-learn',
      'Familiarity with NLP, LLMs, Computer Vision, or predictive modeling pipelines',
      'Solid foundation in linear algebra, probability, data structures, and database querying (SQL)',
    ],
    recommendedSkills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NLP', 'SQL', 'Pandas', 'NumPy', 'Data Visualization', 'Scikit-learn'],
    topCategory: 'Data & AI',
  },
  design_product: {
    label: 'UI / UX & Product Design',
    responsibilities: [
      'Design intuitive, visually engaging user interfaces for web and mobile platforms',
      'Create user personas, journey maps, wireframes, and interactive prototypes in Figma',
      'Conduct user research, usability testing sessions, and translate insights into design solutions',
      'Maintain, evolve, and document scalable design systems and reusable component libraries',
      'Collaborate with front-end engineers to ensure pixel-perfect design implementation',
      'Advocate for accessibility (WCAG), responsive design ergonomics, and seamless user experiences',
      'Present design concepts and rationale to stakeholders and product leadership',
    ],
    requirements: [
      'Compelling portfolio showcasing UX problem solving, wireframing, and visual UI design skills',
      'Mastery of Figma, interactive prototyping, auto-layout, and design system tokens',
      'Understanding of responsive design principles, mobile UI guidelines, and web accessibility',
      'Strong visual design sense (typography, color theory, spacing, and micro-interactions)',
      'Excellent verbal and written presentation skills to articulate design decisions',
    ],
    recommendedSkills: ['Figma', 'UI Design', 'UX Research', 'Design Systems', 'Wireframing', 'Prototyping', 'Adobe XD', 'User Flows', 'Responsive Design', 'Canva'],
    topCategory: 'Design & Creative',
  },
  devops_cloud: {
    label: 'DevOps & Cloud Infrastructure',
    responsibilities: [
      'Design, build, and optimize automated CI/CD deployment pipelines',
      'Provision, scale, and manage cloud infrastructure using Infrastructure as Code (Terraform)',
      'Manage containerized microservices architectures using Docker and Kubernetes',
      'Implement robust monitoring, logging, and alerting systems (Prometheus, Grafana, CloudWatch)',
      'Enforce cloud security best practices, zero-trust network policies, and regular patch management',
      'Lead incident response, root cause analysis, disaster recovery drills, and uptime optimization',
    ],
    requirements: [
      "Degree in IT, Computer Engineering, or equivalent practical cloud engineering experience",
      'Proven experience managing major cloud providers (AWS, Google Cloud, or Microsoft Azure)',
      'Deep hands-on proficiency with Docker, Kubernetes, Linux administration, and CI/CD tools',
      'Strong scripting ability in Bash, Python, or Go for automated operational tasks',
      'Knowledge of network security, SSL/TLS, reverse proxies (Nginx), and infrastructure scalability',
    ],
    recommendedSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'GitHub Actions', 'Google Cloud', 'Azure', 'Nginx', 'Ansible'],
    topCategory: 'Cloud & DevOps',
  },
  qa_testing: {
    label: 'QA & Software Testing',
    responsibilities: [
      'Develop comprehensive test plans, test cases, and acceptance criteria from feature specs',
      'Execute manual functional, regression, exploratory, and smoke testing across environments',
      'Design and maintain automated end-to-end testing suites using modern automation frameworks',
      'Identify, document, isolate, and track software bugs and anomalies in Jira',
      'Collaborate with developers to reproduce edge-case defects and verify resolved issues',
      'Conduct API testing, load testing, and performance benchmark validations',
    ],
    requirements: [
      'Demonstrated experience in software quality assurance methodologies and life cycle (STLC)',
      'Familiarity with test automation frameworks (Cypress, Playwright, Selenium) or API testing (Postman)',
      'Sharp attention to detail, analytical mindset, and empathy for user workflows',
      'Familiarity with agile methodologies, bug tracking tools, and release cycles',
    ],
    recommendedSkills: ['QA / Testing', 'Cypress', 'Playwright', 'Selenium', 'Postman', 'Manual Testing', 'Automated Testing', 'Jira', 'REST API', 'Bug Tracking'],
    topCategory: 'Cloud & DevOps',
  },
  cybersecurity: {
    label: 'Cybersecurity & Information Security',
    responsibilities: [
      'Monitor networks, endpoints, and cloud workloads for security events and unauthorized intrusion',
      'Conduct vulnerability scans, penetration testing, and security posture assessments',
      'Implement access controls, multi-factor authentication, encryption, and firewall rules',
      'Investigate security alerts, draft incident reports, and lead containment and remediation',
      'Maintain compliance with data privacy regulations (GDPR, DPA) and security frameworks',
      'Conduct cybersecurity awareness training and phishing simulations for internal staff',
    ],
    requirements: [
      "Degree in Cybersecurity, Computer Science, or relevant security certifications (Security+, CEH, CISSP)",
      'Working knowledge of network protocols, firewalls, SIEM tools, and endpoint protection',
      'Experience with vulnerability scanning tools, Linux command line, and threat analysis',
      'Strong analytical and investigative mindset with high ethical standards',
    ],
    recommendedSkills: ['Cybersecurity', 'Linux', 'Network Security', 'Penetration Testing', 'SIEM', 'Firewalls', 'Incident Response', 'Vulnerability Assessment', 'Data Privacy'],
    topCategory: 'Cloud & DevOps',
  },
  marketing: {
    label: 'Digital Marketing & Growth',
    responsibilities: [
      'Plan, launch, and manage multi-channel digital marketing campaigns across organic and paid media',
      'Conduct keyword research, on-page optimization, backlink outreach, and technical SEO audits',
      'Write compelling marketing copy, blog posts, email newsletters, and landing page content',
      'Track, analyze, and report campaign KPIs, traffic acquisition, and conversion rates',
      'Manage paid social and search advertising budgets (Meta Ads, Google Ads) to maximize ROAS',
      'Execute A/B tests on creative assets, headlines, and call-to-actions to optimize conversion funnels',
    ],
    requirements: [
      "Degree in Marketing, Communications, Business, or proven digital marketing portfolio",
      'Hands-on experience with Google Analytics, Google Search Console, and Meta Ads Manager',
      'Strong copywriting skills and creative eye for brand storytelling',
      'Familiarity with email automation tools (Mailchimp, HubSpot) and SEO suites (Ahrefs, SEMrush)',
      'Data-driven mindset with ability to interpret analytics into actionable marketing experiments',
    ],
    recommendedSkills: ['Digital Marketing', 'SEO', 'SEM', 'Google Ads', 'Content Writing', 'Social Media Marketing', 'Email Marketing', 'Copywriting', 'Google Analytics', 'HubSpot'],
    topCategory: 'Marketing & Sales',
  },
  sales: {
    label: 'Sales & Business Development',
    responsibilities: [
      'Proactively identify, prospect, and qualify potential B2B/B2C leads and business opportunities',
      'Conduct product demonstrations, discovery calls, and consultative sales presentations',
      'Draft sales proposals, negotiate commercial agreements, and close new business contracts',
      'Manage customer pipeline, deal stages, and revenue forecasting in CRM systems',
      'Build long-term relationships with key decision-makers to encourage repeat business and referrals',
      'Collaborate with marketing and customer success teams to align messaging and onboarding',
    ],
    requirements: [
      'Proven track record of meeting or exceeding sales quotas and business development targets',
      'Outstanding interpersonal, verbal negotiation, and objection-handling capabilities',
      'Proficiency in CRM platforms (Salesforce, HubSpot) and outbound communication tools',
      'Self-driven, resilient attitude with high professional ambition and discipline',
    ],
    recommendedSkills: ['Sales', 'Business Development', 'CRM', 'Lead Generation', 'Negotiation', 'HubSpot', 'Salesforce', 'Account Management', 'Client Relations'],
    topCategory: 'Marketing & Sales',
  },
  finance: {
    label: 'Finance & Accounting',
    responsibilities: [
      'Maintain general ledger accounts, verify journal entries, and reconcile bank accounts',
      'Prepare monthly, quarterly, and annual balance sheets, income statements, and cash flow reports',
      'Manage accounts payable (AP), accounts receivable (AR), invoices, and payment disbursements',
      'Compute and prepare corporate tax returns in strict compliance with national tax statutory rules',
      'Assist in annual financial budget planning, cost analysis, and variance reporting',
      'Coordinate with external auditors and regulatory bodies during annual audit procedures',
    ],
    requirements: [
      "Bachelor's degree in Accountancy, Finance, or related business discipline (CPA preferred)",
      'Proficiency in accounting software (QuickBooks, Xero, SAP, NetSuite) and advanced Excel formulas',
      'Thorough knowledge of accounting standards (GAAP/IFRS) and statutory tax regulations',
      'High level of accuracy, confidentiality, numerical proficiency, and organizational discipline',
    ],
    recommendedSkills: ['Accounting', 'Finance', 'Financial Analysis', 'QuickBooks', 'Excel', 'Taxation', 'Audit', 'Bookkeeping', 'Financial Reporting', 'Budgeting'],
    topCategory: 'Business & Management',
  },
  hr: {
    label: 'Human Resources & Talent Acquisition',
    responsibilities: [
      'Manage full-cycle talent acquisition: posting jobs, screening resumes, interviewing, and offers',
      'Coordinate structured employee onboarding, orientation, and training programs',
      'Administer employee benefits, health insurance, leave credits, and monthly payroll processing',
      'Address employee inquiries, mediate interpersonal grievances, and foster positive workplace culture',
      'Ensure organizational adherence to labor standards, statutory filings, and company policies',
      'Organize company engagement activities, wellness initiatives, and performance appraisal cycles',
    ],
    requirements: [
      "Degree in Human Resource Management, Psychology, Business Administration, or related field",
      'Working understanding of labor laws, statutory employment benefits, and HR best practices',
      'Strong interpersonal empathy, discretion, and conflict-resolution abilities',
      'Familiarity with HR information systems (HRIS) and applicant tracking software (ATS)',
    ],
    recommendedSkills: ['Human Resources', 'Talent Acquisition', 'Recruiting', 'Payroll', 'Employee Relations', 'Onboarding', 'Labor Laws', 'HRIS', 'Performance Management'],
    topCategory: 'Soft Skills',
  },
  customer_support: {
    label: 'Customer Support & Experience',
    responsibilities: [
      'Deliver empathetic, prompt, and accurate customer support via live chat, email, and tickets',
      'Diagnose and troubleshoot user issues, account inquiries, and service problems systematically',
      'Escalate unresolved software bugs or critical service interruptions to tier-2 and engineering teams',
      'Author and update self-service knowledge base articles, user guides, and FAQs',
      'Maintain stellar customer satisfaction (CSAT) scores and first-contact resolution metrics',
      'Collect and summarize recurring customer feedback to help inform product roadmap improvements',
    ],
    requirements: [
      'Prior experience in customer service, technical support, or client-facing communication roles',
      'Proficiency with ticketing and helpdesk software (Zendesk, Freshdesk, Intercom) and CRM tools',
      'Patient, professional, and composed demeanor under pressure with exceptional active listening',
      'Excellent written English communication skills and rapid typing proficiency',
    ],
    recommendedSkills: ['Customer Support', 'Technical Support', 'Zendesk', 'Intercom', 'Communication', 'Problem Solving', 'Customer Service', 'Helpdesk', 'CRM'],
    topCategory: 'Soft Skills',
  },
  operations_pm: {
    label: 'Operations & Project Management',
    responsibilities: [
      'Coordinate cross-functional project deliverables, milestone schedules, and resource allocations',
      'Facilitate agile ceremonies: daily standups, sprint planning, backlog grooming, and retrospectives',
      'Track project velocity, identify bottlenecks and risks, and implement mitigation actions early',
      'Communicate project health, status updates, and milestone progress to executive stakeholders',
      'Analyze internal operational workflows and implement process improvement initiatives',
      'Manage vendor relationships, procurement requirements, and project documentation repositories',
    ],
    requirements: [
      'Demonstrated experience managing projects or business operations in a fast-paced environment',
      'Proficiency in project management tools (Jira, Asana, Trello, ClickUp) and Agile/Scrum methods',
      'Exceptional organizational skills, leadership presence, and ability to manage multiple priorities',
      'Strong cross-functional stakeholder negotiation and problem-solving capability',
    ],
    recommendedSkills: ['Project Management', 'Agile / Scrum', 'Jira', 'Operations', 'Process Improvement', 'Asana', 'Risk Management', 'Stakeholder Management', 'Strategic Planning'],
    topCategory: 'Business & Management',
  },
  general: {
    label: 'General Professional',
    responsibilities: [
      'Execute core role deliverables with high accuracy, professionalism, and timeliness',
      'Collaborate productively with department peers and cross-functional teams on shared objectives',
      'Communicate progress, bottlenecks, and solutions proactively to leadership and stakeholders',
      'Prepare reports, documentation, presentations, and maintain organized project records',
      'Participate actively in continuous process improvement and team learning initiatives',
    ],
    requirements: [
      "Bachelor's degree or equivalent practical professional qualification in a related discipline",
      'Demonstrated experience performing role duties in a team environment',
      'Strong problem-solving, analytical, and time-management capabilities',
      'Excellent written and verbal communication skills with a collaborative work ethic',
    ],
    recommendedSkills: ['Communication', 'Problem Solving', 'Teamwork', 'Project Management', 'Time Management', 'Microsoft Office', 'Critical Thinking', 'Adaptability', 'Leadership'],
    topCategory: 'Soft Skills',
  }
};

function resolveRoleNiche(department, title) {
  const combined = `${department || ''} ${title || ''}`.toLowerCase();

  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('data science') || combined.includes('deep learning') || combined.includes('nlp')) {
    return 'ai_data';
  }
  if (combined.includes('software') || combined.includes('engineer') || combined.includes('developer') || combined.includes('full stack') || combined.includes('frontend') || combined.includes('backend') || combined.includes('web dev') || combined.includes('programmer') || combined.includes('tech')) {
    return 'software_dev';
  }
  if (combined.includes('ui') || combined.includes('ux') || combined.includes('product design') || combined.includes('graphic') || combined.includes('brand design') || combined.includes('motion') || combined.includes('visual designer') || combined.includes('creative')) {
    return 'design_product';
  }
  if (combined.includes('devops') || combined.includes('cloud') || combined.includes('infrastructure') || combined.includes('sysadmin') || combined.includes('sre')) {
    return 'devops_cloud';
  }
  if (combined.includes('qa') || combined.includes('test') || combined.includes('quality assurance')) {
    return 'qa_testing';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('infosec')) {
    return 'cybersecurity';
  }
  if (combined.includes('marketing') || combined.includes('seo') || combined.includes('sem') || combined.includes('social media') || combined.includes('content') || combined.includes('copywriter') || combined.includes('growth')) {
    return 'marketing';
  }
  if (combined.includes('sales') || combined.includes('business development') || combined.includes('account management') || combined.includes('partnerships')) {
    return 'sales';
  }
  if (combined.includes('finance') || combined.includes('accounting') || combined.includes('accountant') || combined.includes('audit') || combined.includes('tax') || combined.includes('bookkeeper') || combined.includes('payroll')) {
    return 'finance';
  }
  if (combined.includes('hr') || combined.includes('human resources') || combined.includes('talent') || combined.includes('recruiter') || combined.includes('people')) {
    return 'hr';
  }
  if (combined.includes('customer support') || combined.includes('technical support') || combined.includes('helpdesk') || combined.includes('client relations') || combined.includes('customer service') || combined.includes('customer success')) {
    return 'customer_support';
  }
  if (combined.includes('project management') || combined.includes('scrum') || combined.includes('product manager') || combined.includes('operations') || combined.includes('logistics') || combined.includes('supply chain')) {
    return 'operations_pm';
  }

  return 'general';
}

function getDynamicPresets(department, title, experienceLevel) {
  const nicheKey = resolveRoleNiche(department, title);
  const niche = NICHE_PRESETS[nicheKey] || NICHE_PRESETS.general;

  // Base responsibilities
  const responsibilities = [...niche.responsibilities];

  // Modify responsibilities based on experience level
  if (experienceLevel === 'Entry Level') {
    responsibilities.unshift('Learn team standards and receive hands-on guidance on core responsibilities');
  } else if (experienceLevel === 'Senior') {
    responsibilities.unshift('Architect high-level solutions, review peer deliverables, and mentor team members');
  } else if (experienceLevel === 'Lead / Manager') {
    responsibilities.unshift('Lead the team technical and operational roadmap, mentor staff, and drive strategic outcomes');
    responsibilities.push('Conduct performance evaluations and participate in hiring and team scaling');
  }

  // Experience level requirement modifier
  const expMap = {
    'Entry Level': [
      '0–1 years of relevant experience or completed internship; fresh graduates are welcome',
      'High eagerness to learn, receptive to constructive feedback, and strong foundational knowledge',
    ],
    'Junior': [
      '1–2 years of practical hands-on experience in a professional or team environment',
      'Proven ability to take ownership of assigned tasks and deliver on schedule',
    ],
    'Mid-Level': [
      '3–5 years of proven professional experience delivering successful projects',
      'Demonstrated ability to work independently with minimal supervision and solve complex challenges',
    ],
    'Senior': [
      '5+ years of extensive production experience with deep mastery in the domain',
      'Proven track record of technical/architectural leadership and mentoring junior colleagues',
    ],
    'Lead / Manager': [
      '7+ years of experience including 2+ years in a lead, supervisory, or managerial capacity',
      'Demonstrated experience guiding cross-functional teams and aligning deliverables with business goals',
    ],
  };

  const expItems = expMap[experienceLevel] || expMap['Mid-Level'];
  const requirements = [...expItems, ...niche.requirements];

  return {
    nicheLabel: department ? department : niche.label,
    responsibilities,
    requirements,
    recommendedSkills: niche.recommendedSkills,
    topCategory: niche.topCategory,
  };
}

/* ── State ─────────────────────────────────────────────────── */
let state = {};
let currentStep = 1;
const TOTAL_STEPS = 3;

function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function resetState(editJob) {
  const v = editJob;
  const isNegotiable = String(v?.salary || v?.salary_range || '').toLowerCase().includes('negotiable');

  state = {
    title:            v?.title            || '',
    department:       v?.department       || '',
    location:         v?.location         || '',
    employment_type:  v?.type             || v?.employment_type || 'Full-time',
    experience_level: v?.experience_level || 'Mid-Level',
    salary_min:       parseSalaryMin(v?.salary || v?.salary_range) || 15000,
    salary_max:       parseSalaryMax(v?.salary || v?.salary_range) || 35000,
    salary_negotiable: isNegotiable,
    description:      v?.description      || '',
    responsibilities: ensureArray(v?.responsibilities),
    requirements:     ensureArray(v?.requirements),
    benefits:         ensureArray(v?.benefits),
    skills:           ensureArray(v?.skills || v?.required_skills),
    expires_at:       v?.expires_at       || '',
    status:           v?.status           || 'open',
  };
}

function parseSalaryMin(str) {
  if (!str) return null;
  const m = String(str).replace(/[,₱\s]/g,'').match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}
function parseSalaryMax(str) {
  if (!str) return null;
  const nums = String(str).replace(/[,₱\s]/g,'').match(/\d+/g);
  return nums && nums.length > 1 ? parseInt(nums[1]) : null;
}

/* ── Main render ────────────────────────────────────────────── */
export async function renderPostJob(container) {
  const editId = new URLSearchParams(window.location.hash.split('?')[1] || '').get('edit');
  let editJob = null;

  const company = getState('company') || {};
  const isCompleted = !!company.profileCompleted;
  const moaStatus = company.moaStatus || 'Pending';
  const isMoaValid = ['active', 'expiring soon'].includes(moaStatus.toLowerCase());
  const canPost = company.canPostOpportunities !== undefined
    ? Boolean(company.canPostOpportunities)
    : (isCompleted && isMoaValid);

  if (!editId && !canPost) {
    container.innerHTML = `
      <div class="fade-in" style="max-width:680px;margin:48px auto;padding:40px 32px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,0.05);text-align:center;">
        <div style="width:68px;height:68px;border-radius:50%;background:rgba(0,89,48,0.09);color:#005930;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
          ${icon('fileText', 32)}
        </div>
        <h2 style="font-size:1.45rem;font-weight:800;color:#0f172a;margin:0 0 10px;">Active MOA Required to Post Job Vacancies</h2>
        <p style="font-size:0.92rem;color:#64748b;line-height:1.6;margin:0 auto 26px;max-width:520px;">
          ${!isCompleted 
            ? 'You must complete your company profile before requesting an MOA partnership and publishing job listings.'
            : (moaStatus === 'Requested'
                ? 'Your MOA request has been submitted to CHMSU CIER and is under review. Job posting will unlock once the university administrator reviews and uploads your signed agreement document.'
                : 'An active Memorandum of Agreement (MOA) between your organization and CHMSU CIER is required before you can publish job listings and recruit applicants.')
          }
        </p>
        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
          <a href="#/" class="btn btn--outline" style="height:42px;padding:0 20px;font-weight:600;">${icon('home', 15)} Dashboard</a>
          ${!isCompleted 
            ? `<a href="#/profile" class="btn btn--primary" style="background:#005930;border-color:#005930;height:42px;padding:0 22px;font-weight:600;gap:8px;">${icon('edit', 15)} Complete Profile</a>`
            : (moaStatus === 'Requested'
                ? `<a href="#/profile" class="btn btn--primary" style="background:#005930;border-color:#005930;height:42px;padding:0 22px;font-weight:600;gap:8px;">${icon('fileText', 15)} View MOA Status</a>`
                : `<button type="button" class="btn btn--primary" id="btn-pj-request-moa" style="background:#005930;border-color:#005930;height:42px;padding:0 22px;font-weight:600;gap:8px;">${icon('send', 15)} Request MOA with CIER</button>`)
          }
        </div>
      </div>
    `;

    container.querySelector('#btn-pj-request-moa')?.addEventListener('click', () => {
      openMoaRequestModal({
        onSuccess: () => {
          renderPostJob(container);
        }
      });
    });

    return;
  }

  if (editId) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 20px;gap:14px;">
        <div class="skeleton" style="width:48px;height:48px;border-radius:12px;"></div>
        <p style="color:var(--text-secondary);font-size:0.95rem;font-weight:500;">Loading job details...</p>
      </div>
    `;
    try {
      const res = await apiGet('/company/jobs');
      if (res?.success && Array.isArray(res.data)) {
        editJob = res.data.find(j => String(j.id) === editId) || null;
      }
    } catch (err) {
      console.error('Failed to load job for edit:', err);
    }
  }

  currentStep = 1;
  resetState(editJob);
  renderWizard(container, editId, editJob);
}

/* ── Wizard shell ────────────────────────────────────────────── */
function renderWizard(container, editId, editJob) {
  container.innerHTML = `
    <div class="pj-wizard fade-in">
      <!-- Header -->
      <div class="pj-wizard__header">
        <button class="btn btn--outline btn--sm pj-back-btn" id="pj-btn-back">
          ${icon('chevronLeft', 16)} Back
        </button>
        <div class="pj-wizard__title">
          ${icon('briefcase', 20)}
          <span>${editJob ? 'Edit Job Posting' : 'Post a New Job'}</span>
        </div>
        <div></div>
      </div>

      <!-- Progress -->
      <div class="pj-progress">
        ${renderStepIndicators()}
      </div>

      <!-- Step content -->
      <div class="pj-step-wrap" id="pj-step-wrap"></div>

      <!-- Nav buttons -->
      <div class="pj-wizard__footer" id="pj-footer">
        <button class="btn btn--outline pj-btn-prev" id="pj-btn-prev" style="display:none;">
          ${icon('chevronLeft', 16)} Previous
        </button>
        <div style="flex:1"></div>
        <button class="btn btn--primary pj-btn-next" id="pj-btn-next">
          Next Step ${icon('chevronRight', 16)}
        </button>
      </div>

      <p id="pj-form-error" class="pj-form-error"></p>
    </div>
  `;

  container.querySelector('#pj-btn-back').addEventListener('click', () => navigate('/jobs'));
  renderCurrentStep(container, editId, editJob);
  bindFooterNav(container, editId, editJob);
}

function renderStepIndicators() {
  const steps = [
    { n: 1, label: 'Basic Info' },
    { n: 2, label: 'Details' },
    { n: 3, label: 'Requirements' },
  ];
  return `
    <div class="pj-steps">
      ${steps.map(s => `
        <div class="pj-step ${s.n === currentStep ? 'pj-step--active' : ''} ${s.n < currentStep ? 'pj-step--done' : ''}">
          <div class="pj-step__circle">
            ${s.n < currentStep ? icon('checkCircle', 14) : s.n}
          </div>
          <span class="pj-step__label">${s.label}</span>
        </div>
        ${s.n < steps.length ? '<div class="pj-step__line ' + (s.n < currentStep ? 'pj-step__line--done' : '') + '"></div>' : ''}
      `).join('')}
    </div>
    <div class="pj-progress-bar">
      <div class="pj-progress-bar__fill" style="width:${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%"></div>
    </div>
  `;
}

function updateProgress(container) {
  container.querySelector('.pj-progress').innerHTML = renderStepIndicators();
}

/* ── Step rendering ──────────────────────────────────────────── */
function renderCurrentStep(container, editId, editJob) {
  const wrap = container.querySelector('#pj-step-wrap');
  wrap.innerHTML = '';
  wrap.classList.remove('pj-slide-in');
  // Trigger animation
  requestAnimationFrame(() => {
    if (currentStep === 1)      renderStep1(wrap);
    else if (currentStep === 2) renderStep2(wrap);
    else if (currentStep === 3) renderStep3(wrap);
    wrap.classList.add('pj-slide-in');
  });

  // Footer buttons
  const prevBtn = container.querySelector('#pj-btn-prev');
  const nextBtn = container.querySelector('#pj-btn-next');
  prevBtn.style.display = currentStep > 1 ? '' : 'none';

  if (currentStep === TOTAL_STEPS) {
    nextBtn.innerHTML = `${icon('checkCircle', 16)} ${editJob ? 'Save Changes' : 'Publish Job'}`;
    nextBtn.className = 'btn btn--primary pj-btn-next';
  } else {
    nextBtn.innerHTML = `Next Step ${icon('chevronRight', 16)}`;
    nextBtn.className = 'btn btn--primary pj-btn-next';
  }

  updateProgress(container);
}

/* ───────────────────────────────────────────────────────────── */
/*  STEP 1 – Basic Info                                         */
/* ───────────────────────────────────────────────────────────── */
function renderStep1(wrap) {
  wrap.innerHTML = `
    <div class="pj-card">
      <div class="pj-card__label">
        ${icon('briefcase', 16)} Step 1 — Basic Information
      </div>

      <!-- Job Title -->
      <div class="form-group">
        <label class="form-label pj-req">Job Title</label>
        <input type="text" class="form-input" id="pj-title"
               placeholder="e.g. Senior Frontend Developer"
               value="${escHtml(state.title)}" maxlength="120" />
        <div class="pj-char-row">
          <span class="pj-field-err" id="err-title"></span>
          <span class="pj-char-count" id="cc-title">${state.title.length}/120</span>
        </div>
      </div>

      <!-- Department -->
      <div class="form-group">
        <label class="form-label">Department</label>
        <div class="pj-dept-picker" id="pj-dept-picker">
          ${renderDeptPicker()}
        </div>
      </div>

      <!-- Experience Level tiles -->
      <div class="form-group">
        <label class="form-label pj-req">Experience Level</label>
        <span class="form-hint">Specifies role seniority and tailors requirements &amp; responsibilities in Step 3.</span>
        <div class="pj-exp-grid" id="pj-exp-grid">
          ${EXPERIENCE_LEVELS.map(exp => `
            <button type="button"
              class="pj-exp-tile ${state.experience_level === exp.value ? 'pj-exp-tile--active' : ''}"
              data-value="${exp.value}">
              <span class="pj-exp-tile__ico">${icon(exp.ico, 18)}</span>
              <span class="pj-exp-tile__name">${exp.label}</span>
              <span class="pj-exp-tile__badge">${exp.exp}</span>
              <span class="pj-exp-tile__desc">${exp.desc}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Location -->
      <div class="form-group">
        <label class="form-label pj-req">Location</label>
        <div class="pj-suggest-wrap">
          <input type="text" class="form-input" id="pj-location"
                 placeholder="Enter workplace location (e.g. Bacolod City, Metro Manila, or Remote)"
                 value="${escHtml(state.location)}" autocomplete="off" />
          <div class="pj-suggest-dropdown" id="loc-dropdown"></div>
        </div>
        <span class="pj-field-err" id="err-location"></span>
      </div>

      <!-- Employment Type tiles -->
      <div class="form-group">
        <label class="form-label pj-req">Employment Type</label>
        <div class="pj-type-grid" id="pj-type-grid">
          ${EMPLOYMENT_TYPES.map(t => `
            <button type="button"
              class="pj-type-tile ${state.employment_type === t.value ? 'pj-type-tile--active' : ''}"
              data-value="${t.value}">
              <span class="pj-type-tile__ico">${icon(t.ico, 20)}</span>
              <span class="pj-type-tile__name">${t.label}</span>
              <span class="pj-type-tile__desc">${t.desc}</span>
            </button>
          `).join('')}
        </div>
        <span class="pj-field-err" id="err-type"></span>
      </div>

      <!-- Status -->
      <div class="form-group">
        <label class="form-label pj-req">Posting Status</label>
        <div class="pj-status-row">
          ${[
            { v:'open',   label:'Publish (Open)',  ico:'eye',        cls:'success' },
            { v:'draft',  label:'Save as Draft',   ico:'fileText',   cls:'warning' },
            { v:'closed', label:'Closed',          ico:'x',          cls:'error'   },
          ].map(s => `
            <label class="pj-status-pill ${state.status === s.v ? 'pj-status-pill--' + s.cls : ''}">
              <input type="radio" name="pj-status" value="${s.v}" ${state.status === s.v ? 'checked' : ''} />
              ${icon(s.ico, 14)} ${s.label}
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Char counter for title
  const titleEl = wrap.querySelector('#pj-title');
  const ccTitle = wrap.querySelector('#cc-title');
  titleEl.addEventListener('input', () => {
    state.title = titleEl.value;
    ccTitle.textContent = `${state.title.length}/120`;
    clearErr(wrap, 'err-title');
  });

  // Department picker
  bindDeptPicker(wrap);

  // Experience level tiles
  wrap.querySelectorAll('.pj-exp-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      wrap.querySelectorAll('.pj-exp-tile').forEach(t => t.classList.remove('pj-exp-tile--active'));
      tile.classList.add('pj-exp-tile--active');
      state.experience_level = tile.dataset.value;
    });
  });

  // Location suggestions
  setupSuggest(wrap, '#pj-location', '#loc-dropdown', PH_CITIES, val => {
    state.location = val;
    clearErr(wrap, 'err-location');
  });
  wrap.querySelector('#pj-location').addEventListener('input', e => {
    state.location = e.target.value;
    clearErr(wrap, 'err-location');
  });

  // Employment type tiles
  wrap.querySelectorAll('.pj-type-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      wrap.querySelectorAll('.pj-type-tile').forEach(t => t.classList.remove('pj-type-tile--active'));
      tile.classList.add('pj-type-tile--active');
      state.employment_type = tile.dataset.value;
      clearErr(wrap, 'err-type');
    });
  });

  // Status pills
  wrap.querySelectorAll('input[name="pj-status"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.status = radio.value;
      // Re-style pills
      wrap.querySelectorAll('.pj-status-pill').forEach(p => {
        p.className = 'pj-status-pill';
        if (p.querySelector('input').value === state.status) {
          const cls = { open: 'success', draft: 'warning', closed: 'error' }[state.status];
          p.classList.add('pj-status-pill--' + cls);
        }
      });
    });
  });
}

/* ───────────────────────────────────────────────────────────── */
/*  STEP 2 – Job Details                                        */
/* ───────────────────────────────────────────────────────────── */
function renderStep2(wrap) {
  wrap.innerHTML = `
    <div class="pj-card">
      <div class="pj-card__label">
        ${icon('fileText', 16)} Step 2 — Job Details
      </div>

      <!-- Salary Range -->
      <div class="form-group">
        <label class="form-label">Salary Range (Monthly, PHP)</label>
        <div class="pj-salary-display" id="pj-salary-display">
          ${formatSalary(state.salary_min)} – ${formatSalary(state.salary_max)}
        </div>
        <div class="pj-range-wrap">
          <span class="pj-range-label">₱10k</span>
          <div class="pj-dual-range" id="pj-dual-range">
            <input type="range" class="pj-range pj-range--min" id="pj-salary-min"
                   min="10000" max="200000" step="1000" value="${state.salary_min}" />
            <input type="range" class="pj-range pj-range--max" id="pj-salary-max"
                   min="10000" max="200000" step="1000" value="${state.salary_max}" />
          </div>
          <span class="pj-range-label">₱200k</span>
        </div>
        <label class="pj-checkbox-label">
          <input type="checkbox" id="pj-salary-neg" ${state.salary_negotiable ? 'checked' : ''} />
          <span>Salary is negotiable</span>
        </label>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label pj-req">Job Description</label>
        <textarea class="form-textarea" id="pj-description" rows="6"
          placeholder="Describe the role, team culture, and what the candidate will work on..."
          maxlength="3000">${escHtml(state.description)}</textarea>
        <div class="pj-char-row">
          <span class="pj-field-err" id="err-description"></span>
          <span class="pj-char-count" id="cc-desc">${state.description.length}/3000</span>
        </div>
      </div>

      <!-- Expiry Date -->
      <div class="form-group">
        <label class="form-label">Application Deadline</label>
        <input type="date" class="form-input" id="pj-expires"
               value="${state.expires_at || ''}"
               min="${new Date().toISOString().split('T')[0]}" />
        <span class="form-hint">Leave blank for no deadline.</span>
      </div>
    </div>
  `;

  // Salary sliders
  const minEl = wrap.querySelector('#pj-salary-min');
  const maxEl = wrap.querySelector('#pj-salary-max');
  const display = wrap.querySelector('#pj-salary-display');
  const negEl   = wrap.querySelector('#pj-salary-neg');

  const updateSalary = () => {
    let minV = parseInt(minEl.value);
    let maxV = parseInt(maxEl.value);
    if (minV > maxV - 1000) {
      if (document.activeElement === minEl) minV = maxV - 1000;
      else maxV = minV + 1000;
      minEl.value = minV;
      maxEl.value = maxV;
    }
    state.salary_min = minV;
    state.salary_max = maxV;
    display.textContent = `${formatSalary(minV)} – ${formatSalary(maxV)}`;
  };

  minEl.addEventListener('input', updateSalary);
  maxEl.addEventListener('input', updateSalary);

  negEl.addEventListener('change', () => {
    state.salary_negotiable = negEl.checked;
  });

  // Description
  const descEl = wrap.querySelector('#pj-description');
  const ccDesc  = wrap.querySelector('#cc-desc');
  descEl.addEventListener('input', () => {
    state.description = descEl.value;
    ccDesc.textContent = `${state.description.length}/3000`;
    clearErr(wrap, 'err-description');
  });

  // Expires
  wrap.querySelector('#pj-expires').addEventListener('change', e => {
    state.expires_at = e.target.value;
  });
}

/* ───────────────────────────────────────────────────────────── */
/*  STEP 3 – Requirements, Skills, Benefits                     */
/* ───────────────────────────────────────────────────────────── */
function renderStep3(wrap) {
  const dynamic = getDynamicPresets(state.department, state.title, state.experience_level);
  const respPresets = dynamic.responsibilities;
  const reqPresets = dynamic.requirements;
  const recSkills = dynamic.recommendedSkills;

  // Auto-seed initial bullets on new job posting if empty
  if (!state._step3Initialized && (!state.responsibilities.length || !state.requirements.length)) {
    if (!state.responsibilities.length) {
      state.responsibilities = [...respPresets.slice(0, 5)];
    }
    if (!state.requirements.length) {
      state.requirements = [...reqPresets.slice(0, 5)];
    }
    state._step3Initialized = true;
  }

  wrap.innerHTML = `
    <div class="pj-card">
      <div class="pj-card__label">
        ${icon('clipboardList', 16)} Step 3 — Requirements &amp; Skills
      </div>

      <!-- Contextual Intelligence Banner -->
      <div class="pj-context-banner">
        <div class="pj-context-banner__icon">
          ${icon('zap', 18)}
        </div>
        <div class="pj-context-banner__text">
          Tailored presets generated for <strong>${escHtml(dynamic.nicheLabel || state.title || 'Role')}</strong>
          <span class="pj-context-tag">${icon('award', 11)} ${escHtml(state.experience_level || 'Mid-Level')}</span>
        </div>
      </div>

      <!-- Responsibilities -->
      <div class="form-group">
        <label class="form-label">Responsibilities</label>
        <span class="form-hint">Add what the candidate will be doing day-to-day.</span>
        ${renderBulletBuilder('responsibilities', state.responsibilities, respPresets)}
      </div>

      <!-- Requirements -->
      <div class="form-group">
        <label class="form-label">Requirements</label>
        <span class="form-hint">Add qualifications and must-haves.</span>
        ${renderBulletBuilder('requirements', state.requirements, reqPresets)}
      </div>

      <!-- Benefits -->
      <div class="form-group">
        <label class="form-label">Benefits &amp; Perks</label>
        <span class="form-hint">What's in it for the candidate?</span>
        <div class="pj-benefit-presets">
          ${BENEFIT_PRESETS.map(b => `
            <button type="button" class="pj-preset-chip ${state.benefits.includes(b) ? 'pj-preset-chip--active' : ''}"
              data-list="benefits" data-val="${escHtml(b)}">
              ${icon('checkCircle', 12)} ${b}
            </button>
          `).join('')}
        </div>
        ${renderBulletBuilder('benefits', state.benefits, [])}
      </div>

      <!-- Skills -->
      <div class="form-group">
        <label class="form-label">Required Skills</label>
        <span class="form-hint">Click recommended skills below, or search and type custom skills (press <kbd>Enter</kbd> or <kbd>,</kbd> to add).</span>

        <!-- Recommended 1-Click Skills for this Niche -->
        ${recSkills?.length ? `
          <div class="pj-recommended-skills">
            <div class="pj-rec-label">
              ${icon('award', 13)} Recommended for ${escHtml(dynamic.nicheLabel)}:
            </div>
            <div class="pj-rec-chips">
              ${recSkills.map(s => {
                const added = state.skills.includes(s);
                return `
                  <button type="button" class="pj-preset-chip ${added ? 'pj-preset-chip--active' : ''}"
                    data-rec-skill="${escHtml(s)}" ${added ? 'title="Already added — click to remove"' : 'title="Click to add"'}>
                    ${added ? icon('checkCircle', 12) : icon('plus', 12)} ${s}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Added chips + search -->
        <div class="pj-skill-suggest-wrap">
          <div class="chip-input" id="pj-chip-input">
            <div class="chip-input__tags" id="pj-skills-tags"></div>
            <input type="text" class="chip-input__field" id="pj-skill-input"
                   placeholder="Search or add skill..." autocomplete="off" />
          </div>
          <div class="pj-suggest-dropdown" id="skill-dropdown"></div>
        </div>
      </div>
    </div>
  `;

  // Bind bullet builders
  bindBulletBuilder(wrap, 'responsibilities', respPresets);
  bindBulletBuilder(wrap, 'requirements', reqPresets);
  bindBulletBuilder(wrap, 'benefits', []);

  // Recommended skills quick-add / remove
  wrap.querySelectorAll('[data-rec-skill]').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.dataset.recSkill;
      const idx = state.skills.indexOf(skill);
      if (idx === -1) {
        state.skills.push(skill);
      } else {
        state.skills.splice(idx, 1);
      }
      renderSkillChips(wrap);
      syncRecSkills(wrap);
    });
  });

  // Benefit preset chips toggle
  wrap.querySelectorAll('.pj-preset-chip[data-list="benefits"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const idx = state.benefits.indexOf(val);
      if (idx === -1) {
        state.benefits.push(val);
        btn.classList.add('pj-preset-chip--active');
      } else {
        state.benefits.splice(idx, 1);
        btn.classList.remove('pj-preset-chip--active');
      }
      refreshBulletList(wrap, 'benefits');
    });
  });

  // Skills chip input
  renderSkillChips(wrap);

  const skillInput = wrap.querySelector('#pj-skill-input');
  const skillDropdown = wrap.querySelector('#skill-dropdown');

  const addSkill = val => {
    val = val.trim();
    if (val && !state.skills.includes(val)) {
      state.skills.push(val);
      renderSkillChips(wrap);
      syncRecSkills(wrap);
    }
    skillInput.value = '';
    skillDropdown.style.display = 'none';
  };

  skillInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput.value);
    }
  });

  skillInput.addEventListener('input', () => {
    const q = skillInput.value.toLowerCase();
    if (!q) { skillDropdown.style.display = 'none'; return; }
    const matches = SKILL_SUGGESTIONS.filter(s =>
      s.toLowerCase().includes(q) && !state.skills.includes(s)
    ).slice(0, 6);
    if (!matches.length) { skillDropdown.style.display = 'none'; return; }
    skillDropdown.innerHTML = matches.map(m => `
      <div class="pj-suggest-item" data-val="${escHtml(m)}">${m}</div>
    `).join('');
    skillDropdown.style.display = 'block';
    skillDropdown.querySelectorAll('.pj-suggest-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        addSkill(item.dataset.val);
      });
    });
  });

  skillInput.addEventListener('blur', () => {
    setTimeout(() => { skillDropdown.style.display = 'none'; }, 150);
  });
}

/* ── Bullet builder helpers ──────────────────────────────────── */
function renderBulletBuilder(listKey, items, presets) {
  return `
    <div class="pj-bullet-builder" data-list="${listKey}">
      <div class="pj-bullet-list" id="pj-list-${listKey}">
        ${items.map((item, i) => renderBulletItem(item, i, listKey)).join('')}
      </div>
      <div class="pj-bullet-add">
        <input type="text" class="form-input pj-bullet-input"
               id="pj-add-${listKey}"
               placeholder="${listKey === 'responsibilities' ? 'Add a responsibility...' : listKey === 'requirements' ? 'Add a requirement...' : 'Add a benefit...'}" />
        <button type="button" class="btn btn--outline btn--sm pj-bullet-add-btn" data-list="${listKey}">
          ${icon('plus', 14)} Add
        </button>
      </div>
      ${presets.length ? `
        <div class="pj-bullet-presets">
          <span class="form-hint">Quick add:</span>
          ${presets.slice(0, 5).map(p => `
            <button type="button" class="pj-preset-text" data-list="${listKey}" data-preset="${escHtml(p)}">${p}</button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderBulletItem(item, i, listKey) {
  return `
    <div class="pj-bullet-item" data-index="${i}" data-list="${listKey}">
      <span class="pj-bullet-dot">${icon('list', 14)}</span>
      <span class="pj-bullet-text" contenteditable="true" data-index="${i}" data-list="${listKey}">${escHtml(item)}</span>
      <button type="button" class="pj-bullet-remove" data-index="${i}" data-list="${listKey}" title="Remove">
        ${icon('x', 12)}
      </button>
    </div>
  `;
}

function refreshBulletList(wrap, listKey) {
  const listEl = wrap.querySelector(`#pj-list-${listKey}`);
  if (!listEl) return;
  listEl.innerHTML = state[listKey].map((item, i) => renderBulletItem(item, i, listKey)).join('');
  bindBulletListEvents(wrap, listKey);
}

function bindBulletBuilder(wrap, listKey, presets) {
  // Add button
  const addBtn = wrap.querySelector(`.pj-bullet-add-btn[data-list="${listKey}"]`);
  const addInput = wrap.querySelector(`#pj-add-${listKey}`);

  if (addBtn && addInput) {
    const doAdd = () => {
      const val = addInput.value.trim();
      if (!val) return;
      if (!state[listKey].includes(val)) state[listKey].push(val);
      addInput.value = '';
      refreshBulletList(wrap, listKey);
    };
    addBtn.addEventListener('click', doAdd);
    addInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });
  }

  // Preset text quick-add
  wrap.querySelectorAll(`.pj-preset-text[data-list="${listKey}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.preset;
      if (!state[listKey].includes(val)) {
        state[listKey].push(val);
        refreshBulletList(wrap, listKey);
      }
    });
  });

  bindBulletListEvents(wrap, listKey);
}

function bindBulletListEvents(wrap, listKey) {
  const listEl = wrap.querySelector(`#pj-list-${listKey}`);
  if (!listEl) return;

  // Remove buttons
  listEl.querySelectorAll('.pj-bullet-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      state[listKey].splice(idx, 1);
      refreshBulletList(wrap, listKey);
      if (listKey === 'benefits') {
        // sync benefit preset chips
        wrap.querySelectorAll('.pj-preset-chip[data-list="benefits"]').forEach(chip => {
          chip.classList.toggle('pj-preset-chip--active', state.benefits.includes(chip.dataset.val));
        });
      }
    });
  });

  // Inline edit
  listEl.querySelectorAll('.pj-bullet-text').forEach(span => {
    span.addEventListener('blur', () => {
      const idx = parseInt(span.dataset.index);
      state[listKey][idx] = span.textContent.trim();
    });
    span.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
    });
  });
}

function renderSkillChips(wrap) {
  const tags = wrap.querySelector('#pj-skills-tags');
  if (!tags) return;
  tags.innerHTML = state.skills.map((s, i) => `
    <span class="chip">
      ${escHtml(s)}
      <button type="button" class="chip__remove" data-index="${i}" title="Remove">&times;</button>
    </span>
  `).join('');
  tags.querySelectorAll('.chip__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.skills.splice(parseInt(btn.dataset.index), 1);
      renderSkillChips(wrap);
      refreshSkillPresets(wrap);
    });
  });
}

function refreshSkillCategories(wrap) {
  const catEl = wrap.querySelector('#pj-skill-categories');
  if (!catEl) return;
  catEl.innerHTML = renderSkillCategories();
  bindSkillCategories(wrap);
}

function syncRecSkills(wrap) {
  wrap.querySelectorAll('[data-rec-skill]').forEach(b => {
    const active = state.skills.includes(b.dataset.recSkill);
    b.classList.toggle('pj-preset-chip--active', active);
    b.title = active ? 'Already added — click to remove' : 'Click to add';
    b.innerHTML = `${active ? icon('checkCircle', 12) : icon('plus', 12)} ${escHtml(b.dataset.recSkill)}`;
  });
}

/* Legacy alias used by renderSkillChips remove handler */
function refreshSkillPresets(wrap) {
  refreshSkillCategories(wrap);
  syncRecSkills(wrap);
}

/* ── Department picker ────────────────────────────────────────── */
function renderDeptPicker() {
  const customVal = state.department && !DEPARTMENTS_FLAT.includes(state.department)
    ? state.department : '';
  return `
    <!-- Search box -->
    <div class="pj-dept-search-wrap">
      <input type="text" class="form-input" id="pj-dept-search"
             placeholder="Search departments…" autocomplete="off" />
      <div class="pj-suggest-dropdown" id="dept-dropdown"></div>
    </div>

    <!-- Selected badge -->
    <div class="pj-dept-selected" id="pj-dept-selected" ${state.department ? '' : 'style="display:none"'}>
      ${icon('checkCircle', 14)}
      <strong id="pj-dept-selected-text">${escHtml(state.department)}</strong>
      <button type="button" class="pj-dept-clear" id="pj-dept-clear" title="Clear">${icon('x', 12)}</button>
    </div>

    <!-- Category accordion -->
    <div class="pj-dept-categories" id="pj-dept-cats">
      ${DEPT_CATEGORIES.map((cat, ci) => `
        <div class="pj-dept-cat" data-cat="${ci}">
          <button type="button" class="pj-dept-cat__header" data-cat="${ci}">
            <span class="pj-dept-cat__ico pj-dept-cat__ico--${cat.color}">${icon(cat.ico, 15)}</span>
            <span class="pj-dept-cat__name">${cat.group}</span>
            <span class="pj-dept-cat__arrow">${icon('chevronDown', 14)}</span>
          </button>
          <div class="pj-dept-cat__items pj-dept-cat__items--hidden">
            ${cat.items.map(item => `
              <button type="button"
                class="pj-dept-item ${state.department === item ? 'pj-dept-item--active' : ''}"
                data-dept="${escHtml(item)}">${item}</button>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Custom entry -->
    <div class="pj-dept-custom">
      <span class="form-hint">Not listed?</span>
      <input type="text" class="form-input pj-dept-custom__input" id="pj-dept-custom"
             placeholder="Type a custom department…"
             value="${escHtml(customVal)}" />
    </div>
  `;
}

function bindDeptPicker(wrap) {
  const selectedBadge = wrap.querySelector('#pj-dept-selected');
  const selectedText  = wrap.querySelector('#pj-dept-selected-text');

  const setDept = (val) => {
    state.department = val;
    if (val) {
      selectedText.textContent = val;
      selectedBadge.style.display = '';
    } else {
      selectedBadge.style.display = 'none';
    }
    // Sync active highlights
    wrap.querySelectorAll('.pj-dept-item').forEach(b => {
      b.classList.toggle('pj-dept-item--active', b.dataset.dept === val);
    });
  };

  // Category accordion toggle
  wrap.querySelectorAll('.pj-dept-cat__header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const cat = hdr.closest('.pj-dept-cat');
      const items = cat.querySelector('.pj-dept-cat__items');
      const isOpen = !items.classList.contains('pj-dept-cat__items--hidden');
      // Close all
      wrap.querySelectorAll('.pj-dept-cat__items').forEach(el => el.classList.add('pj-dept-cat__items--hidden'));
      wrap.querySelectorAll('.pj-dept-cat__header').forEach(h => h.classList.remove('pj-dept-cat__header--open'));
      if (!isOpen) {
        items.classList.remove('pj-dept-cat__items--hidden');
        hdr.classList.add('pj-dept-cat__header--open');
      }
    });
  });

  // Department item selection
  wrap.querySelectorAll('.pj-dept-item').forEach(btn => {
    btn.addEventListener('click', () => {
      setDept(btn.dataset.dept);
      // Clear custom input
      const customEl = wrap.querySelector('#pj-dept-custom');
      if (customEl) customEl.value = '';
    });
  });

  // Clear button
  wrap.querySelector('#pj-dept-clear')?.addEventListener('click', () => {
    setDept('');
    const customEl = wrap.querySelector('#pj-dept-custom');
    if (customEl) customEl.value = '';
  });

  // Search input over flat list
  setupSuggest(wrap, '#pj-dept-search', '#dept-dropdown', DEPARTMENTS_FLAT, val => {
    setDept(val);
    wrap.querySelector('#pj-dept-search').value = '';
    const customEl = wrap.querySelector('#pj-dept-custom');
    if (customEl) customEl.value = '';
  });

  // Custom text entry
  const customEl = wrap.querySelector('#pj-dept-custom');
  if (customEl) {
    customEl.addEventListener('input', () => {
      const val = customEl.value.trim();
      state.department = val;
      if (val) {
        selectedText.textContent = val;
        selectedBadge.style.display = '';
        // Deselect any preset
        wrap.querySelectorAll('.pj-dept-item').forEach(b => b.classList.remove('pj-dept-item--active'));
      } else if (!state.department) {
        selectedBadge.style.display = 'none';
      }
    });
  }

  // Auto-open the category that contains the current selection
  if (state.department) {
    const idx = DEPT_CATEGORIES.findIndex(c => c.items.includes(state.department));
    if (idx !== -1) {
      const hdr = wrap.querySelector(`.pj-dept-cat__header[data-cat="${idx}"]`);
      const items = wrap.querySelector(`.pj-dept-cat[data-cat="${idx}"] .pj-dept-cat__items`);
      if (hdr && items) {
        items.classList.remove('pj-dept-cat__items--hidden');
        hdr.classList.add('pj-dept-cat__header--open');
      }
    }
  }
}

/* ── Skill category rendering ─────────────────────────────────── */
function renderSkillCategories() {
  return SKILL_CATEGORIES.map((cat, ci) => {
    const catSkills = cat.skills;
    const addedCount = catSkills.filter(s => state.skills.includes(s)).length;
    const allAdded   = addedCount === catSkills.length;
    return `
      <div class="pj-skill-cat" data-cat="${ci}">
        <div class="pj-skill-cat__header">
          <span class="pj-skill-cat__ico">${icon(cat.ico, 15)}</span>
          <span class="pj-skill-cat__name">${cat.label}</span>
          ${addedCount > 0 ? `<span class="pj-skill-cat__count">${addedCount}/${catSkills.length}</span>` : ''}
          <button type="button"
            class="btn btn--sm ${allAdded ? 'btn--success' : 'btn--outline'} pj-cat-add-all"
            data-cat="${ci}" ${allAdded ? 'disabled' : ''}>
            ${allAdded ? icon('checkCircle', 13) + ' All added' : icon('plus', 13) + ' Add all'}
          </button>
        </div>
        <div class="pj-skill-cat__chips">
          ${catSkills.map(s => {
            const added = state.skills.includes(s);
            return `<button type="button"
              class="pj-preset-chip pj-skill-preset ${added ? 'pj-preset-chip--active' : ''}"
              data-skill="${escHtml(s)}" ${added ? 'title="Already added — click to remove"' : ''}>
              ${added ? icon('checkCircle', 11) : ''} ${s}
            </button>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function bindSkillCategories(wrap) {
  // Individual chip toggle — add if not present, remove if already present
  wrap.querySelectorAll('#pj-skill-categories .pj-skill-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.skill;
      const idx = state.skills.indexOf(val);
      if (idx === -1) {
        state.skills.push(val);
      } else {
        state.skills.splice(idx, 1);
      }
      renderSkillChips(wrap);
      refreshSkillCategories(wrap);
    });
  });
}

/* ── Suggest dropdown helper ─────────────────────────────────── */
function setupSuggest(wrap, inputSel, dropdownSel, items, onSelect) {
  const inputEl    = wrap.querySelector(inputSel);
  const dropdownEl = wrap.querySelector(dropdownSel);
  if (!inputEl || !dropdownEl) return;

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.toLowerCase();
    const matches = items.filter(i => i.toLowerCase().includes(q)).slice(0, 6);
    if (!matches.length || !q) { dropdownEl.style.display = 'none'; return; }
    dropdownEl.innerHTML = matches.map(m => `
      <div class="pj-suggest-item" data-val="${escHtml(m)}">${m}</div>
    `).join('');
    dropdownEl.style.display = 'block';
    dropdownEl.querySelectorAll('.pj-suggest-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        inputEl.value = item.dataset.val;
        onSelect(item.dataset.val);
        dropdownEl.style.display = 'none';
      });
    });
  });

  inputEl.addEventListener('blur', () => {
    setTimeout(() => { dropdownEl.style.display = 'none'; }, 150);
  });
  inputEl.addEventListener('focus', () => {
    if (inputEl.value) inputEl.dispatchEvent(new Event('input'));
  });
}

/* ── Footer navigation ───────────────────────────────────────── */
function bindFooterNav(container, editId, editJob) {
  container.querySelector('#pj-btn-prev').addEventListener('click', () => {
    if (currentStep > 1) {
      collectCurrentStep(container);
      currentStep--;
      renderCurrentStep(container, editId, editJob);
    }
  });

  container.querySelector('#pj-btn-next').addEventListener('click', async () => {
    collectCurrentStep(container);
    const err = validateStep(container, currentStep);
    if (err) {
      showFormError(container, err);
      return;
    }
    clearFormError(container);

    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      renderCurrentStep(container, editId, editJob);
    } else {
      await submitJob(container, editId, editJob);
    }
  });
}

/* ── Collect field values from current DOM ──────────────────── */
function collectCurrentStep(container) {
  const wrap = container.querySelector('#pj-step-wrap');
  if (currentStep === 1) {
    const t = wrap.querySelector('#pj-title');
    const d = wrap.querySelector('#pj-dept-custom');
    const l = wrap.querySelector('#pj-location');
    const expTile = wrap.querySelector('.pj-exp-tile--active');
    if (t) state.title       = t.value.trim();
    if (d && d.value.trim()) state.department = d.value.trim();
    if (l) state.location    = l.value.trim();
    if (expTile) state.experience_level = expTile.dataset.value;
    const checked = wrap.querySelector('input[name="pj-status"]:checked');
    if (checked) state.status = checked.value;
  } else if (currentStep === 2) {
    const desc = wrap.querySelector('#pj-description');
    const exp  = wrap.querySelector('#pj-expires');
    const neg  = wrap.querySelector('#pj-salary-neg');
    if (desc) state.description      = desc.value.trim();
    if (exp)  state.expires_at       = exp.value;
    if (neg)  state.salary_negotiable = neg.checked;
  }
  // Step 3 is managed reactively
}

/* ── Validation ──────────────────────────────────────────────── */
function validateStep(container, step) {
  const wrap = container.querySelector('#pj-step-wrap');
  if (step === 1) {
    if (!state.title)           return highlightErr(wrap, 'err-title',    'Job title is required.');
    if (!state.location)        return highlightErr(wrap, 'err-location', 'Location is required.');
    if (!state.employment_type) return highlightErr(wrap, 'err-type',     'Please select an employment type.');
    if (!state.experience_level) state.experience_level = 'Mid-Level';
  }
  if (step === 2) {
    if (!state.description)     return highlightErr(wrap, 'err-description', 'Job description is required.');
  }
  return null;
}

function highlightErr(wrap, id, msg) {
  const el = wrap?.querySelector('#' + id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  return msg;
}
function clearErr(wrap, id) {
  const el = wrap?.querySelector('#' + id);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function showFormError(container, msg) {
  const el = container.querySelector('#pj-form-error');
  if (el) el.textContent = msg;
}
function clearFormError(container) {
  const el = container.querySelector('#pj-form-error');
  if (el) el.textContent = '';
}

/* ── Submit ──────────────────────────────────────────────────── */
async function submitJob(container, editId, editJob) {
  const nextBtn = container.querySelector('#pj-btn-next');
  nextBtn.disabled = true;
  nextBtn.innerHTML = `${icon('clock', 16)} Saving...`;

  const salaryRange = state.salary_negotiable
    ? 'Negotiable'
    : `₱${state.salary_min.toLocaleString()} – ₱${state.salary_max.toLocaleString()}/month`;

  const payload = {
    title:            state.title,
    department:       state.department || null,
    location:         state.location,
    employment_type:  state.employment_type,
    experience_level: state.experience_level || 'Mid-Level',
    salary_range:     salaryRange,
    description:      state.description,
    responsibilities: state.responsibilities,
    requirements:     state.requirements,
    benefits:         state.benefits,
    required_skills:  state.skills,
    expires_at:       state.expires_at || null,
    status:           state.status,
  };

  try {
    let res;
    if (editId) {
      res = await apiPut(`/company/jobs/${editId}`, payload);
    } else {
      res = await apiPost('/company/jobs', payload);
    }

    if (res?.success) {
      showToast(editId ? 'Job updated successfully!' : 'Job posted successfully!');
      setTimeout(() => navigate('/jobs'), 1300);
    } else {
      const msg = res?.message
        || (res?.errors ? Object.values(res.errors).flat().join(' ') : 'Failed to save job.');
      showFormError(container, msg);
      nextBtn.disabled = false;
      nextBtn.innerHTML = `${icon('checkCircle', 16)} ${editJob ? 'Save Changes' : 'Publish Job'}`;
    }
  } catch {
    showFormError(container, 'Network error. Please try again.');
    nextBtn.disabled = false;
    nextBtn.innerHTML = `${icon('checkCircle', 16)} ${editJob ? 'Save Changes' : 'Publish Job'}`;
  }
}

/* ── Utilities ───────────────────────────────────────────────── */
function formatSalary(n) {
  return '₱' + Number(n).toLocaleString();
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast--success toast--visible';
  toast.innerHTML = `${icon('checkCircle', 16)} <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}