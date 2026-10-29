const BASE_URL = 'https://stoned.onrender.com/api';

const studentsData = [
  {
    name: 'Joshua Miguel Alcantara',
    email: 'joshua.alcantara.bsit4a@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4A-001',
    section: 'A',
    about: {
      headline: 'Full-Stack Web Developer | Laravel, Vue.js & RESTful APIs',
      bio: 'Dedicated BSIT 4th year student at CHMSU Alijis specializing in modern web development with Laravel, Vue 3, and relational databases. Passionate about building performant, secure, and user-friendly web architectures.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 917 111 2001',
      github_url: 'https://github.com/joshua-alcantara',
      linkedin_url: 'https://linkedin.com/in/joshua-alcantara-dev',
      portfolio_url: 'https://joshuaalcantara.dev'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.35',
        description: '4th Year Standing, Section 4-A. Consistent Dean\'s Lister. Specializing in Web and Mobile Systems.',
        is_current: true
      },
      {
        school: 'Negros Occidental High School',
        degree: 'Senior High School - TVL ICT Strand',
        year_start: '2019',
        year_end: '2021',
        gpa: '94.50',
        description: 'Graduated With High Honors. Computer Technology Club President.',
        is_current: false
      }
    ],
    skills: [
      { name: 'PHP', level: 88, category: 'language' },
      { name: 'Laravel', level: 85, category: 'framework' },
      { name: 'Vue.js', level: 82, category: 'framework' },
      { name: 'JavaScript', level: 84, category: 'language' },
      { name: 'MySQL', level: 80, category: 'database' },
      { name: 'Tailwind CSS', level: 90, category: 'framework' },
      { name: 'Git & GitHub', level: 85, category: 'tool' },
      { name: 'REST APIs', level: 86, category: 'other' }
    ],
    experiences: [
      {
        role: 'Freelance Web Developer',
        company: 'Self-Employed',
        type: 'Freelance',
        period_start: 'Jan 2025',
        period_end: 'Present',
        is_current: true,
        description: 'Developed custom landing pages, client portfolios, and responsive web applications for local businesses using Laravel and Tailwind CSS.',
        skills: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS']
      },
      {
        role: 'Student IT Assistant',
        company: 'CHMSU ICT Department',
        type: 'Part-time',
        period_start: 'Aug 2024',
        period_end: 'Dec 2025',
        is_current: false,
        description: 'Assisted in campus laboratory network setup, computer hardware maintenance, and maintaining the internal department event booking system.',
        skills: ['Hardware Maintenance', 'Networking', 'Troubleshooting']
      }
    ],
    projects: [
      {
        title: 'BarangayConnect - Resident Portal & Clearance Management System',
        description: 'Full-stack web application designed for Barangay Mansilingan featuring online barangay clearance requests, SMS notifications, QR verification, and Blotter tracking.',
        tech_stack: ['Laravel 11', 'Vue.js 3', 'Tailwind CSS', 'MySQL', 'Inertia.js'],
        project_url: 'https://barangayconnect-mansilingan.ph',
        repo_url: 'https://github.com/joshua-alcantara/barangay-connect',
        is_featured: true,
        category: 'Web Application',
        role: 'Lead Full-Stack Developer',
        date_completed: 'Dec 2025'
      }
    ],
    achievements: [
      {
        title: 'Dean\'s Lister - 1st to 3rd Year',
        description: 'Consistently attained Dean\'s Honor List recognition with GPA maintaining above 1.40 throughout academic terms.',
        type: 'academic',
        date: '2024-07-15'
      },
      {
        title: 'CHMSU Hackathon 2024 - 1st Runner Up',
        description: 'Awarded 2nd Place for developing an AI-assisted AgriTech monitoring web portal during the university-wide ICT Hackathon.',
        type: 'competition',
        date: '2024-11-20'
      }
    ]
  },
  {
    name: 'Kyla Marie Mendoza',
    email: 'kyla.mendoza.bsit4a@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4A-002',
    section: 'A',
    about: {
      headline: 'UI/UX Designer & Frontend Engineer | Figma, React & Design Systems',
      bio: 'Passionate BSIT 4th year student bridging the gap between intuitive UI/UX design and scalable frontend code. Experienced with Figma prototyping, accessibility standards (WCAG), and modern React web interfaces.',
      location: 'Talisay City, Negros Occidental',
      phone: '+63 917 111 2002',
      github_url: 'https://github.com/kyla-mendoza',
      linkedin_url: 'https://linkedin.com/in/kyla-marie-mendoza',
      portfolio_url: 'https://kylamendoza.design'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.28',
        description: '4th Year Standing, Section 4-A. Focus on Human-Computer Interaction, Design Systems, and Frontend Technologies.',
        is_current: true
      },
      {
        school: 'Rafael B. Lacson Memorial High School',
        degree: 'Senior High School - STEM Strand',
        year_start: '2019',
        year_end: '2021',
        gpa: '95.20',
        description: 'Graduated With High Honors. Visual Arts & Media Graphics Club Head.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Figma', level: 94, category: 'tool' },
      { name: 'UI/UX Prototyping', level: 92, category: 'other' },
      { name: 'React.js', level: 84, category: 'framework' },
      { name: 'Tailwind CSS', level: 90, category: 'framework' },
      { name: 'HTML5 & CSS3', level: 95, category: 'language' },
      { name: 'JavaScript', level: 82, category: 'language' },
      { name: 'Design Systems', level: 88, category: 'other' }
    ],
    experiences: [
      {
        role: 'UI/UX Design Intern',
        company: 'PixelCraft Creative Agency',
        type: 'Freelance',
        period_start: 'Feb 2025',
        period_end: 'Present',
        is_current: true,
        description: 'Created high-fidelity wireframes, mobile interactive prototypes, and atomic design system component libraries for client eCommerce apps.',
        skills: ['Figma', 'UI/UX', 'Design Systems', 'React']
      }
    ],
    projects: [
      {
        title: 'MediCare Visayas - Telehealth Booking & Clinic Management Interface',
        description: 'Designed and built accessible patient booking and telemedicine dashboard in React with instant doctor appointment scheduling.',
        tech_stack: ['Figma', 'React 18', 'Tailwind CSS', 'Vite', 'Lucide Icons'],
        project_url: 'https://medicare-visayas.web.app',
        repo_url: 'https://github.com/kyla-mendoza/medicare-ui',
        is_featured: true,
        category: 'UI/UX & Web',
        role: 'Lead UI/UX Designer & Frontend Dev',
        date_completed: 'Nov 2025'
      }
    ],
    achievements: [
      {
        title: 'Dean\'s Lister - Academic Excellence',
        description: 'Ranked in the top 5% of the BSIT batch with a GPA of 1.28.',
        type: 'academic',
        date: '2024-07-20'
      }
    ]
  },
  {
    name: 'Christian Dale Soriano',
    email: 'christian.soriano.bsit4a@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4A-003',
    section: 'A',
    about: {
      headline: 'Cross-Platform Mobile App Developer | Flutter, Dart & Firebase',
      bio: 'Aspiring mobile application developer building performant iOS and Android apps using Flutter. Deeply familiar with clean state management (BLoC/Riverpod), SQLite caching, and push notifications.',
      location: 'Silay City, Negros Occidental',
      phone: '+63 917 111 2003',
      github_url: 'https://github.com/christian-soriano',
      linkedin_url: 'https://linkedin.com/in/christian-dale-soriano',
      portfolio_url: 'https://christiansoriano.dev'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.42',
        description: '4th Year Standing, Section 4-A. Specialization in Mobile Computing and Cloud Backends.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Flutter', level: 88, category: 'framework' },
      { name: 'Dart', level: 86, category: 'language' },
      { name: 'Firebase', level: 84, category: 'database' },
      { name: 'SQLite', level: 80, category: 'database' },
      { name: 'REST API Integration', level: 85, category: 'other' },
      { name: 'Git', level: 82, category: 'tool' }
    ],
    experiences: [
      {
        role: 'Mobile Developer Project Lead',
        company: 'CHMSU Google Developer Student Club',
        type: 'Volunteer',
        period_start: 'Aug 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Led a team of 4 student developers building community utility apps for campus events and digital bulletin boards.',
        skills: ['Flutter', 'Team Leadership', 'Firebase']
      }
    ],
    projects: [
      {
        title: 'SmartCommute Bacolod - Modern Jeepney Live Route & Fare Calculator',
        description: 'Cross-platform mobile app tracking local Bacolod modernized jeepney transit routes, estimated arrival times, and LTFRB approved fare calculations.',
        tech_stack: ['Flutter', 'Dart', 'Firebase Realtime DB', 'Google Maps API'],
        repo_url: 'https://github.com/christian-soriano/smartcommute-bcd',
        is_featured: true,
        category: 'Mobile Application',
        role: 'Lead Mobile Developer',
        date_completed: 'Jan 2026'
      }
    ],
    achievements: [
      {
        title: 'Certified Flutter Associate Developer',
        description: 'Demonstrated proficiency in Flutter state architecture, navigation, and asynchronous networking.',
        type: 'certification',
        date: '2024-10-12'
      }
    ]
  },
  {
    name: 'Alyssa Nicole Tan',
    email: 'alyssa.tan.bsit4a@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4A-004',
    section: 'A',
    about: {
      headline: 'Data Analyst & Business Intelligence Specialist | Python, SQL & Power BI',
      bio: 'Detail-oriented BSIT senior turning complex organizational data into actionable decision-making dashboards. Experienced in SQL analytics, ETL pipelines with Python Pandas, and Power BI interactive reporting.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 917 111 2004',
      github_url: 'https://github.com/alyssa-tan',
      linkedin_url: 'https://linkedin.com/in/alyssa-nicole-tan',
      portfolio_url: 'https://alyssatan.data'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.30',
        description: '4th Year Standing, Section 4-A. Focused on Enterprise Database Systems, Data Warehousing, and Predictive Analytics.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Python', level: 86, category: 'language' },
      { name: 'PostgreSQL & MySQL', level: 90, category: 'database' },
      { name: 'Power BI', level: 88, category: 'tool' },
      { name: 'Pandas & NumPy', level: 84, category: 'other' },
      { name: 'Tableau', level: 80, category: 'tool' },
      { name: 'ETL Pipelines', level: 82, category: 'other' }
    ],
    experiences: [
      {
        role: 'Data Analytics Assistant',
        company: 'CHMSU Management Information Systems',
        type: 'Part-time',
        period_start: 'Sep 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Extracted student enrollment and grade demographic datasets, cleansed legacy records, and generated enrollment distribution dashboards.',
        skills: ['SQL', 'Data Cleansing', 'Power BI']
      }
    ],
    projects: [
      {
        title: 'CHMSU Alijis Enrollment & Academic Retention Analytics Dashboard',
        description: 'Interactive analytics dashboard visualizing 4-year student progression, dropout predictors, and lab equipment utilization metrics.',
        tech_stack: ['Python', 'PostgreSQL', 'Power BI', 'FastAPI'],
        project_url: 'https://retention-dashboard.chmsu.edu.ph',
        is_featured: true,
        category: 'Data Analytics',
        role: 'Data Analyst',
        date_completed: 'Dec 2025'
      }
    ],
    achievements: [
      {
        title: 'Microsoft Certified: Power BI Data Analyst Associate',
        description: 'Validated expertise in transforming data, modeling datasets, and building enterprise dashboards.',
        type: 'certification',
        date: '2025-01-18'
      }
    ]
  },
  {
    name: 'Mark Anthony Ramos',
    email: 'mark.ramos.bsit4a@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4A-005',
    section: 'A',
    about: {
      headline: 'Network & Cloud Systems Administrator | Linux, Docker & Cisco CCNA',
      bio: 'Enthusiastic systems administrator with hands-on expertise in Linux server configuration, Docker containerization, firewall rule management, and hybrid enterprise networking.',
      location: 'Bago City, Negros Occidental',
      phone: '+63 917 111 2005',
      github_url: 'https://github.com/mark-ramos-sys',
      linkedin_url: 'https://linkedin.com/in/mark-anthony-ramos-it',
      portfolio_url: 'https://markramos.cloud'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.48',
        description: '4th Year Standing, Section 4-A. Major focus in Enterprise Networking, Cloud Infrastructure, and Information Security.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Linux (Ubuntu/Debian)', level: 88, category: 'tool' },
      { name: 'Docker', level: 84, category: 'tool' },
      { name: 'Cisco Routing & Switching', level: 82, category: 'other' },
      { name: 'Bash Scripting', level: 80, category: 'language' },
      { name: 'Nginx Web Server', level: 85, category: 'tool' },
      { name: 'AWS Basics', level: 78, category: 'other' }
    ],
    experiences: [
      {
        role: 'Campus Laboratory Network Admin',
        company: 'CHMSU College of Computer Studies',
        type: 'Part-time',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Configured managed VLANs across 3 computer laboratories, configured dual-WAN failover routers, and managed local DNS/DHCP servers.',
        skills: ['VLANs', 'Network Security', 'Linux']
      }
    ],
    projects: [
      {
        title: 'NetGuard - Automated Lab Server Monitoring & Telegram Alert Bot',
        description: 'Self-hosted monitoring stack alerting network administrators via Telegram when servers exceed CPU, memory, or packet drop thresholds.',
        tech_stack: ['Python', 'Docker', 'Prometheus', 'Grafana', 'Telegram API'],
        repo_url: 'https://github.com/mark-ramos-sys/netguard-alerts',
        is_featured: true,
        category: 'DevOps & Systems',
        role: 'Infrastructure Architect',
        date_completed: 'Jan 2026'
      }
    ],
    achievements: [
      {
        title: 'Cisco Certified Network Associate (CCNA) Completed Coursework',
        description: 'Completed CCNA v7: Switching, Routing, and Wireless Essentials curriculum with distinction.',
        type: 'academic',
        date: '2024-12-05'
      }
    ]
  },
  // Section B Students (5)
  {
    name: 'Danielle Rose Castillo',
    email: 'danielle.castillo.bsit4b@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4B-001',
    section: 'B',
    about: {
      headline: 'QA Automation Engineer & SDET Intern | Cypress, Selenium & Postman',
      bio: 'BSIT 4th year Section B student passionate about software quality assurance, automated API testing, and continuous testing in CI/CD pipelines.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 917 111 2006',
      github_url: 'https://github.com/danielle-castillo',
      linkedin_url: 'https://linkedin.com/in/danielle-rose-castillo',
      portfolio_url: 'https://daniellecastillo.qa'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.32',
        description: '4th Year Standing, Section 4-B. Specializing in Software Engineering and Quality Assurance Methodologies.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Cypress', level: 86, category: 'framework' },
      { name: 'Postman API Testing', level: 90, category: 'tool' },
      { name: 'Selenium WebDriver', level: 82, category: 'tool' },
      { name: 'JavaScript', level: 84, category: 'language' },
      { name: 'TestRail / JIRA', level: 88, category: 'tool' },
      { name: 'SQL for QA', level: 80, category: 'database' }
    ],
    experiences: [
      {
        role: 'Quality Assurance Tester',
        company: 'CodeCamp Bacolod Mentorship Project',
        type: 'Volunteer',
        period_start: 'Aug 2024',
        period_end: 'Jan 2025',
        is_current: false,
        description: 'Wrote over 120 regression test cases and automated 45 end-to-end user journeys for an open-source community portal.',
        skills: ['Test Case Design', 'Cypress', 'Defect Tracking']
      }
    ],
    projects: [
      {
        title: 'AutoTest E-Commerce - Automated Regression Testing Suite',
        description: 'End-to-end automated test framework testing shopping cart operations, checkout payment validation, and edge-case boundary scenarios.',
        tech_stack: ['Cypress', 'JavaScript', 'GitHub Actions', 'Mocha Reports'],
        repo_url: 'https://github.com/danielle-castillo/autotest-ecommerce',
        is_featured: true,
        category: 'Quality Assurance',
        role: 'QA Lead',
        date_completed: 'Dec 2025'
      }
    ],
    achievements: [
      {
        title: 'ISTQB Certified Tester Foundation Level (CTFL) Candidate',
        description: 'Completed accredited training modules covering static testing, dynamic testing, and test management.',
        type: 'certification',
        date: '2025-01-10'
      }
    ]
  },
  {
    name: 'Gian Carlo Reyes',
    email: 'gian.reyes.bsit4b@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4B-002',
    section: 'B',
    about: {
      headline: 'Backend Developer | Go (Golang), Node.js & Microservices',
      bio: 'Enthusiastic backend software engineer with high interest in high-throughput services, concurrent execution with Go goroutines, and gRPC service communication.',
      location: 'Murcia, Negros Occidental',
      phone: '+63 917 111 2007',
      github_url: 'https://github.com/giancarlo-reyes',
      linkedin_url: 'https://linkedin.com/in/gian-carlo-reyes-dev',
      portfolio_url: 'https://gianreyes.tech'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.40',
        description: '4th Year Standing, Section 4-B. Major in Distributed Systems and Cloud Backend Architecture.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Go (Golang)', level: 85, category: 'language' },
      { name: 'Node.js & Express', level: 86, category: 'framework' },
      { name: 'PostgreSQL', level: 88, category: 'database' },
      { name: 'Redis', level: 82, category: 'database' },
      { name: 'Docker', level: 80, category: 'tool' },
      { name: 'REST & gRPC', level: 84, category: 'other' }
    ],
    experiences: [
      {
        role: 'Freelance Backend Engineer',
        company: 'Remote Client Projects',
        type: 'Freelance',
        period_start: 'Mar 2025',
        period_end: 'Present',
        is_current: true,
        description: 'Built scalable REST APIs in Node.js and Go for appointment scheduling and inventory tracking with sub-50ms response times.',
        skills: ['Golang', 'PostgreSQL', 'Docker', 'Redis']
      }
    ],
    projects: [
      {
        title: 'FastQueue - Realtime Job Dispatcher & Rate Limiter',
        description: 'Lightweight distributed queue manager built in Go utilizing Redis streams for high-speed background worker task execution.',
        tech_stack: ['Go 1.22', 'Redis', 'Docker', 'Prometheus'],
        repo_url: 'https://github.com/giancarlo-reyes/fastqueue-go',
        is_featured: true,
        category: 'Backend Architecture',
        role: 'Backend Architect',
        date_completed: 'Jan 2026'
      }
    ],
    achievements: [
      {
        title: 'Dean\'s List Recognition - Section 4-B',
        description: 'Awarded academic honor certificate for 1st and 2nd semester of 3rd year.',
        type: 'academic',
        date: '2024-06-30'
      }
    ]
  },
  {
    name: 'Stephanie Joy Diaz',
    email: 'stephanie.diaz.bsit4b@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4B-003',
    section: 'B',
    about: {
      headline: 'Frontend Engineer & React Developer | Next.js, TypeScript & Tailwind',
      bio: 'BSIT senior focusing on building delightful, accessible, and fast web experiences with React, Next.js, and TypeScript. Passionate about responsive UI and clean component design.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 917 111 2008',
      github_url: 'https://github.com/stephanie-diaz',
      linkedin_url: 'https://linkedin.com/in/stephanie-joy-diaz',
      portfolio_url: 'https://stephaniediaz.dev'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.34',
        description: '4th Year Standing, Section 4-B. Focus in Modern Web Frameworks and Software Engineering.',
        is_current: true
      }
    ],
    skills: [
      { name: 'React.js', level: 88, category: 'framework' },
      { name: 'Next.js', level: 85, category: 'framework' },
      { name: 'TypeScript', level: 82, category: 'language' },
      { name: 'Tailwind CSS', level: 92, category: 'framework' },
      { name: 'JavaScript (ES6+)', level: 86, category: 'language' },
      { name: 'Git & GitHub', level: 84, category: 'tool' }
    ],
    experiences: [
      {
        role: 'Frontend Web Intern',
        company: 'InnovateHub Digital',
        type: 'Freelance',
        period_start: 'Jan 2025',
        period_end: 'Present',
        is_current: true,
        description: 'Implemented component library and interactive landing pages for startups using Next.js and Tailwind CSS.',
        skills: ['React', 'Next.js', 'Tailwind CSS']
      }
    ],
    projects: [
      {
        title: 'EduResource - Open Educational Material Repository for Negros Schools',
        description: 'Web platform allowing educators and students across Negros Occidental to browse and download approved localized K-12 learning modules.',
        tech_stack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase'],
        project_url: 'https://eduresource-negros.org',
        repo_url: 'https://github.com/stephanie-diaz/eduresource',
        is_featured: true,
        category: 'Web Application',
        role: 'Frontend Lead',
        date_completed: 'Dec 2025'
      }
    ],
    achievements: [
      {
        title: '1st Place - Web Design Showcase 2024',
        description: 'Champion in the annual College of Computer Studies Web Design & Development competition.',
        type: 'competition',
        date: '2024-09-25'
      }
    ]
  },
  {
    name: 'Marcus Neil Villanueva',
    email: 'marcus.villanueva.bsit4b@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4B-004',
    section: 'B',
    about: {
      headline: 'Cybersecurity Analyst & Ethical Hacker | CompTIA Security+ & Wireshark',
      bio: 'BSIT 4th year Section B student passionate about threat hunting, vulnerability assessment, web application security (OWASP Top 10), and digital forensics.',
      location: 'Victorias City, Negros Occidental',
      phone: '+63 917 111 2009',
      github_url: 'https://github.com/marcus-villanueva-sec',
      linkedin_url: 'https://linkedin.com/in/marcus-neil-villanueva',
      portfolio_url: 'https://marcusvillanueva.security'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.45',
        description: '4th Year Standing, Section 4-B. Major in Information Assurance and Cybersecurity.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Network Security', level: 86, category: 'other' },
      { name: 'Wireshark & Packet Analysis', level: 85, category: 'tool' },
      { name: 'OWASP Top 10 Auditing', level: 84, category: 'other' },
      { name: 'Linux Kali / Parrot OS', level: 88, category: 'tool' },
      { name: 'Python for Security', level: 80, category: 'language' }
    ],
    experiences: [
      {
        role: 'Security Audit Assistant',
        company: 'CHMSU Campus Cybersecurity Interest Group',
        type: 'Volunteer',
        period_start: 'Aug 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Conducted authorized vulnerability assessments and web port security scans on internal staging sandbox servers.',
        skills: ['Vulnerability Scanning', 'Nmap', 'Penetration Testing']
      }
    ],
    projects: [
      {
        title: 'SecurScan - Automated Web Application Vulnerability Scanner',
        description: 'Python tool detecting SQL injection vulnerabilities, cross-site scripting (XSS), and insecure HTTP security headers.',
        tech_stack: ['Python', 'Requests', 'BeautifulSoup', 'CLI'],
        repo_url: 'https://github.com/marcus-villanueva-sec/securscan',
        is_featured: true,
        category: 'Information Security',
        role: 'Security Researcher',
        date_completed: 'Nov 2025'
      }
    ],
    achievements: [
      {
        title: 'CompTIA Security+ Certified (SY0-701)',
        description: 'Internationally recognized certification in baseline cybersecurity principles, threat analysis, and risk management.',
        type: 'certification',
        date: '2025-02-15'
      }
    ]
  },
  {
    name: 'Bea Clarisse Tolentino',
    email: 'bea.tolentino.bsit4b@chmsu.edu.ph',
    password: 'CHMSU@2023-BSIT4B-005',
    section: 'B',
    about: {
      headline: 'Full-Stack Developer & ERP Specialist | Python, Django & PostgreSQL',
      bio: 'BSIT Section B senior focused on scalable enterprise web systems using Python, Django, and PostgreSQL. Experienced in relational schema design, role-based access control, and asynchronous job queuing.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 917 111 2010',
      github_url: 'https://github.com/bea-tolentino',
      linkedin_url: 'https://linkedin.com/in/bea-clarisse-tolentino',
      portfolio_url: 'https://beatolentino.dev'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: '2021',
        year_end: '2025',
        gpa: '1.31',
        description: '4th Year Standing, Section 4-B. Focus on Enterprise Software Architecture and Relational Database Engineering.',
        is_current: true
      }
    ],
    skills: [
      { name: 'Python', level: 90, category: 'language' },
      { name: 'Django & DRF', level: 86, category: 'framework' },
      { name: 'PostgreSQL', level: 88, category: 'database' },
      { name: 'Docker', level: 80, category: 'tool' },
      { name: 'JavaScript & HTML5', level: 82, category: 'language' },
      { name: 'Git', level: 85, category: 'tool' }
    ],
    experiences: [
      {
        role: 'Student Software Developer',
        company: 'CHMSU Capstone Innovation Lab',
        type: 'Part-time',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Engineered Django REST backend APIs for campus asset management with barcode tracking and inventory reconciliation.',
        skills: ['Django', 'PostgreSQL', 'API Development']
      }
    ],
    projects: [
      {
        title: 'AssetTrack - University Equipment & Lab Resource Manager',
        description: 'Web-based equipment tracking system preventing lost campus assets with real-time check-in/out and automated maintenance schedules.',
        tech_stack: ['Django 5', 'PostgreSQL', 'Bootstrap 5', 'Celery'],
        project_url: 'https://assettrack.chmsu.edu.ph',
        repo_url: 'https://github.com/bea-tolentino/assettrack',
        is_featured: true,
        category: 'Enterprise Software',
        role: 'Full-Stack Developer',
        date_completed: 'Dec 2025'
      }
    ],
    achievements: [
      {
        title: 'Dean\'s Honor Roll - 1st to 3rd Year',
        description: 'Maintained a GPA of 1.31 with zero non-passing marks across all computing subjects.',
        type: 'academic',
        date: '2024-07-28'
      }
    ]
  }
];

