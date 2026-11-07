<?php

namespace App\Services;

class SkillNormalizer
{
    /**
     * Master canonical skills taxonomy with category, aliases, and metadata.
     *
     * @var array<string, array{canonical: string, slug: string, category: string, aliases: array<string>}>
     */
    protected static array $taxonomy = [
        // ── LANGUAGES ─────────────────────────────────────────────────────────
        'javascript' => [
            'canonical' => 'JavaScript',
            'slug'      => 'javascript',
            'category'  => 'language',
            'aliases'   => ['js', 'vanilla js', 'javascript es6', 'ecmascript', 'es6', 'java script'],
        ],
        'typescript' => [
            'canonical' => 'TypeScript',
            'slug'      => 'typescript',
            'category'  => 'language',
            'aliases'   => ['ts', 'type script'],
        ],
        'python' => [
            'canonical' => 'Python',
            'slug'      => 'python',
            'category'  => 'language',
            'aliases'   => ['py', 'python3', 'python 3', 'python 2'],
        ],
        'java' => [
            'canonical' => 'Java',
            'slug'      => 'java',
            'category'  => 'language',
            'aliases'   => ['core java', 'j2ee', 'j2se', 'java 8', 'java 11', 'java 17', 'java 21'],
        ],
        'php' => [
            'canonical' => 'PHP',
            'slug'      => 'php',
            'category'  => 'language',
            'aliases'   => ['php8', 'php 8', 'php7', 'php 7'],
        ],
        'csharp' => [
            'canonical' => 'C#',
            'slug'      => 'csharp',
            'category'  => 'language',
            'aliases'   => ['c sharp', 'c-sharp', 'cs'],
        ],
        'cpp' => [
            'canonical' => 'C++',
            'slug'      => 'cpp',
            'category'  => 'language',
            'aliases'   => ['c plus plus', 'cplusplus'],
        ],
        'c' => [
            'canonical' => 'C',
            'slug'      => 'c',
            'category'  => 'language',
            'aliases'   => ['c language', 'ansi c'],
        ],
        'html' => [
            'canonical' => 'HTML',
            'slug'      => 'html',
            'category'  => 'language',
            'aliases'   => ['html5', 'html 5', 'hypertext markup language'],
        ],
        'css' => [
            'canonical' => 'CSS',
            'slug'      => 'css',
            'category'  => 'language',
            'aliases'   => ['css3', 'css 3', 'cascading style sheets'],
        ],
        'html-css' => [
            'canonical' => 'HTML/CSS',
            'slug'      => 'html-css',
            'category'  => 'language',
            'aliases'   => ['html and css', 'html & css', 'html/css3', 'html5/css3'],
        ],
        'sql' => [
            'canonical' => 'SQL',
            'slug'      => 'sql',
            'category'  => 'language',
            'aliases'   => ['structured query language', 't-sql', 'pl/sql', 'plsql', 'transact-sql'],
        ],
        'dart' => [
            'canonical' => 'Dart',
            'slug'      => 'dart',
            'category'  => 'language',
            'aliases'   => ['dartlang'],
        ],
        'kotlin' => [
            'canonical' => 'Kotlin',
            'slug'      => 'kotlin',
            'category'  => 'language',
            'aliases'   => ['kt'],
        ],
        'swift' => [
            'canonical' => 'Swift',
            'slug'      => 'swift',
            'category'  => 'language',
            'aliases'   => ['swiftui', 'swift 5'],
        ],
        'r' => [
            'canonical' => 'R',
            'slug'      => 'r',
            'category'  => 'language',
            'aliases'   => ['r programming', 'rlang'],
        ],
        'bash' => [
            'canonical' => 'Bash / Shell',
            'slug'      => 'bash',
            'category'  => 'language',
            'aliases'   => ['bash', 'shell', 'shell scripting', 'sh', 'zsh', 'powershell'],
        ],
        'golang' => [
            'canonical' => 'Go',
            'slug'      => 'golang',
            'category'  => 'language',
            'aliases'   => ['go', 'golang'],
        ],
        'rust' => [
            'canonical' => 'Rust',
            'slug'      => 'rust',
            'category'  => 'language',
            'aliases'   => ['rustlang'],
        ],
        'ruby' => [
            'canonical' => 'Ruby',
            'slug'      => 'ruby',
            'category'  => 'language',
            'aliases'   => ['rubylang'],
        ],

        // ── FRAMEWORKS & LIBRARIES ─────────────────────────────────────────────
        'react' => [
            'canonical' => 'React',
            'slug'      => 'react',
            'category'  => 'framework',
            'aliases'   => ['react.js', 'reactjs', 'react js'],
        ],
        'vue' => [
            'canonical' => 'Vue.js',
            'slug'      => 'vue',
            'category'  => 'framework',
            'aliases'   => ['vue', 'vuejs', 'vue js', 'vue 3', 'vue2', 'vue 2'],
        ],
        'angular' => [
            'canonical' => 'Angular',
            'slug'      => 'angular',
            'category'  => 'framework',
            'aliases'   => ['angularjs', 'angular.js', 'angular 2+'],
        ],
        'nextjs' => [
            'canonical' => 'Next.js',
            'slug'      => 'nextjs',
            'category'  => 'framework',
            'aliases'   => ['next', 'next.js', 'nextjs', 'next js'],
        ],
        'nuxtjs' => [
            'canonical' => 'Nuxt.js',
            'slug'      => 'nuxtjs',
            'category'  => 'framework',
            'aliases'   => ['nuxt', 'nuxt.js', 'nuxtjs', 'nuxt js'],
        ],
        'svelte' => [
            'canonical' => 'Svelte',
            'slug'      => 'svelte',
            'category'  => 'framework',
            'aliases'   => ['sveltejs', 'svelte.js', 'sveltekit'],
        ],
        'laravel' => [
            'canonical' => 'Laravel',
            'slug'      => 'laravel',
            'category'  => 'framework',
            'aliases'   => ['laravel framework', 'laravel 10', 'laravel 11', 'laravel 12'],
        ],
        'nodejs' => [
            'canonical' => 'Node.js',
            'slug'      => 'nodejs',
            'category'  => 'framework',
            'aliases'   => ['node', 'node.js', 'nodejs', 'node js'],
        ],
        'express' => [
            'canonical' => 'Express.js',
            'slug'      => 'express',
            'category'  => 'framework',
            'aliases'   => ['express', 'express.js', 'expressjs', 'express js'],
        ],
        'django' => [
            'canonical' => 'Django',
            'slug'      => 'django',
            'category'  => 'framework',
            'aliases'   => ['django rest framework', 'drf'],
        ],
        'flask' => [
            'canonical' => 'Flask',
            'slug'      => 'flask',
            'category'  => 'framework',
            'aliases'   => ['flask python'],
        ],
        'fastapi' => [
            'canonical' => 'FastAPI',
            'slug'      => 'fastapi',
            'category'  => 'framework',
            'aliases'   => ['fast api', 'fastapi python'],
        ],
        'spring-boot' => [
            'canonical' => 'Spring Boot',
            'slug'      => 'spring-boot',
            'category'  => 'framework',
            'aliases'   => ['spring', 'spring framework', 'springboot', 'spring boot java'],
        ],
        'aspnet-core' => [
            'canonical' => 'ASP.NET Core',
            'slug'      => 'aspnet-core',
            'category'  => 'framework',
            'aliases'   => ['asp.net', 'asp.net core', 'dotnet', '.net', '.net core', 'c# .net'],
        ],
        'flutter' => [
            'canonical' => 'Flutter',
            'slug'      => 'flutter',
            'category'  => 'framework',
            'aliases'   => ['flutter mobile', 'flutter framework'],
        ],
        'react-native' => [
            'canonical' => 'React Native',
            'slug'      => 'react-native',
            'category'  => 'framework',
            'aliases'   => ['reactnative', 'rn', 'react-native'],
        ],
        'tailwind-css' => [
            'canonical' => 'Tailwind CSS',
            'slug'      => 'tailwind-css',
            'category'  => 'framework',
            'aliases'   => ['tailwind', 'tailwindcss', 'tailwind-css'],
        ],
        'bootstrap' => [
            'canonical' => 'Bootstrap',
            'slug'      => 'bootstrap',
            'category'  => 'framework',
            'aliases'   => ['bootstrap 5', 'bootstrap 4', 'twitter bootstrap'],
        ],
        'sass-scss' => [
            'canonical' => 'SASS/SCSS',
            'slug'      => 'sass-scss',
            'category'  => 'framework',
            'aliases'   => ['sass', 'scss'],
        ],

        // ── DATABASES ──────────────────────────────────────────────────────────
        'mysql' => [
            'canonical' => 'MySQL',
            'slug'      => 'mysql',
            'category'  => 'database',
            'aliases'   => ['my sql', 'mysql db', 'mariadb'],
        ],
        'postgresql' => [
            'canonical' => 'PostgreSQL',
            'slug'      => 'postgresql',
            'category'  => 'database',
            'aliases'   => ['postgres', 'psql', 'postgres sql', 'postgresql db'],
        ],
        'mongodb' => [
            'canonical' => 'MongoDB',
            'slug'      => 'mongodb',
            'category'  => 'database',
            'aliases'   => ['mongo', 'mongodb database', 'nosql mongodb'],
        ],
        'sqlite' => [
            'canonical' => 'SQLite',
            'slug'      => 'sqlite',
            'category'  => 'database',
            'aliases'   => ['sqlite3', 'sqlite 3'],
        ],
        'redis' => [
            'canonical' => 'Redis',
            'slug'      => 'redis',
            'category'  => 'database',
            'aliases'   => ['redis cache'],
        ],
        'firebase' => [
            'canonical' => 'Firebase',
            'slug'      => 'firebase',
            'category'  => 'database',
            'aliases'   => ['firebase firestore', 'firestore', 'firebase realtime db'],
        ],
        'supabase' => [
            'canonical' => 'Supabase',
            'slug'      => 'supabase',
            'category'  => 'database',
            'aliases'   => ['supabase db'],
        ],
        'oracle-db' => [
            'canonical' => 'Oracle Database',
            'slug'      => 'oracle-db',
            'category'  => 'database',
            'aliases'   => ['oracle', 'oracle db', 'oracle sql'],
        ],
        'mssql' => [
            'canonical' => 'Microsoft SQL Server',
            'slug'      => 'mssql',
            'category'  => 'database',
            'aliases'   => ['ms sql', 'mssql', 'sql server', 'ms sql server'],
        ],

        // ── TOOLS & CLOUD ──────────────────────────────────────────────────────
        'git' => [
            'canonical' => 'Git',
            'slug'      => 'git',
            'category'  => 'tool',
            'aliases'   => ['git version control'],
        ],
        'github' => [
            'canonical' => 'GitHub',
            'slug'      => 'github',
            'category'  => 'tool',
            'aliases'   => ['gh', 'git hub', 'github actions'],
        ],
        'gitlab' => [
            'canonical' => 'GitLab',
            'slug'      => 'gitlab',
            'category'  => 'tool',
            'aliases'   => ['git lab', 'gitlab ci'],
        ],
        'docker' => [
            'canonical' => 'Docker',
            'slug'      => 'docker',
            'category'  => 'tool',
            'aliases'   => ['docker container', 'containerization'],
        ],
        'kubernetes' => [
            'canonical' => 'Kubernetes',
            'slug'      => 'kubernetes',
            'category'  => 'tool',
            'aliases'   => ['k8s', 'kube'],
        ],
        'linux' => [
            'canonical' => 'Linux',
            'slug'      => 'linux',
            'category'  => 'tool',
            'aliases'   => ['linux os', 'ubuntu', 'debian', 'centos', 'redhat'],
        ],
        'aws' => [
            'canonical' => 'AWS',
            'slug'      => 'aws',
            'category'  => 'tool',
            'aliases'   => ['amazon web services', 'amazon aws', 'ec2', 's3'],
        ],
        'gcp' => [
            'canonical' => 'Google Cloud Platform',
            'slug'      => 'gcp',
            'category'  => 'tool',
            'aliases'   => ['google cloud', 'gcp'],
        ],
        'azure' => [
            'canonical' => 'Microsoft Azure',
            'slug'      => 'azure',
            'category'  => 'tool',
            'aliases'   => ['azure', 'ms azure'],
        ],
        'postman' => [
            'canonical' => 'Postman',
            'slug'      => 'postman',
            'category'  => 'tool',
            'aliases'   => ['postman api'],
        ],
        'cicd' => [
            'canonical' => 'CI/CD',
            'slug'      => 'cicd',
            'category'  => 'tool',
            'aliases'   => ['continuous integration', 'ci cd', 'ci-cd', 'jenkins'],
        ],
        'jira' => [
            'canonical' => 'Jira',
            'slug'      => 'jira',
            'category'  => 'tool',
            'aliases'   => ['jira software', 'atlassian jira'],
        ],

        // ── IT SUPPORT & HARDWARE / NETWORKING ─────────────────────────────────
        'technical-support' => [
            'canonical' => 'Technical Support',
            'slug'      => 'technical-support',
            'category'  => 'it_support',
            'aliases'   => ['tech support', 'it support', 'helpdesk', 'it helpdesk', 'desktop support', 'user support'],
        ],
        'troubleshooting' => [
            'canonical' => 'Troubleshooting',
            'slug'      => 'troubleshooting',
            'category'  => 'it_support',
            'aliases'   => ['hardware troubleshooting', 'software troubleshooting', 'pc troubleshooting', 'system diagnostics'],
        ],
        'networking' => [
            'canonical' => 'Computer Networking',
            'slug'      => 'networking',
            'category'  => 'it_support',
            'aliases'   => ['network administration', 'lan/wan', 'cisco', 'router configuration', 'network cabling', 'tcp/ip', 'dns/dhcp'],
        ],
        'computer-assembly' => [
            'canonical' => 'Computer Hardware & Assembly',
            'slug'      => 'computer-assembly',
            'category'  => 'it_support',
            'aliases'   => ['pc assembly', 'hardware assembly', 'hardware maintenance', 'computer repair', 'pc repair', 'hardware repair', 'computer hardware'],
        ],
        'system-admin' => [
            'canonical' => 'System Administration',
            'slug'      => 'system-admin',
            'category'  => 'it_support',
            'aliases'   => ['sysadmin', 'systems administration', 'windows server', 'active directory'],
        ],
        'cybersecurity' => [
            'canonical' => 'Cybersecurity',
            'slug'      => 'cybersecurity',
            'category'  => 'it_support',
            'aliases'   => ['information security', 'network security', 'infosec', 'penetration testing'],
        ],

        // ── CREATIVE & UI/UX DESIGN ────────────────────────────────────────────
        'ui-ux-design' => [
            'canonical' => 'UI/UX Design',
            'slug'      => 'ui-ux-design',
            'category'  => 'design',
            'aliases'   => ['ui/ux', 'ui design', 'ux design', 'user interface design', 'user experience design', 'ux research', 'wireframing', 'prototyping'],
        ],
        'figma' => [
            'canonical' => 'Figma',
            'slug'      => 'figma',
            'category'  => 'design',
            'aliases'   => ['figma design', 'figma prototyping'],
        ],
        'canva' => [
            'canonical' => 'Canva',
            'slug'      => 'canva',
            'category'  => 'design',
            'aliases'   => ['canva design'],
        ],
        'photoshop' => [
            'canonical' => 'Adobe Photoshop',
            'slug'      => 'photoshop',
            'category'  => 'design',
            'aliases'   => ['photoshop', 'ps', 'adobe ps'],
        ],
        'illustrator' => [
            'canonical' => 'Adobe Illustrator',
            'slug'      => 'illustrator',
            'category'  => 'design',
            'aliases'   => ['illustrator', 'ai', 'adobe ai'],
        ],
        'graphic-design' => [
            'canonical' => 'Graphic Design',
            'slug'      => 'graphic-design',
            'category'  => 'design',
            'aliases'   => ['digital arts', 'branding design', 'visual design'],
        ],
        'video-editing' => [
            'canonical' => 'Video Editing',
            'slug'      => 'video-editing',
            'category'  => 'design',
            'aliases'   => ['premiere pro', 'capcut', 'after effects', 'multimedia editing'],
        ],

        // ── BUSINESS, ACCOUNTING & FINANCE ─────────────────────────────────────
        'ms-excel' => [
            'canonical' => 'Microsoft Excel / Spreadsheets',
            'slug'      => 'ms-excel',
            'category'  => 'business_accounting',
            'aliases'   => ['excel', 'ms excel', 'spreadsheets', 'google sheets', 'spreadsheet modeling', 'excel formulas', 'vlookup', 'pivot tables'],
        ],
        'bookkeeping' => [
            'canonical' => 'Bookkeeping',
            'slug'      => 'bookkeeping',
            'category'  => 'business_accounting',
            'aliases'   => ['book keeping', 'general ledger', 'accounts payable', 'accounts receivable', 'ap/ar'],
        ],
        'financial-reporting' => [
            'canonical' => 'Financial Reporting',
            'slug'      => 'financial-reporting',
            'category'  => 'business_accounting',
            'aliases'   => ['financial reports', 'financial statement preparation', 'balance sheets'],
        ],
        'financial-analysis' => [
            'canonical' => 'Financial Analysis',
            'slug'      => 'financial-analysis',
            'category'  => 'business_accounting',
            'aliases'   => ['financial modeling', 'budgeting', 'forecasting'],
        ],
        'auditing' => [
            'canonical' => 'Auditing',
            'slug'      => 'auditing',
            'category'  => 'business_accounting',
            'aliases'   => ['internal audit', 'financial audit', 'audit compliance'],
        ],
        'payroll' => [
            'canonical' => 'Payroll Processing',
            'slug'      => 'payroll',
            'category'  => 'business_accounting',
            'aliases'   => ['payroll', 'compensation and benefits', 'payroll management'],
        ],
        'tax-compliance' => [
            'canonical' => 'Tax Compliance',
            'slug'      => 'tax-compliance',
            'category'  => 'business_accounting',
            'aliases'   => ['taxation', 'bir filing', 'tax preparation'],
        ],
        'accounting-software' => [
            'canonical' => 'Accounting Software',
            'slug'      => 'accounting-software',
            'category'  => 'business_accounting',
            'aliases'   => ['quickbooks', 'xero', 'sap', 'sage', 'zoho books'],
        ],

        // ── MARKETING, MANAGEMENT & OPERATIONS ─────────────────────────────────
        'project-management' => [
            'canonical' => 'Project Management',
            'slug'      => 'project-management',
            'category'  => 'marketing_management',
            'aliases'   => ['pm', 'scrum', 'agile', 'scrum master', 'kanban', 'sprint planning'],
        ],
        'digital-marketing' => [
            'canonical' => 'Digital Marketing',
            'slug'      => 'digital-marketing',
            'category'  => 'marketing_management',
            'aliases'   => ['online marketing', 'internet marketing', 'social media marketing', 'smm', 'facebook ads', 'google ads'],
        ],
        'content-writing' => [
            'canonical' => 'Content Writing',
            'slug'      => 'content-writing',
            'category'  => 'marketing_management',
            'aliases'   => ['copywriting', 'blog writing', 'technical writing', 'content creation'],
        ],
        'seo' => [
            'canonical' => 'SEO',
            'slug'      => 'seo',
            'category'  => 'marketing_management',
            'aliases'   => ['search engine optimization', 'sem', 'seo/sem', 'keyword research'],
        ],
        'customer-service' => [
            'canonical' => 'Customer Service',
            'slug'      => 'customer-service',
            'category'  => 'marketing_management',
            'aliases'   => ['client relations', 'customer support', 'crm', 'client communications'],
        ],
        'human-resources' => [
            'canonical' => 'Human Resources & Recruitment',
            'slug'      => 'human-resources',
            'category'  => 'marketing_management',
            'aliases'   => ['hr', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations'],
        ],

        // ── PROFESSIONAL & SOFT SKILLS ─────────────────────────────────────────
        'communication' => [
            'canonical' => 'Communication Skills',
            'slug'      => 'communication',
            'category'  => 'soft_skill',
            'aliases'   => ['verbal communication', 'written communication', 'effective communication', 'public speaking', 'presentation skills'],
        ],
        'problem-solving' => [
            'canonical' => 'Problem Solving',
            'slug'      => 'problem-solving',
            'category'  => 'soft_skill',
            'aliases'   => ['analytical thinking', 'troubleshooting skills', 'critical thinking'],
        ],
        'teamwork' => [
            'canonical' => 'Teamwork & Collaboration',
            'slug'      => 'teamwork',
            'category'  => 'soft_skill',
            'aliases'   => ['teamwork', 'collaboration', 'interpersonal skills', 'team player'],
        ],
        'time-management' => [
            'canonical' => 'Time Management',
            'slug'      => 'time-management',
            'category'  => 'soft_skill',
            'aliases'   => ['multitasking', 'punctuality', 'work organization'],
        ],
        'leadership' => [
            'canonical' => 'Leadership',
            'slug'      => 'leadership',
            'category'  => 'soft_skill',
            'aliases'   => ['team leadership', 'people management', 'mentoring'],
        ],

        // ── OTHER / SPECIALIZED TECHNICAL DOMAINS ─────────────────────────────
        'rest-api' => [
            'canonical' => 'REST API',
            'slug'      => 'rest-api',
            'category'  => 'other',
            'aliases'   => ['rest', 'restful api', 'restful apis', 'rest apis', 'api development', 'api integration'],
        ],
        'graphql' => [
            'canonical' => 'GraphQL',
            'slug'      => 'graphql',
            'category'  => 'other',
            'aliases'   => ['graphql api'],
        ],
        'machine-learning' => [
            'canonical' => 'Machine Learning',
            'slug'      => 'machine-learning',
            'category'  => 'other',
            'aliases'   => ['ml', 'deep learning', 'artificial intelligence', 'ai', 'data science', 'scikit-learn', 'tensorflow', 'pytorch'],
        ],
        'data-analysis' => [
            'canonical' => 'Data Analysis',
            'slug'      => 'data-analysis',
            'category'  => 'other',
            'aliases'   => ['data analytics', 'power bi', 'tableau', 'pandas', 'numpy', 'data visualization'],
        ],
        'devops' => [
            'canonical' => 'DevOps',
            'slug'      => 'devops',
            'category'  => 'other',
            'aliases'   => ['dev ops', 'site reliability engineering', 'sre', 'cloud infrastructure'],
        ],
        'qa-testing' => [
            'canonical' => 'QA & Software Testing',
            'slug'      => 'qa-testing',
            'category'  => 'other',
            'aliases'   => ['qa', 'software testing', 'manual testing', 'automated testing', 'selenium', 'cypress', 'unit testing'],
        ],
    ];

    /**
     * Cache for resolved alias lookup map: lowercase_alias => taxonomy_key
     *
     * @var array<string, string>|null
     */
    protected static ?array $lookupCache = null;

    /**
     * Build the lowercase alias lookup map once.
     */
    protected static function initLookup(): void
    {
        if (static::$lookupCache !== null) {
            return;
        }

        $map = [];
        foreach (static::$taxonomy as $key => $def) {
            $canonicalLower = strtolower(trim($def['canonical']));
            $map[$canonicalLower] = $key;
            $map[$key] = $key;

            foreach ($def['aliases'] as $alias) {
                $aliasLower = strtolower(trim($alias));
                $map[$aliasLower] = $key;
            }
        }

        static::$lookupCache = $map;
    }

    /**
     * Normalize a single raw skill string.
     *
     * Returns:
     * [
     *    'canonical'   => 'JavaScript',
     *    'slug'        => 'javascript',
     *    'category'    => 'language',
     *    'is_standard' => true
     * ]
     *
     * @param string|null $raw
     * @return array{canonical: string, slug: string, category: string, is_standard: bool}
     */
    public static function normalize(?string $raw): array
    {
        if ($raw === null) {
            return [
                'canonical'   => '',
                'slug'        => '',
                'category'    => 'other',
                'is_standard' => false,
            ];
        }

        $cleaned = trim($raw);
        if ($cleaned === '') {
            return [
                'canonical'   => '',
                'slug'        => '',
                'category'    => 'other',
                'is_standard' => false,
            ];
        }

        static::initLookup();

        $lower = strtolower($cleaned);

        // 1. Direct alias match
        if (isset(static::$lookupCache[$lower])) {
            $key = static::$lookupCache[$lower];
            $entry = static::$taxonomy[$key];
            return [
                'canonical'   => $entry['canonical'],
                'slug'        => $entry['slug'],
                'category'    => $entry['category'],
                'is_standard' => true,
            ];
        }

        // 2. Punctuation stripped check (e.g. "react.js" => "reactjs")
        $stripped = preg_replace('/[^a-z0-9+#]/i', '', $lower);
        if (isset(static::$lookupCache[$stripped])) {
            $key = static::$lookupCache[$stripped];
            $entry = static::$taxonomy[$key];
            return [
                'canonical'   => $entry['canonical'],
                'slug'        => $entry['slug'],
                'category'    => $entry['category'],
                'is_standard' => true,
            ];
        }

        // 3. Fallback for custom / non-standard skill:
        // Capitalize nicely, generate alphanumeric slug
        $canonical = ucwords($cleaned);
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($cleaned));
        $slug = trim($slug, '-');

        return [
            'canonical'   => $canonical,
            'slug'        => $slug ?: 'custom',
            'category'    => 'other',
            'is_standard' => false,
        ];
    }

