const https = require('https');

function apiCall(path, method, postData, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Accept': 'application/json' };
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = https.request('https://stoned.onrender.com' + path, { method, headers }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch(e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

const graduates = [
  // ── BATCH 2025-2026 · SECTION A ──
  {
    email: 'andrea.villanueva.bsit2026a@gmail.com',
    name: 'Andrea Mae Villanueva',
    headline: 'Full-Stack Web Developer | Laravel · Vue.js · MySQL',
    bio: 'CHMSU BSIT Class of 2026 graduate passionate about building scalable web applications with clean, maintainable code. Experienced in the Laravel and Vue.js ecosystems with a strong foundation in relational database design.',
    desired_job_title: 'Full-Stack Web Developer',
    work_preference: 'hybrid',
    years_of_experience: 'fresh_graduate',
    location: 'Makati City, Metro Manila',
    phone: '0917-312-4501',
    experiences: [
      {
        role: 'Junior Full-Stack Developer',
        company: 'Exist Software Labs',
        location: 'Makati City, Metro Manila',
        type: 'Full-time',
        period_start: 'Jul 2026',
        period_end: null,
        is_current: true,
        description: 'Developing and maintaining internal business applications using Laravel 11 and Vue 3. Collaborating with senior engineers on REST API design, database schema migrations, and automated testing pipelines.',
        skills: ['Laravel', 'Vue.js', 'MySQL', 'REST API', 'Git']
      }
    ]
  },
  {
    email: 'carlo.reyes.bsit2026a@gmail.com',
    name: 'Carlo James Reyes',
    headline: 'Frontend Developer | React · Next.js · Tailwind CSS',
    bio: 'Detail-oriented frontend developer from CHMSU BSIT Class of 2026. Focused on creating responsive, accessible, and performant user interfaces with modern JavaScript frameworks.',
    desired_job_title: 'Frontend Developer',
    work_preference: 'remote',
    years_of_experience: 'fresh_graduate',
    location: 'Bacolod City, Negros Occidental',
    phone: '0928-451-7823',
    experiences: [
      {
        role: 'Frontend Developer',
        company: 'Yondu Inc.',
        location: 'Taguig City (BGC), Metro Manila',
        type: 'Full-time',
        period_start: 'Aug 2026',
        period_end: null,
        is_current: true,
        description: 'Building responsive React.js interfaces for enterprise SaaS clients. Implementing component-driven development with TypeScript and Tailwind CSS in a Next.js environment, ensuring WCAG accessibility compliance.',
        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma']
      }
    ]
  },
  {
    email: 'maria.santos.bsit2026a@gmail.com',
    name: 'Maria Elena Santos',
    headline: 'Data Analyst & ML Enthusiast | Python · Pandas · Tableau',
    bio: 'CHMSU BSIT Class of 2026 graduate with a passion for extracting actionable insights from data. Skilled in Python, machine learning fundamentals, and dashboard visualization with Tableau.',
    desired_job_title: 'Junior Data Analyst',
    work_preference: 'hybrid',
    years_of_experience: 'fresh_graduate',
    location: 'Cebu City, Cebu',
    phone: '0935-219-6047',
    experiences: [
      {
        role: 'Junior Data Analyst',
        company: 'Sprout Solutions',
        location: 'Cebu City, Cebu',
        type: 'Full-time',
        period_start: 'Jul 2026',
        period_end: null,
        is_current: true,
        description: 'Analysing HR and payroll datasets using Python and SQL to surface workforce trends. Building interactive Tableau dashboards for executive reporting and client presentations.',
        skills: ['Python', 'SQL', 'Tableau', 'Pandas', 'Data Visualization']
      }
    ]
  },
  {
    email: 'joshua.delacruz.bsit2026a@gmail.com',
    name: 'Joshua Rafael Dela Cruz',
    headline: 'Junior DevOps Engineer | Docker · AWS · Kubernetes',
    bio: 'Infrastructure-minded BSIT graduate from CHMSU Class of 2026. Experienced in containerisation, CI/CD pipeline automation, and cloud-native deployments on AWS.',
    desired_job_title: 'DevOps Engineer',
    work_preference: 'onsite',
    years_of_experience: 'fresh_graduate',
    location: 'Quezon City, Metro Manila',
    phone: '0956-804-3129',
    experiences: [
      {
        role: 'Junior DevOps Engineer',
        company: 'FullSpeed Technologies',
        location: 'Quezon City, Metro Manila',
        type: 'Full-time',
        period_start: 'Aug 2026',
        period_end: null,
        is_current: true,
        description: 'Managing CI/CD pipelines with GitHub Actions and Jenkins for multi-environment deployments. Containerising applications with Docker and orchestrating workloads on AWS EKS (Kubernetes).',
        skills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Linux']
      }
    ]
  },
  {
    email: 'kristine.florido.bsit2026a@gmail.com',
    name: 'Kristine Joy Florido',
    headline: 'UI/UX Designer | Figma · Adobe XD · Prototyping',
    bio: 'Creative UI/UX designer from CHMSU BSIT Class of 2026. Combining design thinking with front-end awareness to craft intuitive, visually appealing digital products.',
    desired_job_title: 'UI/UX Designer',
    work_preference: 'hybrid',
    years_of_experience: 'fresh_graduate',
    location: 'Iloilo City, Iloilo',
    phone: '0919-637-1284',
    experiences: [
      {
        role: 'UI/UX Designer',
        company: 'Appetiser Apps',
        location: 'Remote (Philippines)',
        type: 'Full-time',
        period_start: 'Jul 2026',
        period_end: null,
        is_current: true,
        description: 'Designing mobile and web app interfaces in Figma for international clients. Conducting user research, creating wireframes and high-fidelity prototypes, and collaborating with developers during hand-off.',
        skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Adobe XD']
      }
    ]
  },

  // ── BATCH 2025-2026 · SECTION B ──
  {
    email: 'miguel.fernandez.bsit2026b@gmail.com',
    name: 'Miguel Antonio Fernandez',
    headline: 'Backend Developer | Node.js · Express · MongoDB',
    bio: 'Backend-focused BSIT graduate from CHMSU Class of 2026 Section B. Passionate about building robust server-side applications, RESTful APIs, and scalable microservice architectures.',
    desired_job_title: 'Backend Developer',
    work_preference: 'onsite',
    years_of_experience: 'fresh_graduate',
    location: 'Taguig City (BGC), Metro Manila',
    phone: '0945-712-3865',
    experiences: [
      {
        role: 'Junior Backend Developer',
        company: 'Pointwest Technologies Corp.',
        location: 'Taguig City (BGC), Metro Manila',
        type: 'Full-time',
        period_start: 'Sep 2026',
        period_end: null,
        is_current: true,
        description: 'Developing RESTful APIs and event-driven microservices using Node.js and Express for fintech clients. Working with MongoDB and Redis for data persistence and caching layers.',
        skills: ['Node.js', 'Express.js', 'MongoDB', 'Redis', 'REST API']
      }
    ]
  },
  {
    email: 'leilani.espiritu.bsit2026b@gmail.com',
    name: 'Leilani Grace Espiritu',
    headline: 'Cybersecurity Enthusiast | Penetration Testing · Network Security',
    bio: 'CHMSU BSIT Class of 2026 Section B graduate with a strong interest in cybersecurity. Currently building professional experience while pursuing industry certifications in information security.',
    desired_job_title: 'Cybersecurity Analyst',
    work_preference: 'onsite',
    years_of_experience: 'less_than_1',
    location: 'Bacolod City, Negros Occidental',
    phone: '0977-451-2039',
    experiences: [
      {
        role: 'Customer Service Representative',
        company: 'Concentrix',
        location: 'Bacolod City, Negros Occidental',
        type: 'Full-time',
        period_start: 'Aug 2026',
        period_end: null,
        is_current: true,
        description: 'Providing technical customer support for a US-based telecommunications client. Handling escalations and troubleshooting customer account issues while pursuing CompTIA Security+ certification part-time.',
        skills: ['Customer Service', 'Technical Support', 'CRM Tools', 'Communication']
      }
    ]
  },
  {
    email: 'rhon.magbanua.bsit2026b@gmail.com',
    name: 'Rhon Christopher Magbanua',
    headline: 'Mobile Application Developer | Flutter · Dart · Firebase',
    bio: 'Cross-platform mobile developer from CHMSU BSIT Class of 2026 Section B. Building seamless Android and iOS experiences with Flutter, backed by Firebase cloud services.',
    desired_job_title: 'Mobile App Developer',
    work_preference: 'remote',
    years_of_experience: 'fresh_graduate',
    location: 'Silay City, Negros Occidental',
    phone: '0920-138-5742',
    experiences: [
      {
        role: 'Mobile Application Developer',
        company: 'White Cloak Technologies',
        location: 'Remote (Philippines)',
        type: 'Full-time',
        period_start: 'Jul 2026',
        period_end: null,
        is_current: true,
        description: 'Building cross-platform mobile applications using Flutter and Dart for e-commerce and logistics clients. Integrating Firebase Authentication, Cloud Firestore, and push notifications into production apps.',
        skills: ['Flutter', 'Dart', 'Firebase', 'Mobile Development', 'REST API']
      }
    ]
  },
  {
    email: 'sheila.pedrosa.bsit2026b@gmail.com',
    name: 'Sheila Mae Pedrosa',
    headline: 'Database Administration | PostgreSQL · Oracle · SQL Server',
    bio: 'CHMSU BSIT Class of 2026 Section B graduate specializing in database administration. Currently gaining professional experience while seeking opportunities in database management and data engineering.',
    desired_job_title: 'Database Administrator',
    work_preference: 'onsite',
    years_of_experience: 'fresh_graduate',
    location: 'Talisay City, Negros Occidental',
    phone: '0936-295-8103',
    experiences: [
      {
        role: 'Administrative Assistant',
        company: 'Negrense Volunteers for Change Foundation Inc.',
        location: 'Talisay City, Negros Occidental',
        type: 'Full-time',
        period_start: 'Aug 2026',
        period_end: null,
        is_current: true,
        description: 'Managing office documentation, scheduling, and correspondence for the NGO. Supporting program coordinators with data entry, report generation, and filing — applying organisational skills while seeking a database administration role.',
        skills: ['Microsoft Office', 'Data Entry', 'Office Administration', 'Communication']
      }
    ]
  },
  {
    email: 'aldrin.lacaba.bsit2026b@gmail.com',
    name: 'Aldrin Jay Lacaba',
    headline: 'Software Engineer | Java · Spring Boot · Microservices',
    bio: 'Enterprise software engineer from CHMSU BSIT Class of 2026 Section B. Strong foundations in Spring Boot, microservice architecture, and clean code principles applied in a Fortune 500 consulting environment.',
    desired_job_title: 'Software Engineer',
    work_preference: 'hybrid',
    years_of_experience: 'fresh_graduate',
    location: 'Makati City, Metro Manila',
    phone: '0918-473-6291',
    experiences: [
      {
        role: 'Junior Software Engineer',
        company: 'Accenture Philippines',
        location: 'Makati City, Metro Manila',
        type: 'Full-time',
        period_start: 'Jul 2026',
        period_end: null,
        is_current: true,
        description: 'Contributing to enterprise Java applications using Spring Boot and microservice architecture for banking and insurance clients. Participating in Agile sprints, code reviews, and continuous integration pipelines.',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Maven', 'Agile']
      }
    ]
  },

  // ── BATCH 2024-2025 · SECTION A ──
  {
    email: 'pia.tagalog.bsit2025a@gmail.com',
    name: 'Pia Corazon Tagalog',
    headline: 'IT Project Coordinator | Agile · Scrum · JIRA',
    bio: 'Tech-savvy project coordinator from CHMSU BSIT Class of 2025 Section A. Leveraging Agile methodologies and JIRA to deliver software projects on time and within budget. Previously built IT support experience before transitioning into project management.',
    desired_job_title: 'IT Project Coordinator',
    work_preference: 'hybrid',
    years_of_experience: '1_to_3',
    location: 'Makati City, Metro Manila',
    phone: '0917-854-2306',
    experiences: [
      {
        role: 'IT Helpdesk Associate',
        company: 'MicroSourcing',
        location: 'Manila, Metro Manila',
        type: 'Full-time',
        period_start: 'Jun 2025',
        period_end: 'Feb 2026',
        is_current: false,
        description: 'Provided tier-1 technical support for 500+ internal employees. Managed service desk tickets in ServiceNow, performed hardware/software troubleshooting, and maintained asset inventory documentation.',
        skills: ['Technical Support', 'ServiceNow', 'Troubleshooting', 'Asset Management']
      },
      {
        role: 'IT Project Coordinator',
        company: 'CloudStaff',
        location: 'Makati City, Metro Manila',
        type: 'Full-time',
        period_start: 'Mar 2026',
        period_end: null,
        is_current: true,
        description: 'Coordinating cross-functional software delivery teams across two time zones using Scrum methodology. Managing sprint backlogs in JIRA, facilitating stand-ups and retrospectives, and reporting project health metrics to stakeholders.',
        skills: ['Agile/Scrum', 'JIRA', 'Confluence', 'Project Management', 'Risk Management']
      }
    ]
  },
  {
    email: 'bernard.delossantos.bsit2025a@gmail.com',
    name: 'Bernard Kristoffer Delos Santos',
    headline: 'Cloud Solutions Architect | Azure · GCP · Kubernetes',
    bio: 'Cloud architect from CHMSU BSIT Class of 2025 Section A, designing resilient, scalable, and cost-effective solutions on Azure and GCP. Progressed from cloud engineering to solutions architecture within the first year of professional experience.',
    desired_job_title: 'Cloud Solutions Architect',
    work_preference: 'hybrid',
    years_of_experience: '1_to_3',
    location: 'Taguig City (BGC), Metro Manila',
    phone: '0955-310-4872',
    experiences: [
      {
        role: 'Junior Cloud Engineer',
        company: 'Stratpoint Technologies',
        location: 'Makati City, Metro Manila',
        type: 'Full-time',
        period_start: 'Jul 2025',
        period_end: 'Mar 2026',
        is_current: false,
        description: 'Provisioned and managed cloud infrastructure on GCP and AWS. Automated infrastructure-as-code deployments with Terraform and maintained Kubernetes clusters for containerised micro-service workloads.',
        skills: ['GCP', 'AWS', 'Terraform', 'Kubernetes', 'Docker']
      },
      {
        role: 'Cloud Solutions Architect',
        company: 'KMC Solutions',
        location: 'Taguig City (BGC), Metro Manila',
        type: 'Full-time',
        period_start: 'Apr 2026',
        period_end: null,
        is_current: true,
        description: 'Designing hybrid-cloud architectures on Microsoft Azure and GCP for BPO and fintech clients. Leading migration assessments, drafting architecture decision records, and mentoring junior cloud engineers on Helm-based deployments.',
        skills: ['Microsoft Azure', 'GCP', 'Kubernetes', 'Helm', 'Cloud Architecture']
      }
    ]
  },
  {
    email: 'rachelle.paras.bsit2025a@gmail.com',
    name: 'Rachelle Anne Paras',
    headline: 'Business Intelligence Developer | Power BI · Tableau · SQL',
    bio: 'BI developer from CHMSU BSIT Class of 2025 Section A, transforming raw data into actionable business insights through compelling dashboards and reports. Transitioned from a data entry role into full-time analytics.',
    desired_job_title: 'BI Developer',
    work_preference: 'hybrid',
    years_of_experience: '1_to_3',
    location: 'Cebu City, Cebu',
    phone: '0927-614-8053',
    experiences: [
      {
        role: 'Data Entry Specialist',
        company: 'Qualfon Philippines',
        location: 'Cebu City, Cebu',
        type: 'Full-time',
        period_start: 'Jun 2025',
        period_end: 'Dec 2025',
        is_current: false,
        description: 'Processed and validated large volumes of customer records into the CRM system with 99.8 % accuracy. Identified data quality issues and proposed standardisation rules adopted by the team lead.',
        skills: ['Data Entry', 'Microsoft Excel', 'CRM', 'Attention to Detail']
      },
      {
        role: 'Business Intelligence Developer',
        company: 'Collabera Digital',
        location: 'Cebu City, Cebu',
        type: 'Full-time',
        period_start: 'Jan 2026',
        period_end: null,
        is_current: true,
        description: 'Building Power BI and Tableau dashboards for e-commerce and logistics clients. Writing complex SQL queries for data extraction, creating DAX measures, and automating scheduled data refreshes for executive KPI reports.',
        skills: ['Power BI', 'Tableau', 'SQL', 'DAX', 'Excel']
      }
    ]
  },
  {
    email: 'jericho.cabanero.bsit2025a@gmail.com',
    name: 'Jericho Erwin Cabañero',
    headline: 'IoT Solutions Developer | C/C++ · Arduino · Raspberry Pi',
    bio: 'IoT engineer from CHMSU BSIT Class of 2025 Section A, designing edge computing solutions and real-time embedded systems for smart environments. Progressed from hardware support to dedicated IoT development.',
    desired_job_title: 'IoT Developer',
    work_preference: 'onsite',
    years_of_experience: '1_to_3',
    location: 'Quezon City, Metro Manila',
    phone: '0936-127-5904',
    experiences: [
      {
        role: 'Hardware Technician',
        company: 'Globe Telecom IT Services',
        location: 'Iloilo City, Iloilo',
        type: 'Full-time',
        period_start: 'Jul 2025',
        period_end: 'May 2026',
        is_current: false,
        description: 'Installed, configured, and maintained network equipment (routers, switches, access points) for enterprise clients in Western Visayas. Conducted site surveys and resolved hardware faults within SLA windows.',
        skills: ['Networking', 'Hardware Troubleshooting', 'Cisco', 'Site Surveys']
      },
      {
        role: 'IoT Solutions Developer',
        company: 'Enstack Technologies',
        location: 'Quezon City, Metro Manila',
        type: 'Full-time',
        period_start: 'Jun 2026',
        period_end: null,
        is_current: true,
        description: 'Developing firmware for ESP32 and Raspberry Pi edge devices that collect sensor data for smart-logistics monitoring. Building MQTT-based telemetry pipelines and companion dashboards with Python and Flask.',
        skills: ['C/C++', 'Arduino', 'Raspberry Pi', 'MQTT', 'Python']
      }
    ]
  },
  {
    email: 'noreen.belarmino.bsit2025a@gmail.com',
    name: 'Noreen Faith Belarmino',
    headline: 'IT Support Specialist | ITIL · Windows Server · Active Directory',
    bio: 'IT support professional from CHMSU BSIT Class of 2025 Section A, delivering tier-1/2 technical assistance with strong expertise in Windows Server environments and enterprise service management.',
    desired_job_title: 'IT Support Specialist',
    work_preference: 'onsite',
    years_of_experience: '1_to_3',
    location: 'Makati City, Metro Manila',
    phone: '0918-345-7621',
    experiences: [
      {
        role: 'Help Desk Technician',
        company: 'TaskUs',
        location: 'Bacolod City, Negros Occidental',
        type: 'Full-time',
        period_start: 'Jun 2025',
        period_end: 'Jan 2026',
        is_current: false,
        description: 'Resolved 40+ tickets per day covering hardware, software, VPN, and O365 issues for a globally distributed workforce. Maintained 97 % SLA compliance and created knowledge-base articles to reduce repeat incidents.',
        skills: ['Help Desk', 'Troubleshooting', 'Office 365', 'VPN', 'ITIL']
      },
      {
        role: 'IT Support Specialist',
        company: 'PLDT Enterprise',
        location: 'Makati City, Metro Manila',
        type: 'Full-time',
        period_start: 'Feb 2026',
        period_end: null,
        is_current: true,
        description: 'Managing Windows Server 2022 and Active Directory for 300+ corporate users. Handling Group Policy administration, endpoint security patching, and on-site network infrastructure troubleshooting for the Makati campus.',
        skills: ['Windows Server', 'Active Directory', 'ITIL Framework', 'Networking', 'Office 365']
      }
    ]
  },

  // ── BATCH 2024-2025 · SECTION B ──
  {
    email: 'lorenz.amparo.bsit2025b@gmail.com',
    name: 'Lorenz Benedict Amparo',
    headline: 'Game Developer | Unity · C# · 3D Modeling',
    bio: 'Indie game developer from CHMSU BSIT Class of 2025 Section B. Crafting immersive 2D/3D experiences with Unity while freelancing on game jams and contract projects.',
    desired_job_title: 'Game Developer',
    work_preference: 'remote',
    years_of_experience: '1_to_3',
    location: 'Bacolod City, Negros Occidental',
    phone: '0955-821-4063',
    experiences: [
      {
        role: 'Barista / Service Crew',
        company: "Bo's Coffee",
        location: 'Bacolod City, Negros Occidental',
        type: 'Part-time',
        period_start: 'Jun 2025',
        period_end: 'Dec 2025',
        is_current: false,
        description: 'Worked part-time as barista to support living expenses while building a freelance game development portfolio. Developed time management and customer service skills in a fast-paced environment.',
        skills: ['Customer Service', 'Time Management', 'Teamwork']
      },
      {
        role: 'Freelance Game Developer',
        company: 'Self-Employed (Freelance)',
        location: 'Remote (Philippines)',
        type: 'Freelance',
        period_start: 'Jan 2026',
        period_end: null,
        is_current: true,
        description: 'Designing and developing indie 2D/3D games using Unity and C#. Completed three contract game-jam projects and published a mobile puzzle game on Google Play. Handling all aspects from gameplay programming to Blender asset creation.',
        skills: ['Unity', 'C#', 'Blender', 'Game Design', 'Shader Graph']
      }
    ]
  },
  {
    email: 'carla.orbeta.bsit2025b@gmail.com',
    name: 'Carla Mikaela Orbeta',
    headline: 'E-Commerce & Digital Marketing | Shopify · SEO · Google Analytics',
    bio: 'Tech-savvy digital marketer from CHMSU BSIT Class of 2025 Section B. Bridging e-commerce platforms with data analytics. Currently working in retail while exploring digital marketing opportunities.',
    desired_job_title: 'Digital Marketing Specialist',
    work_preference: 'onsite',
    years_of_experience: '1_to_3',
    location: 'Bacolod City, Negros Occidental',
    phone: '0917-932-5140',
    experiences: [
      {
        role: 'Social Media Assistant',
        company: 'BPO Bridge Corp.',
        location: 'Bacolod City, Negros Occidental',
        type: 'Contract',
        period_start: 'Jun 2025',
        period_end: 'Oct 2025',
        is_current: false,
        description: 'Managed social media accounts for three small business clients. Created content calendars, designed Canva graphics, and tracked engagement metrics using Meta Business Suite.',
        skills: ['Social Media Management', 'Canva', 'Content Creation', 'Meta Business Suite']
      },
      {
        role: 'Sales Associate',
        company: 'SM Retail Inc.',
        location: 'Bacolod City, Negros Occidental',
        type: 'Full-time',
        period_start: 'Nov 2025',
        period_end: null,
        is_current: true,
        description: 'Assisting customers and managing point-of-sale transactions in the electronics department. Building product knowledge and customer rapport while actively seeking opportunities in e-commerce and digital marketing.',
        skills: ['Sales', 'Customer Service', 'POS Systems', 'Product Knowledge']
      }
    ]
  },
  {
    email: 'franco.delgado.bsit2025b@gmail.com',
    name: 'Franco Emmanuel Delgado',
    headline: 'Blockchain Developer | Solidity · Ethereum · Web3.js',
    bio: 'Blockchain enthusiast from CHMSU BSIT Class of 2025 Section B. Experienced with Solidity smart contracts and decentralised applications. Currently building skills in Web3 while working as an online tutor.',
    desired_job_title: 'Blockchain Developer',
    work_preference: 'remote',
    years_of_experience: '1_to_3',
    location: 'Talisay City, Negros Occidental',
    phone: '0978-216-3504',
    experiences: [
      {
        role: 'Online English Tutor',
        company: '51Talk Philippines',
        location: 'Remote (Philippines)',
        type: 'Part-time',
        period_start: 'Aug 2025',
        period_end: null,
        is_current: true,
        description: 'Teaching conversational English to international students through an online platform. Developing lesson plans and providing personalised feedback while pursuing blockchain development projects on the side.',
        skills: ['Teaching', 'Communication', 'Lesson Planning', 'Online Platforms']
      }
    ]
  },
  {
    email: 'jenalyn.gallo.bsit2025b@gmail.com',
    name: 'Jenalyn Rose Gallo',
    headline: 'Systems Analyst | SDLC · UML · Confluence',
    bio: 'Systems analyst from CHMSU BSIT Class of 2025 Section B specialising in requirements engineering, process modelling, and technical documentation for enterprise software systems.',
    desired_job_title: 'Systems Analyst',
    work_preference: 'hybrid',
    years_of_experience: '1_to_3',
    location: 'Iloilo City, Iloilo',
    phone: '0919-405-8713',
    experiences: [
      {
        role: 'Junior Systems Analyst',
        company: 'Ingenuity Global Solutions',
        location: 'Iloilo City, Iloilo',
        type: 'Full-time',
        period_start: 'Jul 2025',
        period_end: 'Apr 2026',
        is_current: false,
        description: 'Gathered and documented business requirements using UML activity and sequence diagrams. Supported QA testing efforts by writing test cases and tracking defects in Jira for an Australian insurance client.',
        skills: ['UML', 'Requirements Gathering', 'JIRA', 'QA Testing', 'Confluence']
      },
      {
        role: 'Systems Analyst',
        company: 'Alliance Software Inc.',
        location: 'Iloilo City, Iloilo',
        type: 'Full-time',
        period_start: 'May 2026',
        period_end: null,
        is_current: true,
        description: 'Leading requirements analysis and system design for ERP and CRM projects. Producing functional specifications, process flow diagrams, and data dictionaries in Confluence. Bridging stakeholder needs with the development team using Agile SDLC.',
        skills: ['SDLC', 'UML', 'Confluence', 'Visio', 'SQL']
      }
    ]
  },
  {
    email: 'roel.suarez.bsit2025b@gmail.com',
    name: 'Roel Dominic Suarez',
    headline: 'Network Engineer | Cisco · CCNA · VPN & WAN Infrastructure',
    bio: 'Network engineer from CHMSU BSIT Class of 2025 Section B, designing and maintaining enterprise-grade LAN/WAN infrastructure with Cisco routing and switching expertise.',
    desired_job_title: 'Network Engineer',
    work_preference: 'onsite',
    years_of_experience: '1_to_3',
    location: 'Manila, Metro Manila',
    phone: '0920-374-1856',
    experiences: [
      {
        role: 'Network Support Technician',
        company: 'Booth & Partners',
        location: 'Cebu City, Cebu',
        type: 'Full-time',
        period_start: 'Jun 2025',
        period_end: 'Feb 2026',
        is_current: false,
        description: 'Monitored and maintained LAN/WAN infrastructure for a 200-seat BPO facility. Configured VLANs, VPN tunnels, and firewall rules on Cisco Catalyst switches and FortiGate appliances.',
        skills: ['Cisco', 'VLAN', 'VPN', 'Firewall', 'Network Monitoring']
      },
      {
        role: 'Network Engineer',
        company: 'Navitaire Philippines (Amadeus)',
        location: 'Manila, Metro Manila',
        type: 'Full-time',
        period_start: 'Mar 2026',
        period_end: null,
        is_current: true,
        description: 'Designing and maintaining enterprise WAN infrastructure supporting airline reservation systems. Managing Cisco routing/switching estates, IPsec VPN tunnels, and Wireshark-based performance analysis across three data-centre locations.',
        skills: ['Cisco IOS', 'CCNA', 'VPN', 'Wireshark', 'WAN Infrastructure']
      }
    ]
  }
];

async function syncAll() {
  console.log('Starting full synchronization for all 20 graduates on live web...');

  for (let i = 0; i < graduates.length; i++) {
    const grad = graduates[i];
    console.log(`\n[${i + 1}/${graduates.length}] Processing: ${grad.name} (${grad.email})`);

    // 1. Log in as graduate
    const loginRes = await apiCall('/api/auth/login', 'POST', JSON.stringify({
      email: grad.email,
      password: 'Demo@1234'
    }));

    if (loginRes.status !== 200 || !loginRes.data.token) {
      console.error(`  ✕ Login failed: ${loginRes.status}`, loginRes.data);
      continue;
    }
    const token = loginRes.data.token;
    console.log('  ✓ Logged in');

    // 2. Save jobseeker profile
    const profRes = await apiCall('/api/jobseeker/profile', 'POST', JSON.stringify({
      headline: grad.headline,
      bio: grad.bio,
      desired_job_title: grad.desired_job_title,
      work_preference: grad.work_preference,
      years_of_experience: grad.years_of_experience,
      location: grad.location,
      phone: grad.phone
    }), token);

    if (profRes.status === 200) {
      console.log('  ✓ Jobseeker profile saved (completed: true)');
    } else {
      console.error('  ✕ Failed to save profile:', profRes.status, profRes.data);
    }

    // 3. Check existing portfolio experiences
    const portRes = await apiCall('/api/jobseeker/portfolio', 'GET', null, token);
    const existing = portRes.data?.experience || [];

    // Delete non-internship experiences to prevent duplicates
    for (const exp of existing) {
      const isOjt = (exp.type === 'Internship') ||
                    (exp.role && exp.role.toLowerCase().includes('ojt')) ||
                    (exp.company && exp.company.toLowerCase().includes('host training'));
      if (!isOjt) {
        await apiCall(`/api/jobseeker/experience/${exp.id}`, 'DELETE', null, token);
      }
    }

    // 4. Add each post-graduation experience
    for (const exp of grad.experiences) {
      const expRes = await apiCall('/api/jobseeker/experience', 'POST', JSON.stringify(exp), token);
      if (expRes.status === 201) {
        console.log(`  ✓ Experience added: "${exp.role}" at ${exp.company} (IT-related: ${expRes.data.is_it_related})`);
      } else {
        console.error('  ✕ Failed to add experience:', expRes.status, expRes.data);
      }
    }
  }

  console.log('\n============================================================');
  console.log('All 20 graduates processed! Verifying Alumni Tracker...');
  console.log('============================================================');

  // Verify Alumni Analytics via Admin API
  const adminLogin = await apiCall('/api/auth/admin-login', 'POST', JSON.stringify({
    email: 'admin@chmsu.edu.ph',
    password: 'Admin@CHMSU2026!'
  }));

  const analytics = await apiCall('/api/admin/alumni-analytics', 'GET', null, adminLogin.data.token);

  console.log('\n--- OVERALL ALUMNI TRACKER STATS ---');
  console.log(`Total Alumni: ${analytics.data.overall.totalAlumni}`);
  console.log(`In-Path Count: ${analytics.data.overall.inPath}`);
  console.log(`In-Path Average Rate: ${analytics.data.overall.avgRate}%`);

  console.log('\n--- BATCH BREAKDOWN ---');
  for (const b of analytics.data.batches) {
    console.log(`Batch: ${b.label} | Total: ${b.total} | In-Path: ${b.inPath} (${Math.round((b.inPath / b.total) * 100)}%) | Not In-Path: ${b.notInPath}`);
    console.log(`  Top Roles: ${b.topRoles.slice(0, 3).join(', ')}`);
  }
}

syncAll().catch(console.error);