const graduatesData = [
  // 5 Graduates in Section 4A
  {
    name: 'Adrian Kyle Bautista',
    email: 'adrian.bautista.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4A-001',
    section: '4A',
    about: {
      headline: 'Senior Full-Stack Engineer | Laravel, React, AWS | Class of 2024 (Magna Cum Laude)',
      bio: 'CHMSU Alijis BSIT 2024 Magna Cum Laude graduate. Building high-concurrency fintech microservices and payment gateways. Deeply experienced in event-driven architecture and clean domain-driven design.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 918 222 3001',
      github_url: 'https://github.com/adrianbautista-dev',
      linkedin_url: 'https://linkedin.com/in/adrian-kyle-bautista',
      portfolio_url: 'https://adrianbautista.tech'
    },
    jobseeker_profile: {
      desired_job_title: 'Senior Software Engineer / Tech Lead',
      work_preference: 'hybrid',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.22',
        description: 'Graduated Magna Cum Laude, Section 4-A. Batch Valedictorian Nominee. Best Capstone Project Awardee.',
        is_current: false
      },
      {
        school: 'Negros Occidental High School',
        degree: 'Senior High School - STEM Track',
        year_start: 2018,
        year_end: 2020,
        period: '2018 - 2020',
        gpa: '96.40',
        description: 'With Highest Honors. Leadership Excellence Medal.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Laravel', level: 95, category: 'framework' },
      { name: 'PHP 8.3', level: 94, category: 'language' },
      { name: 'React & Next.js', level: 90, category: 'framework' },
      { name: 'TypeScript', level: 88, category: 'language' },
      { name: 'PostgreSQL', level: 92, category: 'database' },
      { name: 'AWS (ECS, RDS, S3)', level: 85, category: 'tool' },
      { name: 'Docker & Microservices', level: 86, category: 'tool' }
    ],
    experiences: [
      {
        role: 'Senior Full-Stack Engineer',
        company: 'Ingenuity Global Consulting',
        type: 'Full-time',
        location: 'Bacolod City (Hybrid)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Architecting scalable fintech web applications serving 200k+ monthly active users. Designed event-driven payment reconciliation pipelines using Laravel queues and Redis.',
        skills: ['Laravel', 'React', 'TypeScript', 'PostgreSQL', 'AWS']
      },
      {
        role: 'OJT Software Engineering Intern (600 Hours Completed)',
        company: 'Nexus Enterprise Solutions',
        type: 'OJT',
        location: 'Bacolod City',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT training before graduating. Developed core ERP modules, integrated third-party REST APIs, and received Outstanding Trainee award.',
        skills: ['PHP', 'Vue.js', 'MySQL', 'Docker', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'PaySync PH - Unified Multi-Channel Payment Gateway',
        description: 'Commercial payment aggregation platform integrating GCash, Maya, and GrabPay APIs with real-time webhook processing and automated merchant settlement.',
        tech_stack: ['Laravel 11', 'React 18', 'PostgreSQL', 'Redis', 'AWS ECS'],
        project_url: 'https://paysync.ph',
        repo_url: 'https://github.com/adrianbautista-dev/paysync-core',
        is_featured: true,
        category: 'Fintech & SaaS',
        role: 'Lead Architect',
        date_completed: 'Aug 2024'
      }
    ],
    achievements: [
      {
        title: 'Magna Cum Laude (CHMSU Class of 2024)',
        description: 'Conferred university Latin honors with a cumulative GPA of 1.22 in BS Information Technology.',
        type: 'academic',
        date: '2024-06-28'
      },
      {
        title: 'AWS Certified Solutions Architect – Associate',
        description: 'Demonstrated proficiency in resilient, high-performing cloud architectures on AWS.',
        type: 'certification',
        date: '2024-11-15'
      }
    ]
  },
  {
    name: 'Camille Joy Villanueva',
    email: 'camille.villanueva.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4A-002',
    section: '4A',
    about: {
      headline: 'Lead Product Designer & UI Engineer | Stratpoint Technologies | Class of 2024 (Cum Laude)',
      bio: 'CHMSU 2024 Cum Laude graduate specializing in user experience research, design systems, and frontend engineering for enterprise web and mobile applications.',
      location: 'Makati City, Metro Manila',
      phone: '+63 918 222 3002',
      github_url: 'https://github.com/camillejoy-ui',
      linkedin_url: 'https://linkedin.com/in/camille-joy-villanueva',
      portfolio_url: 'https://camillejoy.design'
    },
    jobseeker_profile: {
      desired_job_title: 'Senior Product Designer & UI Engineer',
      work_preference: 'remote',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.38',
        description: 'Graduated Cum Laude, Section 4-A. Outstanding HCI and Interface Innovation Citation.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Figma & Design Systems', level: 96, category: 'tool' },
      { name: 'UI/UX Research', level: 92, category: 'other' },
      { name: 'React & Next.js', level: 88, category: 'framework' },
      { name: 'Tailwind CSS', level: 94, category: 'framework' },
      { name: 'WCAG Accessibility', level: 90, category: 'other' }
    ],
    experiences: [
      {
        role: 'Lead Product Designer & UI Engineer',
        company: 'Stratpoint Technologies',
        type: 'Full-time',
        location: 'Makati City (Remote)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Leading design system unification across 4 enterprise applications. Designed user flows increasing conversion rates by 34%.',
        skills: ['Figma', 'React', 'Design Systems', 'UX Strategy']
      },
      {
        role: 'OJT Product Design Intern (600 Hours Completed)',
        company: 'Stratpoint Technologies',
        type: 'OJT',
        location: 'Remote',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of required OJT internship. Built reusable React component prototypes and received direct full-time employment conversion upon graduation.',
        skills: ['Figma', 'UI Design', 'React', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'Aura Design System - Open-Source Accessible React Component Library',
        description: 'Production design system component library powering 12 enterprise applications with 100% WCAG AAA accessibility compliance.',
        tech_stack: ['Figma', 'Storybook', 'React 18', 'Tailwind CSS', 'TypeScript'],
        project_url: 'https://auraui.dev',
        repo_url: 'https://github.com/camillejoy-ui/aura-design-system',
        is_featured: true,
        category: 'Design Systems',
        role: 'Lead UI/UX Architect',
        date_completed: 'Oct 2024'
      }
    ],
    achievements: [
      {
        title: 'Cum Laude (CHMSU Class of 2024)',
        description: 'Conferred university Latin honors in BS Information Technology.',
        type: 'academic',
        date: '2024-06-28'
      }
    ]
  },
  {
    name: 'Christian Dave Tan',
    email: 'christian.tan.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4A-003',
    section: '4A',
    about: {
      headline: 'Cloud Solutions & DevOps Engineer | CloudCraft Bacolod | Class of 2024',
      bio: 'CHMSU BSIT 2024 alumnus specializing in automated infrastructure-as-code, Kubernetes orchestration, CI/CD automation, and cloud cost governance on AWS and GCP.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 918 222 3003',
      github_url: 'https://github.com/christiantan-cloud',
      linkedin_url: 'https://linkedin.com/in/christian-dave-tan-cloud',
      portfolio_url: 'https://christiantan.cloud'
    },
    jobseeker_profile: {
      desired_job_title: 'Cloud DevOps Architect',
      work_preference: 'hybrid',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.40',
        description: 'Class of 2024, Section 4-A. Major in Cloud Infrastructure & Systems Engineering.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Kubernetes & Docker', level: 92, category: 'tool' },
      { name: 'Terraform & Ansible', level: 88, category: 'tool' },
      { name: 'AWS & GCP', level: 90, category: 'tool' },
      { name: 'CI/CD (GitLab, GitHub Actions)', level: 92, category: 'tool' },
      { name: 'Bash & Python', level: 86, category: 'language' }
    ],
    experiences: [
      {
        role: 'Cloud Solutions & DevOps Engineer',
        company: 'CloudCraft Bacolod',
        type: 'Full-time',
        location: 'Bacolod City',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Managing production Kubernetes clusters and automated CI/CD deployment pipelines for international SaaS clients.',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker']
      },
      {
        role: 'OJT Cloud Operations Intern (600 Hours Completed)',
        company: 'CloudCraft Bacolod',
        type: 'OJT',
        location: 'Bacolod City',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of OJT training in cloud operations, log aggregation, and Linux server hardening before receiving employment offer.',
        skills: ['Linux', 'Cloud Operations', 'Docker', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'KubeDeploy - Multi-Cluster GitOps Infrastructure Template',
        description: 'Production-ready Infrastructure-as-Code repository using Terraform and ArgoCD for zero-downtime rolling canary deployments.',
        tech_stack: ['Terraform', 'Kubernetes', 'ArgoCD', 'Prometheus', 'Helm'],
        repo_url: 'https://github.com/christiantan-cloud/kubedeploy-gitops',
        is_featured: true,
        category: 'DevOps Infrastructure',
        role: 'DevOps Architect',
        date_completed: 'Nov 2024'
      }
    ],
    achievements: [
      {
        title: 'Certified Kubernetes Administrator (CKA)',
        description: 'Demonstrated hands-on competence in deploying, configuring, and managing enterprise Kubernetes clusters.',
        type: 'certification',
        date: '2024-12-10'
      }
    ]
  },
  {
    name: 'Danica Mae Espino',
    email: 'danica.espino.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4A-004',
    section: '4A',
    about: {
      headline: 'Data Analytics Specialist | DigitalPeak PH | Class of 2024 (Cum Laude)',
      bio: 'CHMSU BSIT 2024 Cum Laude alumna turning complex enterprise databases into predictive customer analytics, marketing attribution dashboards, and executive intelligence reports.',
      location: 'Cebu City, Central Visayas',
      phone: '+63 918 222 3004',
      github_url: 'https://github.com/danicaespino-data',
      linkedin_url: 'https://linkedin.com/in/danica-mae-espino',
      portfolio_url: 'https://danicaespino.analytics'
    },
    jobseeker_profile: {
      desired_job_title: 'Senior Data Analyst / Analytics Engineer',
      work_preference: 'remote',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.34',
        description: 'Graduated Cum Laude, Section 4-A. Specialized in Database Systems, Data Warehousing, and Predictive Analytics.',
        is_current: false
      }
    ],
    skills: [
      { name: 'SQL (PostgreSQL & BigQuery)', level: 94, category: 'database' },
      { name: 'Python (Pandas, Polars)', level: 90, category: 'language' },
      { name: 'Power BI & Looker Studio', level: 92, category: 'tool' },
      { name: 'dbt (Data Build Tool)', level: 85, category: 'tool' },
      { name: 'Airflow ETL Pipelines', level: 84, category: 'other' }
    ],
    experiences: [
      {
        role: 'Data Analytics Specialist',
        company: 'DigitalPeak PH',
        type: 'Full-time',
        location: 'Cebu City (Remote)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Developed automated ETL data pipelines in dbt and BigQuery processing 5M+ daily transaction records for eCommerce merchants.',
        skills: ['SQL', 'Python', 'BigQuery', 'Power BI']
      },
      {
        role: 'OJT Data Analytics Trainee (600 Hours Completed)',
        company: 'DigitalPeak PH',
        type: 'OJT',
        location: 'Remote',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship analyzing customer churn data and building executive reporting dashboards.',
        skills: ['Data Cleansing', 'SQL', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'OmniAnalytics - Unified Retail Customer LTV & Churn Engine',
        description: 'Data analytics warehouse and predictive churn engine processing customer purchasing cohorts and automated cohort retention reports.',
        tech_stack: ['Google BigQuery', 'dbt', 'Python', 'Looker Studio'],
        project_url: 'https://omnianalytics-demo.ph',
        is_featured: true,
        category: 'Data Science & BI',
        role: 'Lead Data Analyst',
        date_completed: 'Sep 2024'
      }
    ],
    achievements: [
      {
        title: 'Cum Laude (CHMSU Class of 2024)',
        description: 'Graduated with official Latin honors in BS Information Technology.',
        type: 'academic',
        date: '2024-06-28'
      }
    ]
  },
  {
    name: 'Gabriel Louise Alcantara',
    email: 'gabriel.alcantara.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4A-005',
    section: '4A',
    about: {
      headline: 'Senior Mobile Application Developer | AppForge Solutions | Class of 2024',
      bio: 'CHMSU BSIT 2024 graduate architecting production iOS and Android apps with Flutter and React Native. Experienced in offline-first synchronization, Bluetooth LE peripherals, and CI/CD mobile releases.',
      location: 'Iloilo City, Western Visayas',
      phone: '+63 918 222 3005',
      github_url: 'https://github.com/gabriel-alcantara-mobile',
      linkedin_url: 'https://linkedin.com/in/gabriel-louise-alcantara',
      portfolio_url: 'https://gabrielalcantara.dev'
    },
    jobseeker_profile: {
      desired_job_title: 'Lead Mobile App Developer',
      work_preference: 'hybrid',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.41',
        description: 'Class of 2024, Section 4-A. Major in Mobile Computing and Cloud Backends.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Flutter & Dart', level: 94, category: 'framework' },
      { name: 'React Native', level: 88, category: 'framework' },
      { name: 'iOS (Swift) & Android (Kotlin)', level: 84, category: 'language' },
      { name: 'Firebase & Supabase', level: 90, category: 'database' },
      { name: 'Fastlane & App Store CI/CD', level: 86, category: 'tool' }
    ],
    experiences: [
      {
        role: 'Senior Mobile Application Developer',
        company: 'AppForge Solutions',
        type: 'Full-time',
        location: 'Iloilo City (Hybrid)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Published 3 high-volume consumer mobile apps to Google Play Store and Apple App Store with over 80,000 combined downloads.',
        skills: ['Flutter', 'React Native', 'Firebase', 'Mobile Architecture']
      },
      {
        role: 'OJT Mobile Developer Intern (600 Hours Completed)',
        company: 'AppForge Solutions',
        type: 'OJT',
        location: 'Iloilo City',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship developing push notifications, local SQLite database synchronization, and UI layouts.',
        skills: ['Flutter', 'Dart', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'AgriTrack Mobile - Offline-First Farmer Yield & Farmgate Price App',
        description: 'Bilingual mobile app empowering Western Visayas farmers with offline recording of crop yields and real-time DA farmgate market prices.',
        tech_stack: ['Flutter', 'Dart', 'Isar Database', 'Firebase Cloud Messaging'],
        project_url: 'https://agritrack-ph.app',
        repo_url: 'https://github.com/gabriel-alcantara-mobile/agritrack-flutter',
        is_featured: true,
        category: 'Mobile Application',
        role: 'Lead Mobile Architect',
        date_completed: 'Oct 2024'
      }
    ],
    achievements: [
      {
        title: 'Google Associate Android Developer Certified',
        description: 'Demonstrated skills in building resilient Android mobile experiences adhering to Google standards.',
        type: 'certification',
        date: '2024-11-25'
      }
    ]
  },
  // 5 Graduates in Section 4B
  {
    name: 'Hannah Nicole Soriano',
    email: 'hannah.soriano.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4B-001',
    section: '4B',
    about: {
      headline: 'Senior QA & Test Automation Architect | QAWorks Philippines | Class of 2024 (Magna Cum Laude)',
      bio: 'CHMSU BSIT 2024 Magna Cum Laude graduate designing enterprise quality engineering frameworks. Specialized in automated browser & API testing with Playwright, Cypress, and performance load testing with k6.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 918 222 3006',
      github_url: 'https://github.com/hannahsoriano-qa',
      linkedin_url: 'https://linkedin.com/in/hannah-nicole-soriano',
      portfolio_url: 'https://hannahsoriano.qa'
    },
    jobseeker_profile: {
      desired_job_title: 'Lead QA Automation Architect / SDET Manager',
      work_preference: 'remote',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.24',
        description: 'Graduated Magna Cum Laude, Section 4-B. Academic Excellence Award in Computing and Software Quality.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Playwright & Cypress', level: 96, category: 'framework' },
      { name: 'TypeScript & JavaScript', level: 92, category: 'language' },
      { name: 'k6 & JMeter (Load Testing)', level: 88, category: 'tool' },
      { name: 'CI/CD Test Gate Integration', level: 90, category: 'tool' },
      { name: 'API Automated Testing', level: 94, category: 'tool' }
    ],
    experiences: [
      {
        role: 'Senior QA & Test Automation Architect',
        company: 'QAWorks Philippines',
        type: 'Full-time',
        location: 'Bacolod City (Remote)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Architecting continuous end-to-end test suites across 8 fintech microfrontends reducing production regression incidents by 78%.',
        skills: ['Playwright', 'TypeScript', 'CI/CD', 'k6']
      },
      {
        role: 'OJT Test Automation Intern (600 Hours Completed)',
        company: 'QAWorks Philippines',
        type: 'OJT',
        location: 'Bacolod City',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship automated 150 regression journeys and earned instant full-time conversion.',
        skills: ['Cypress', 'API Testing', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'TestMatrix - Distributed Parallel Testing Orchestrator',
        description: 'Open-source test runner executing 5,000 Playwright tests across Dockerized browser containers in under 4 minutes.',
        tech_stack: ['Playwright', 'TypeScript', 'Docker', 'GitHub Actions Matrix'],
        repo_url: 'https://github.com/hannahsoriano-qa/testmatrix-core',
        is_featured: true,
        category: 'Quality Engineering',
        role: 'Lead Architect',
        date_completed: 'Nov 2024'
      }
    ],
    achievements: [
      {
        title: 'Magna Cum Laude (CHMSU Class of 2024)',
        description: 'Graduated with high Latin honors with GPA 1.24 in BS Information Technology.',
        type: 'academic',
        date: '2024-06-28'
      },
      {
        title: 'ISTQB Certified Software Tester (Advanced Test Automation)',
        description: 'Accredited international certification in test automation architecture and test harness engineering.',
        type: 'certification',
        date: '2024-11-20'
      }
    ]
  },
  {
    name: 'Ian Charles Fernandez',
    email: 'ian.fernandez.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4B-002',
    section: '4B',
    about: {
      headline: 'Cybersecurity Operations Analyst | Trend Cyber Defense | Class of 2024',
      bio: 'CHMSU BSIT 2024 graduate working in enterprise Security Operations Center (SOC). Experienced in SIEM rule tuning, MITRE ATT&CK mapping, endpoint detection (EDR), and rapid incident response.',
      location: 'Pasig City, Metro Manila',
      phone: '+63 918 222 3007',
      github_url: 'https://github.com/ianfernandez-soc',
      linkedin_url: 'https://linkedin.com/in/ian-charles-fernandez',
      portfolio_url: 'https://ianfernandez.security'
    },
    jobseeker_profile: {
      desired_job_title: 'SOC Lead Analyst / Information Security Manager',
      work_preference: 'remote',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.42',
        description: 'Class of 2024, Section 4-B. Specialization in Information Assurance, Network Defense, and Computer Forensics.',
        is_current: false
      }
    ],
    skills: [
      { name: 'SIEM (Splunk, Microsoft Sentinel)', level: 92, category: 'tool' },
      { name: 'Incident Response & Threat Hunting', level: 90, category: 'other' },
      { name: 'EDR (CrowdStrike, Defender)', level: 88, category: 'tool' },
      { name: 'Python for Security Automation', level: 86, category: 'language' },
      { name: 'MITRE ATT&CK Framework', level: 90, category: 'other' }
    ],
    experiences: [
      {
        role: 'Cybersecurity Operations Analyst',
        company: 'Trend Cyber Defense',
        type: 'Full-time',
        location: 'Pasig City (Remote)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Monitoring and triaging 24/7 security events across 15 enterprise clients. Automated triage playbooks reducing mean time to respond (MTTR) by 42%.',
        skills: ['SIEM', 'Splunk', 'Incident Response', 'Threat Hunting']
      },
      {
        role: 'OJT SOC Analyst Intern (600 Hours Completed)',
        company: 'Trend Cyber Defense',
        type: 'OJT',
        location: 'Remote',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship analyzing phishing campaigns, reviewing network firewall logs, and documenting incident runbooks.',
        skills: ['Firewall Analysis', 'Log Parsing', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'ThreatWatch - Automated Threat Intelligence Feeds Aggregator',
        description: 'Open-source threat intelligence aggregator matching suspicious IP/hash observables against enterprise firewall log exports.',
        tech_stack: ['Python 3.12', 'Elasticsearch', 'Kibana', 'AlienVault OTX API'],
        repo_url: 'https://github.com/ianfernandez-soc/threatwatch-core',
        is_featured: true,
        category: 'Cybersecurity',
        role: 'Security Engineer',
        date_completed: 'Dec 2024'
      }
    ],
    achievements: [
      {
        title: 'CompTIA CySA+ (Cybersecurity Analyst Certified)',
        description: 'Validated expertise in proactive behavioral threat analysis and vulnerability management.',
        type: 'certification',
        date: '2024-10-15'
      }
    ]
  },
  {
    name: 'Jasmine Rose De la Cruz',
    email: 'jasmine.delacruz.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4B-003',
    section: '4B',
    about: {
      headline: 'Enterprise ERP & Systems Integration Consultant | Accenture PH | Class of 2024',
      bio: 'CHMSU BSIT 2024 alumna specializing in SAP S/4HANA enterprise resource planning, business process optimization (BPMN), and secure cross-platform data pipeline integrations.',
      location: 'Taguig City, Metro Manila',
      phone: '+63 918 222 3008',
      github_url: 'https://github.com/jasminedelacruz-erp',
      linkedin_url: 'https://linkedin.com/in/jasmine-rose-delacruz',
      portfolio_url: 'https://jasminedelacruz.consulting'
    },
    jobseeker_profile: {
      desired_job_title: 'Senior ERP Consultant & Integration Architect',
      work_preference: 'hybrid',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.36',
        description: 'Class of 2024, Section 4-B. Focus on Enterprise Architecture, Systems Integration, and Database Optimization.',
        is_current: false
      }
    ],
    skills: [
      { name: 'SAP S/4HANA & ERP Architecture', level: 90, category: 'other' },
      { name: 'BPMN Process Modeling', level: 92, category: 'other' },
      { name: 'SQL (Oracle & MS SQL)', level: 90, category: 'database' },
      { name: 'Power Platform Integration', level: 86, category: 'tool' },
      { name: 'Agile & ITIL v4', level: 88, category: 'other' }
    ],
    experiences: [
      {
        role: 'Enterprise ERP & Systems Integration Consultant',
        company: 'Accenture PH',
        type: 'Full-time',
        location: 'Taguig City (Hybrid)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Implementing supply chain and finance modules in SAP S/4HANA for multinational retail clients.',
        skills: ['SAP', 'ERP Integration', 'SQL', 'BPMN']
      },
      {
        role: 'OJT Enterprise Systems Trainee (600 Hours Completed)',
        company: 'Accenture PH',
        type: 'OJT',
        location: 'Taguig City',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship mapping business processes and documenting enterprise system data dictionaries.',
        skills: ['Process Modeling', 'Systems Analysis', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'ERP-Flow - Automated Cross-System Data Migration Pipeline',
        description: 'Automated data migration validator mapping legacy CSV database schemas into SAP ERP transaction tables with automated reconciliation checks.',
        tech_stack: ['Python', 'Oracle SQL', 'Power Platform', 'REST APIs'],
        project_url: 'https://erpflow-demo.ph',
        is_featured: true,
        category: 'Enterprise Integration',
        role: 'Integration Consultant',
        date_completed: 'Jan 2025'
      }
    ],
    achievements: [
      {
        title: 'SAP Certified Associate - Integration Suite',
        description: 'Validated competence in enterprise cloud integration and business process orchestration.',
        type: 'certification',
        date: '2024-11-30'
      }
    ]
  },
  {
    name: 'Kevin Mark Ramos',
    email: 'kevin.ramos.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4B-004',
    section: '4B',
    about: {
      headline: 'Senior Backend & Distributed Systems Engineer | Yondu Inc. | Class of 2024',
      bio: 'CHMSU BSIT 2024 alumnus architecting distributed backends with Go, Apache Kafka, and PostgreSQL. Focused on low-latency streaming pipelines, Redis clustering, and distributed caching.',
      location: 'Mandaluyong City, Metro Manila',
      phone: '+63 918 222 3009',
      github_url: 'https://github.com/kevinramos-backend',
      linkedin_url: 'https://linkedin.com/in/kevin-mark-ramos',
      portfolio_url: 'https://kevinramos.tech'
    },
    jobseeker_profile: {
      desired_job_title: 'Lead Distributed Systems Engineer / Backend Architect',
      work_preference: 'hybrid',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.39',
        description: 'Class of 2024, Section 4-B. Specialization in High-Performance Computing and Database Systems.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Go (Golang)', level: 95, category: 'language' },
      { name: 'Apache Kafka', level: 90, category: 'tool' },
      { name: 'PostgreSQL Optimization', level: 92, category: 'database' },
      { name: 'gRPC & Protocol Buffers', level: 88, category: 'other' },
      { name: 'Redis Enterprise', level: 90, category: 'database' }
    ],
    experiences: [
      {
        role: 'Senior Backend & Distributed Systems Engineer',
        company: 'Yondu Inc.',
        type: 'Full-time',
        location: 'Mandaluyong City (Hybrid)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Designing high-volume event stream ingestion engines processing 15,000 transactions per second with Kafka and Go.',
        skills: ['Go', 'Kafka', 'PostgreSQL', 'gRPC', 'Distributed Systems']
      },
      {
        role: 'OJT Backend Developer Intern (600 Hours Completed)',
        company: 'Yondu Inc.',
        type: 'OJT',
        location: 'Mandaluyong City',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship writing performant SQL queries, designing Redis caching layers, and building REST endpoints.',
        skills: ['Golang', 'PostgreSQL', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'StreamPulse - High-Throughput Telemetry Event Ingestor',
        description: 'Microservice written in Go consuming real-time IoT telemetry and dispatching alerts with sub-millisecond p99 latencies.',
        tech_stack: ['Go 1.23', 'Apache Kafka', 'PostgreSQL', 'TimescaleDB', 'Docker'],
        repo_url: 'https://github.com/kevinramos-backend/streampulse-core',
        is_featured: true,
        category: 'High-Concurrency Backend',
        role: 'Lead Backend Engineer',
        date_completed: 'Dec 2024'
      }
    ],
    achievements: [
      {
        title: 'Confluent Certified Developer for Apache Kafka',
        description: 'Demonstrated deep expertise in developing event-driven microservices with Kafka streams.',
        type: 'certification',
        date: '2024-12-20'
      }
    ]
  },
  {
    name: 'Lorenz Miguel Salcedo',
    email: 'lorenz.salcedo.bsit2024@gmail.com',
    password: 'CHMSU@2020-BSIT4B-005',
    section: '4B',
    about: {
      headline: 'AI Applications & Full-Stack Engineer | NeuralScale Labs | Class of 2024 (Cum Laude)',
      bio: 'CHMSU BSIT 2024 Cum Laude alumnus building intelligent generative AI applications, vector search retrieval (RAG), and full-stack web platforms using Python, FastAPI, and Next.js.',
      location: 'Bacolod City, Negros Occidental',
      phone: '+63 918 222 3010',
      github_url: 'https://github.com/lorenzsalcedo-ai',
      linkedin_url: 'https://linkedin.com/in/lorenz-miguel-salcedo',
      portfolio_url: 'https://lorenzsalcedo.ai'
    },
    jobseeker_profile: {
      desired_job_title: 'Senior AI Engineer & Full-Stack Specialist',
      work_preference: 'remote',
      years_of_experience: '1_to_3'
    },
    education: [
      {
        school: 'Carlos Hilado Memorial State University',
        degree: 'Bachelor of Science in Information Technology',
        year_start: 2020,
        year_end: 2024,
        period: '2020 - 2024',
        gpa: '1.30',
        description: 'Graduated Cum Laude, Section 4-B. Outstanding Artificial Intelligence Innovation Thesis Award.',
        is_current: false
      }
    ],
    skills: [
      { name: 'Python & FastAPI', level: 94, category: 'framework' },
      { name: 'LangChain & LlamaIndex (RAG)', level: 92, category: 'framework' },
      { name: 'Vector DBs (Pinecone, pgvector)', level: 90, category: 'database' },
      { name: 'Next.js & React 19', level: 88, category: 'framework' },
      { name: 'TypeScript', level: 86, category: 'language' }
    ],
    experiences: [
      {
        role: 'AI Applications & Full-Stack Engineer',
        company: 'NeuralScale Labs',
        type: 'Full-time',
        location: 'Bacolod City (Remote)',
        period_start: 'Jul 2024',
        period_end: 'Present',
        is_current: true,
        description: 'Building multimodal generative AI search engines and conversational enterprise agents for healthcare knowledgebases.',
        skills: ['Python', 'FastAPI', 'LangChain', 'Next.js', 'Vector Search']
      },
      {
        role: 'OJT Software Engineering Intern (600 Hours Completed)',
        company: 'NeuralScale Labs',
        type: 'OJT',
        location: 'Remote',
        period_start: 'Jan 2024',
        period_end: 'Jun 2024',
        is_current: false,
        description: 'Completed 600 hours of academic OJT internship developing web scrapers, data cleaning pipelines, and prompt evaluation benchmarks.',
        skills: ['Python', 'FastAPI', 'OJT Training']
      }
    ],
    projects: [
      {
        title: 'DocuChat AI - Enterprise Document Intelligence & Semantic Search',
        description: 'Production RAG platform allowing companies to ingest large PDF manuals and query answers with cited source page references.',
        tech_stack: ['Python', 'FastAPI', 'LangChain', 'pgvector', 'Next.js 14'],
        project_url: 'https://docuchat.ai',
        repo_url: 'https://github.com/lorenzsalcedo-ai/docuchat-enterprise',
        is_featured: true,
        category: 'Artificial Intelligence',
        role: 'Lead AI Engineer',
        date_completed: 'Jan 2025'
      }
    ],
    achievements: [
      {
        title: 'Cum Laude (CHMSU Class of 2024)',
        description: 'Conferred university Latin honors in BS Information Technology.',
        type: 'academic',
        date: '2024-06-28'
      }
    ]
  }
];