    /**
     * Return just the canonical display name string for any skill.
     *
     * @param string|null $raw
     * @return string
     */
    public static function canonicalName(?string $raw): string
    {
        return static::normalize($raw)['canonical'];
    }

    /**
     * Return just the normalized slug string for mathematical comparisons.
     *
     * @param string|null $raw
     * @return string
     */
    public static function slug(?string $raw): string
    {
        return static::normalize($raw)['slug'];
    }

    /**
     * Normalize an array of skill strings, deduplicating them into canonical names.
     *
     * @param array|null $skills
     * @return array<string>
     */
    public static function normalizeArray(?array $skills): array
    {
        if (empty($skills)) {
            return [];
        }

        $canonicalMap = [];
        foreach ($skills as $item) {
            if (!is_string($item)) {
                continue;
            }
            $norm = static::normalize($item);
            if ($norm['canonical'] !== '') {
                $canonicalMap[$norm['slug']] = $norm['canonical'];
            }
        }

        return array_values($canonicalMap);
    }

    /**
     * Transform an array of skills into an array of unique lowercase slugs.
     *
     * @param array|null $skills
     * @return array<string>
     */
    public static function toSlugs(?array $skills): array
    {
        if (empty($skills)) {
            return [];
        }

        $slugs = [];
        foreach ($skills as $item) {
            if (!is_string($item)) {
                continue;
            }
            $norm = static::normalize($item);
            if ($norm['slug'] !== '') {
                $slugs[$norm['slug']] = true;
            }
        }

        return array_keys($slugs);
    }