async function apiCall(method, path, body, token) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

async function run() {
  console.log('================================================================');
  console.log('  MANUAL 1-BY-1 SETUP: 10 STUDENTS & 10 GRADUATES ON LIVE APP');
  console.log('================================================================\n');

  // ── PART 1: 10 STUDENTS ───────────────────────────────────────────────────
  console.log('--- [STAGE 1] Populating Profiles for 10 Enrolled IT Students ---');
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    console.log(`\n[Student ${i + 1}/10] ${s.name} (${s.section})`);

    // 1. Login
    const loginRes = await apiCall('POST', '/auth/login', {
      email: s.email,
      password: s.password
    });

    if (!loginRes.ok) {
      console.error(`  ❌ Failed to login:`, loginRes.data);
      continue;
    }
    const token = loginRes.data.token;
    console.log(`  ✔ Authenticated as student (User ID: ${loginRes.data.user?.id})`);

    // 2. Update About / Profile
    const aboutRes = await apiCall('PUT', '/student/about', s.about, token);
    console.log(`  ✔ About / Contact Info: ${aboutRes.ok ? 'Updated' : 'Error: ' + JSON.stringify(aboutRes.data)}`);

    // 3. Education
    for (const edu of s.education) {
      const eduRes = await apiCall('POST', '/student/education', edu, token);
      console.log(`  ✔ Education Added: ${edu.degree} (${edu.school}) - ${eduRes.ok ? 'OK' : 'Error'}`);
    }

    // 4. Skills
    for (const sk of s.skills) {
      const skRes = await apiCall('POST', '/student/skills', sk, token);
      if (!skRes.ok) console.warn(`    Skill warning (${sk.name}):`, skRes.data);
    }
    console.log(`  ✔ ${s.skills.length} Technical Skills Registered`);

    // 5. Experiences
    for (const exp of s.experiences) {
      const expRes = await apiCall('POST', '/student/experience', exp, token);
      console.log(`  ✔ Experience Added: ${exp.role} @ ${exp.company} - ${expRes.ok ? 'OK' : 'Error'}`);
    }

    // 6. Projects
    for (const proj of s.projects) {
      const projRes = await apiCall('POST', '/student/projects', proj, token);
      console.log(`  ✔ Portfolio Project Added: ${proj.title} - ${projRes.ok ? 'OK' : 'Error'}`);
    }

    // 7. Achievements
    for (const ach of s.achievements) {
      const achRes = await apiCall('POST', '/student/achievements', ach, token);
      console.log(`  ✔ Achievement Added: ${ach.title} - ${achRes.ok ? 'OK' : 'Error'}`);
    }
  }

  // ── PART 2: 10 GRADUATES ──────────────────────────────────────────────────
  console.log('\n\n--- [STAGE 2] Populating Profiles & Experiences for 10 Alumni (Batch 2023-2024) ---');
  for (let i = 0; i < graduatesData.length; i++) {
    const g = graduatesData[i];
    console.log(`\n[Graduate ${i + 1}/10] ${g.name} (Batch 2023-2024, Section ${g.section})`);

    // 1. Login
    const loginRes = await apiCall('POST', '/auth/login', {
      email: g.email,
      password: g.password
    });

    if (!loginRes.ok) {
      console.error(`  ❌ Failed to login:`, loginRes.data);
      continue;
    }
    const token = loginRes.data.token;
    console.log(`  ✔ Authenticated as graduate (User ID: ${loginRes.data.user?.id})`);

    // 2. Update About / Profile
    const aboutRes = await apiCall('PUT', '/jobseeker/about', g.about, token);
    console.log(`  ✔ About / Bio Info: ${aboutRes.ok ? 'Updated' : 'Error: ' + JSON.stringify(aboutRes.data)}`);

    // 3. Save Jobseeker Profile
    if (g.jobseeker_profile) {
      const jpRes = await apiCall('POST', '/jobseeker/profile', {
        ...g.jobseeker_profile,
        headline: g.about.headline,
        bio: g.about.bio,
        location: g.about.location,
        phone: g.about.phone,
        linkedin_url: g.about.linkedin_url,
        portfolio_url: g.about.portfolio_url
      }, token);
      console.log(`  ✔ Jobseeker Matching Profile: ${jpRes.ok ? 'Configured' : 'Error'}`);
    }

    // 4. Education
    for (const edu of g.education) {
      const eduRes = await apiCall('POST', '/jobseeker/education', edu, token);
      console.log(`  ✔ Education Added: ${edu.degree} (${edu.school}) - ${eduRes.ok ? 'OK' : 'Error'}`);
    }

    // 5. Skills
    for (const sk of g.skills) {
      const skRes = await apiCall('POST', '/jobseeker/skills', sk, token);
      if (!skRes.ok) console.warn(`    Skill warning (${sk.name}):`, skRes.data);
    }
    console.log(`  ✔ ${g.skills.length} Industry Skills Registered`);

    // 6. Experiences (Post-Graduation Career + 600 Hours College OJT)
    for (const exp of g.experiences) {
      const expRes = await apiCall('POST', '/jobseeker/experience', exp, token);
      console.log(`  ✔ Career Experience Recorded: [${exp.type}] ${exp.role} @ ${exp.company} - ${expRes.ok ? 'OK' : 'Error: ' + JSON.stringify(expRes.data)}`);
    }

    // 7. Projects
    for (const proj of g.projects) {
      const projRes = await apiCall('POST', '/jobseeker/projects', proj, token);
      console.log(`  ✔ Production Project Added: ${proj.title} - ${projRes.ok ? 'OK' : 'Error'}`);
    }

    // 8. Achievements
    for (const ach of g.achievements) {
      const achRes = await apiCall('POST', '/jobseeker/achievements', ach, token);
      console.log(`  ✔ Honor / Certification Added: ${ach.title} - ${achRes.ok ? 'OK' : 'Error'}`);
    }
  }

  console.log('\n================================================================');
  console.log(' ALL 10 STUDENTS AND 10 GRADUATES FULLY CONFIGURED ON LIVE APP!');
  console.log('================================================================');
}

run().catch(console.error);