    /**
     * Evaluate suitability match between candidate skills and required skills
     * using canonical slugs (100% resilient to synonyms & spelling variations).
     *
     * @param array $candidateSkills Raw or canonical candidate skills
     * @param array $requiredSkills  Raw or canonical required skills from posting
     * @return array{
     *   matched_count: int,
     *   total_required: int,
     *   matched_canonical: array<string>,
     *   missing_canonical: array<string>,
     *   match_score: int
     * }
     */
    public static function match(array $candidateSkills, array $requiredSkills): array
    {
        $candidateSlugs = static::toSlugs($candidateSkills);
        $candidateSlugSet = array_flip($candidateSlugs);

        $requiredCanonicals = static::normalizeArray($requiredSkills);
        $totalRequired = count($requiredCanonicals);

        if ($totalRequired === 0) {
            return [
                'matched_count'     => 0,
                'total_required'    => 0,
                'matched_canonical' => [],
                'missing_canonical' => [],
                'match_score'       => !empty($candidateSkills) ? 60 : 50,
            ];
        }

        $matched = [];
        $missing = [];

        foreach ($requiredCanonicals as $reqName) {
            $reqSlug = static::slug($reqName);
            if (isset($candidateSlugSet[$reqSlug])) {
                $matched[] = $reqName;
            } else {
                // Special check for composite skills e.g. "HTML/CSS"
                // If candidate has BOTH "html" and "css", match "HTML/CSS"!
                if ($reqSlug === 'html-css' && isset($candidateSlugSet['html']) && isset($candidateSlugSet['css'])) {
                    $matched[] = $reqName;
                } elseif (($reqSlug === 'html' || $reqSlug === 'css') && isset($candidateSlugSet['html-css'])) {
                    $matched[] = $reqName;
                } else {
                    $missing[] = $reqName;
                }
            }
        }

        $matchedCount = count($matched);
        $score = (int) round(($matchedCount / $totalRequired) * 100);

        return [
            'matched_count'     => $matchedCount,
            'total_required'    => $totalRequired,
            'matched_canonical' => $matched,
            'missing_canonical' => $missing,
            'match_score'       => $score,
        ];
    }

    /**
     * Autocomplete search across canonical skills and aliases.
     *
     * @param string $query
     * @param string|null $category
     * @param int $limit
     * @return array<array{canonical: string, slug: string, category: string, matched_alias: string|null}>
     */
    public static function search(string $query, ?string $category = null, int $limit = 25): array
    {
        $q = strtolower(trim($query));
        $results = [];

        foreach (static::$taxonomy as $key => $entry) {
            if ($category && $category !== 'all' && $entry['category'] !== $category) {
                continue;
            }

            $matchedAlias = null;
            $isMatch = false;

            if ($q === '') {
                $isMatch = true;
            } else {
                $canonicalLower = strtolower($entry['canonical']);
                if (str_contains($canonicalLower, $q)) {
                    $isMatch = true;
                } else {
                    foreach ($entry['aliases'] as $alias) {
                        if (str_contains(strtolower($alias), $q)) {
                            $isMatch = true;
                            $matchedAlias = $alias;
                            break;
                        }
                    }
                }
            }

            if ($isMatch) {
                $results[] = [
                    'canonical'     => $entry['canonical'],
                    'slug'          => $entry['slug'],
                    'category'      => $entry['category'],
                    'matched_alias' => $matchedAlias,
                ];

                if (count($results) >= $limit) {
                    break;
                }
            }
        }

        return $results;
    }

    /**
     * Get the complete canonical taxonomy grouped by category.
     *
     * @return array<string, array<string>>
     */
    public static function getCategorizedTaxonomy(): array
    {
        $grouped = [];
        foreach (static::$taxonomy as $item) {
            $cat = $item['category'];
            if (!isset($grouped[$cat])) {
                $grouped[$cat] = [];
            }
            $grouped[$cat][] = $item['canonical'];
        }

        return $grouped;
    }

    /**
     * Get all canonical items as a flat array.
     *
     * @return array<array{canonical: string, slug: string, category: string, aliases: array<string>}>
     */
    public static function all(): array
    {
        return array_values(static::$taxonomy);
    }
}
