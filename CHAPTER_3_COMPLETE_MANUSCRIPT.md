Chapter 1
INTRODUCTION
Background of the Study	
The shift toward online recruitment has drastically increased the volume of job applications, challenging companies to review candidate profiles efficiently while striving to find the perfect fit. With the exponential growth of online job postings, matching candidates to the right roles has become increasingly complex. Traditional hiring methods often rely on simple, manual information matching, which underutilizes multi-source data and causes significant delays (Mao et al., 2024). Consequently, basic systems struggle to balance precision with contextual relevance, frequently leading to career mismatches (Alsulami et al., 2026). To resolve this, modern human resource practices are shifting toward smart placement systems that automate credential generation and apply structured filtering (Priya et al., 2025). Furthermore, standardized digital portfolios have become essential tools to help inexperienced fresh graduates build professional confidence and effectively showcase their competencies in a competitive market (Andini et al., 2024).
In the Philippines, education-labor mismatches continue to cause significant labor inefficiencies. Melchor (2024) notes that nearly 40 percent of Filipino workers have more education than their specific jobs require, leading to wage penalties and highlighting the urgent need for more accurate, centralized labor market platforms. Furthermore, employment outcomes for state university graduates vary significantly. De Castro (2026) found that graduates from specialized sectors, such as Information Technology and Education, sometimes face higher unemployment rates due to an operational disconnect between university curricula and actual workplace expectations. Weak correlations between academic preparation and workplace execution indicate a strict need for improved digital tracer systems that can proactively align a graduate's actual competencies with employer demands (Tayco et al., 2025).
At Carlos Hilado Memorial State University (CHMSU), these national trends reflect the distinct operational challenges faced by the Career and Industrial Employment Relation (CIER) office and the On-the-Job Training (OJT) supervisors. The CIER office is responsible for facilitating job applications and organizing recruitment events to connect graduates with partner companies. However, the office relies on highly fragmented, manual methods to match candidates with available opportunities. Concurrently, OJT supervisors—who are tasked with managing and tracking student trainees—face a major operational hurdle in spatial monitoring. Route identification and trainee distribution become extremely inefficient due to supervisors' lack of specialized tools to map deployment locations, which complicates record verification and delays performance reviews.Consequently, a distinct research gap exists: current institutional practices lack an integrated platform that combines spatial monitoring for OJT supervision with a unified, algorithmic approach to graduate job matching.
To directly address this research gap, this study proposes "Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping." This web-based platform is designed to serve as an education-to-employment ecosystem that synchronizes student profiles, OJT performance data, and partner company requirements. The core focus of this study is to provide a cohesive digital solution. By integrating student profiles, digital portfolio generation, job posting management, applicant screening, and OJT deployment mapping into one platform, this study aims to support the CIER office and OJT supervisors in reducing manual workload, improving access to employment-related records, and assisting students and graduates in finding suitable career opportunities
Objectives of the Study
	The main objective of the study is to design, develop, and evaluate "Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping."
Specifically, the study aims:
To design and develop a web-based system with the following technical features: 
Centralized recruitment web-based system
Automated candidate skill matching
Automated digital portfolio and resume generation module
Real-time Job Opportunity Retrieval from third party RESTful APIs 
Graduate screening, shortlisting, and interview scheduling module
OJT supervisor mapping and optimized monitoring location generation system
To implement and test the functionality of the features mentioned above to ensure operational reliability. 
To evaluate the system using ISO/IEC 25010 standards in terms of functional suitability, performance efficiency, usability, compatibility, reliability, security, maintainability, and portability. 
Functional Suitability
Performance Efficiency
Usability
Compatibility
Reliability
Security
Maintainability
Portability
Significance of the Study
The proposed system, "Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping," is designed to provide a data-driven solution to the recruitment and monitoring challenges faced by the institution. The results of this study will be highly beneficial to the following:
Students. The system assists undergraduates in securing suitable On-the-Job Training (OJT) placements by enabling the early generation of industry-compliant digital portfolios and providing tailored OJT recommendations based on their current academic background and technical skills.
Graduates. The platform enhances the career competitiveness of alumni entering the labor market by providing precise professional employment recommendations—including full-time, part-time, and freelance opportunities—based on their accumulated competencies, verified OJT records, and available profile information.
CHMSU CIER Office. The platform modernizes career services and reduces administrative workload by centralizing student profiles, OJT data, and partner requirements into one synchronized ecosystem.
On-the-Job Training (OJT) Supervisors. Dedicated mapping features resolve spatial monitoring gaps by automatically generating optimized routes, making trainee tracking and evaluation highly efficient.
Partner Companies. Employers gain a more organized hiring workflow with multi-tiered filtering, automated shortlisting from verified records, and integrated communication tools for efficient interview scheduling.
Carlos Hilado Memorial State University (CHMSU). The institution benefits from a modernized placement platform that proactively minimizes education-employment mismatches and improves overall graduate employment outcomes.
Researchers. Developing this platform allows the BS Information Technology proponents to apply their academic knowledge to solve a real-world institutional problem while enhancing their technical web development skills.  
Future Researchers. This study provides a theoretical foundation for scholars exploring centralized recruitment systems, algorithmic job matching, and spatial mapping.
Scope and Limitation of the Study
	The scope of this study covers the design, development, and evaluation of "Hire Me," a centralized web-based and fully mobile-responsive employment platform tailored for the Career and Industrial Employment Relation (CIER) office at Carlos Hilado Memorial State University (CHMSU). The system bridges the administrative gap between educational training and graduate employment by unifying student academic profiles, On-the-Job Training (OJT) performance records, and partner company requirements into a single digital ecosystem accessible across desktops, tablets, and smartphones. To achieve this, the platform’s core scope encompasses several interconnected operational modules, specifically a candidate suitability scoring engine, an automated digital portfolio and resume builder, an external job posting aggregator, applicant screening tools, and an OJT spatial mapping feature for coordinators.
Despite its comprehensive features, the study has certain limitations. First, the platform operates exclusively as a web application and does not include a downloadable, native mobile application for iOS or Android devices. Second, the system’s ability to successfully aggregate and display external job postings depends entirely on the availability, uptime, and continued support of third-party external services. Finally, the study is strictly limited to the administrative needs, specific user roles, and operational context of CHMSU and its verified partner organizations. Consequently, the platform's strict workflow separation between active students and alumni, as well as its matching criteria, may require significant structural customization before it can be directly adopted by other educational institutions or independent corporate entities. 
Definition of Terms
To ensure clarity and help readers better comprehend the research, this section defines the essential terms used throughout the study. Each term is defined conceptually, which provides its general or universal meaning, and operationally, which explains exactly how the term is applied and utilized within the context of this specific project.
Application Programming Interface (API). An API is a defined set of rules and specifications through which one software component requests services or data from another without needing to know its internal workings (Kiesler & Schiffner, 2024).
As presented in this study, the API refers to the integration mechanism through which "Hire Me" retrieves external job postings and obtains geolocation and routing data for the mapping module. 
Applicant Screening and Shortlisting. Screening and shortlisting are the recruitment stages in which employers evaluate applicants against defined requirements and narrow the pool to the most suitable candidates, a task increasingly supported by matching and ranking techniques (de Ruijt & Bhulai, 2021). 
Based on this study, applicant screening and shortlisting refer to the multi-tiered filtering function that allows partner companies to sort CHMSU applicants by layered criteria, such as program alignment, technical competencies, and verified OJT performance, and shortlist them using the outputs of the scoring engine. 
Candidate Suitability Score. A suitability score is a numerical value expressing how well a candidate's attributes fit the requirements of a position, and it is used in job recommender systems to rank candidates or jobs (de Ruijt & Bhulai, 2021; Zhao et al., 2021). 
	As applied in this study, the candidate suitability score refers to the value the weighted matching algorithm computes for each candidate against a job posting, based on academic program alignment, logged technical competencies, and OJT supervisor evaluations. Candidates are ranked by this score. 
Career and Industrial Employment Relation (CIER) Office. This is the office of Carlos Hilado Memorial State University (CHMSU) responsible for facilitating job applications, coordinating OJT placements, and connecting students and graduates with partner companies. 
In this study, the CIER office is the primary administrative user of the platform and manages partner company requirements. 
Centralized Recruitment System. A centralized recruitment system is a single, standardized platform that consolidates the recruitment process (job posting, application, screening, and communication) in one place, acting as an intermediary between candidates and employers (Ruparel et al., 2023).
As presented in this study, the centralized recruitment system refers to "Hire Me" as a web-based platform that stores student profiles, OJT records, partner company requirements, and job postings in one database that all modules draw from. 
Digital Portfolio. A digital (electronic) portfolio is a purposeful collection of digital artifacts that documents a person's learning, achievements, and competencies, and it is widely used in higher education (Zhang & Tur, 2022).
As applied in this study, the digital portfolio refers to the resume and portfolio the platform generates automatically from verified institutional records, namely academic records, logged technical competencies, and OJT evaluations, formatted on standardized templates and exportable for use by students and graduates. 
ISO/IEC 25010. This is an international standard that defines a product quality model for ICT and software products, composed of nine characteristics (ISO/IEC, 2023).
As presented in this study, ISO/IEC 25010 refers to the framework used to evaluate "Hire Me" through a survey of respondents and testers on each of these characteristics.
Mapping Features. Mapping refers to the visualization and analysis of geospatial data to show where entities are located and how they relate spatially, which web-based geographic information systems deliver over the internet (Vinueza-Martinez et al., 2024).
In this study, mapping features refer to the module that displays the fixed addresses of verified partner companies where students are deployed on an interactive map. It does not track students' personal devices in real time.
On-the-Job Training (OJT). OJT, often used interchangeably with internship, is a practical work experience in which students develop job-related skills in a real workplace, and it is associated with better employability and labour market outcomes (Ebner et al., 2021; Neyt et al., 2022).
As presented in this study, OJT refers to the student deployment program in partner companies. Under it, host supervisors submit performance evaluations that become verified inputs to the candidate suitability score and the digital portfolio, and deployment locations serve as the data for the mapping module.
RESTful API. REST (Representational State Transfer) is an architectural style for distributed hypermedia systems, defined by constraints such as stateless communication and a uniform interface, and an API that follows these constraints is called RESTful (Kotstein & Bogner, 2021).
As applied in this study, the RESTful API refers to the third-party job board services that "Hire Me" calls to retrieve and display live job postings in the dashboard. The platform uses these direct API calls instead of web scraping.
Technical Competencies. Technical competencies are the job-specific knowledge and skills required for a particular role, and graduates' competencies are positively related to their employability (Mokhtar et al., 2022).
In this study, technical competencies refer to the skills logged in a student's profile, such as programming languages or tools, and matched against the skills required by a job posting.
Weighted Matching Algorithm. The weighted matching algorithm is based on the weighted sum model from multi-criteria decision making (MCDM), with each criterion's value multiplied by a predefined weight and the results summed. The choice of weights strongly affects the outcome (Ayan et al., 2023).
As applied in this study, the weighted matching algorithm refers to the deterministic algorithm at the core of "Hire Me." It assigns predefined weights to academic program alignment, technical competencies, and OJT supervisor evaluations to produce the candidate suitability score. The same inputs always yield the same score, and the contribution of each factor can be shown to partner companies.
Chapter 2
REVIEW OF RELATED LITERATURE AND STUDIES
This chapter presents a comprehensive review of related literature and studies from both local and international sources. To establish a clear theoretical and technical foundation for the present study, the gathered materials are organized thematically. The concepts discussed herein familiarize the reader with relevant existing systems and highlight the technological gaps that the proposed platform aims to address.
Centralized Recruitment Web-Based System
The transition from manual, paper-based hiring to digital platforms is necessary to improve the speed, fairness, and data management of the hiring process. Internationally, traditional hiring methods often cause administrative errors, subjective decisions, and long processing times. Khan and Routiya (2024) highlighted these problems in their study on academic hiring in India, concluding that lacking a single, standard platform leads to unclear hiring practices. To ensure fairness, researchers strongly suggest creating central recruitment systems. This need is supported by Idris and Mohammed (2023), who built an online hiring system specifically for recent graduates. Their study showed that web-based platforms successfully connect job seekers and employers, greatly reducing the workload of human resource departments by automating application checks.
In the local setting, the move toward central, digital hiring has become a standard requirement for Philippine educational and government institutions. Cuyag, Tandog, and Binayao (2025) emphasized that online application systems are vital for creating a fair, data-driven hiring culture. The actual operational benefits in state universities were proven by Erlano-De Torres (2021) at the Laguna State Polytechnic University, where replacing manual human resource work with a web-based system successfully automated applicant screening and freed staff from repetitive office tasks.
These findings validate the foundational architecture of the proposed system. By adopting these proven centralized models, "Hire Me" acts as an institutional bridge rather than just a standalone job board. It systematically consolidates previously separated student profiles, On-the-Job Training (OJT) performance data, and partner company requirements into one secure, unified database. This centralized approach guarantees that all subsequent modules (such as matching and portfolio generation) pull from a single source of truth, thereby eliminating manual data-entry delays.
	The proposed system, "Hire Me," addresses these gaps with a transparent, weighted scoring engine. Rule-based approaches such as that of Gonzales et al. (2024) treat all criteria as equally important, while predictive models such as those of Mao et al. (2024) and Foo et al. (2025) are difficult to interpret or depend on indirect signals. "Hire Me" instead assigns predefined numerical weights to each factor, so that more job-relevant criteria contribute more to a candidate's suitability score. In contrast to the self-reported CVs used by Kumar et al. (2025), the system draws only on verified institutional records: academic program alignment with the job requirements, technical competencies logged and validated, and OJT supervisor evaluations officially submitted by host companies. Including OJT evaluations captures practical workplace performance, which grade-based models overlook. Because the algorithm is deterministic, the same inputs always produce the same score, and partner companies can see how each factor contributed to a candidate's ranking. The result is a ranked list of graduates that is evidence-based, explainable, and accurate, without relying on black-box AI or unverified user input. 
Automated Digital Portfolio and Resume Generation Module
              In today's digital age, job seekers are moving away from physical paper resumes toward digital portfolios. However, creating a well-designed, standardized document is often difficult for new graduates. Pandey et al. (2021) noted that automated portfolio builders allow users to create professional documents using ready-made templates without manual formatting stress. Kanagamalliga et al. (2025) showed that modern web tools offering real-time visual previews and instant PDF downloads greatly reduce the time needed to build a resume. Furthermore, Idrus et al. (2021) explained that when a web-based system automatically gathers a user's recorded work, it guarantees a complete and organized document.
              In the local Philippine setting, studies have explored using Artificial Intelligence to parse and extract skills from uploaded PDF resumes (Abalos & Palaoag, 2024) to match them with job postings. While innovative, parsing externally uploaded documents can lead to formatting errors or data misinterpretation.
              The proposed system adopts the concept of frictionless credential building but enhances data integrity by completely bypassing the need for AI PDF parsing or manual student typing. The centralized database behind “Hire Me” enables the automated digital portfolio module to dynamically pull existing, verified university grades and OJT completion records directly from the backend. It maps this data onto standardized, industry-compliant digital templates, allowing students to generate highly accurate and trusted profiles instantly. This prevents resume falsification and ensures uniformity for partner companies.
Real-time Job Opportunity Retrieval from third party RESTful APIs  
              Relying solely on a university's limited list of internal partner companies restricts a student's employment prospects. To expand opportunities, modern platforms use tools like Application Programming Interfaces (APIs) and web crawlers to collect open jobs from outside websites (Sahoo et al., 2023; Kumar et al., 2022). The speed of this data collection is critical; systems actively pulling near real-time data provide a much better user experience compared to outdated job boards (Gauhl et al., 2025). Furthermore, Kwieciński et al. (2023) proved that real-time job suggestions result in a 10% increase in actual application rates. Cabrera et al. (2024) also noted that tracking the market in real-time allows platforms to notify users about current employment trends.
              To broaden CHMSU graduates' access to the national job market, "Hire Me" utilizes secure, standard third-party RESTful APIs. Rather than deploying resource-heavy web scrapers or complex language models (LLMs) which are costly to maintain, the system makes direct API calls to established external job boards. This fetches and displays live external postings seamlessly within the platform's dashboard, ensuring students have access to verified, up-to-date opportunities beyond the university's immediate network.
Graduate screening, shortlisting, and interview scheduling module
              Reviewing job applications by hand is a slow process that wastes institutional time and introduces human bias (Silva I et al., 2022). To mitigate this, businesses are adopting digital decision support systems that rank applicants quickly and accurately based on set rules (Adriantantri & Indriani, 2023). While some newer platforms attempt to use conversational AI for applicant assessment (Patil et al., 2025), these systems can be highly complex and prone to misinterpreting technical qualifications. However, once candidates are appropriately shortlisted, Silva I et al. (2022) notes that adding automated interview scheduling to the same platform creates a smooth, frictionless transition from candidate discovery to actual communication.
              The platform avoids the complexities of conversational AI and instead applies a direct, multi-tiered filtering mechanism. Partner companies can systematically screen and shortlist CHMSU applicants based on the outputs of the weighted scoring engine. Once a company identifies a suitable candidate, the module provides integrated tools to trigger an interview scheduling workflow within the system. This streamlines the recruitment lifecycle for employers, shifting the process from manual email sorting to an organized, click-driven dashboard.
OJT Supervisor Mapping and Optimized Monitoring Location Generation System
              Managing student internships is a demanding task for university staff. Traditional paper-based tracking is highly inefficient, prompting a shift toward digital logbook systems that allow remote evaluation and reduce paperwork (Lamin et al., 2024; Cabalbag & Ontiveros, 2024; Ahmed et al., 2026). Web portals effectively optimize communication between schools, students, and host companies (Noche & Mendoza, 2025; Pacaldo et al., 2025).
              However, simply digitizing documents does not solve the logistical issue of physical deployment monitoring. Ariawan et al. (2025) highlighted that tracking actual deployment locations remains a major challenge, proposing geolocation-based systems to ensure students are safely at their sites and to help supervisors plan physical monitoring visits.
              The system directly translates this literature into a practical logistical tool for the CIER office. "Hire Me" incorporates this concept not by continuously tracking the real-time GPS coordinates of a student's personal mobile device—which raises significant privacy and battery consumption concerns—but by utilizing standard geolocation APIs (such as Google Maps) to plot the fixed addresses of verified partner companies where students are deployed. The system then automatically calculates and generates optimized travel routes for OJT supervisors, allowing them to efficiently plan their site visits and evaluations, thereby resolving a major manual tracking bottleneck.
Table 1 Matrix of Related Literatures and Studies
| RRL   | Features  <td colspan=6/> |
| Studies/System   | Centralized Recruitment    | Weighted Suitability Scoring    | Automated Resume & Portfolio Generation    | Real-Time Job Aggregation    | Applicant Screening & Scheduling    | OJT Supervisor Mapping    |
| Evolving meritocracy: A narrative review of teacher recruitment in the Philippines following DepEd's 2024 guidelines – Cuyag et al. (2025)    | ✓   | ✕   | ✕   | ✕   | ✕   | ✕   |
| Implementation of decision support personnel recruitment system for Laguna State Polytechnic University-San Pablo City Campus – Erlano-De Torres (2021)    | ✓   | ✕   | ✕   | ✕   | ✕   | ✕   |
| Design and implementation of an online recruitment system for youth graduates – Idris and Mohammed (2023)    | ✓   | ✕   | ✕   | ✕   | ✕   | ✕   |
| Establishing a centralized recruitment commission for academic staff in India: A comparative analysis of current practices and the need for standardization – Khan and Routiya (2024)    | ✓   | ✕   | ✕   | ✕   | ✕   | ✕   |
| Optimizing job search through a user-centric job recommender system – Alviar et al. (2025)    | ✕   | ✓   | ✕   | ✕   | ✕   | ✕   |
| Dynamic job recommendation by profiling undergraduates’ academic performances – Foo et al. (2025)    | ✕   | ✓   | ✕   | ✕   | ✕   | ✕   |
| Graduate tracer monitoring platform with decision support feature and mapping recommendations analysis using rule-based algorithm – Gonzales et al. (2024)    | ✕   | ✓   | ✕   | ✕   | ✕   | ✕   |
| A job recommendation model based on a two-layer attention mechanism – Mao et al. (2024)    | ✕   | ✓   | ✕   | ✕   | ✕   | ✕   |
| AI-based resume skills extractor and recommender modules for state university human resource analytics system – Abalos and Palaoag (2024)    | ✕   | ✕   | ✓   | ✕   | ✕   | ✕   |
| An automated portfolio for job opportunities – Idrus et al. (2021)    | ✕   | ✕   | ✓   | ✕   | ✕   | ✕   |
| A professional resume generation system using modern web technologies – Kanagamalliga et al. (2025)    | ✕   | ✕   | ✓   | ✕   | ✕   | ✕   |
| Portfolio builder and career recommender by scraping data using Flask and TensorFlow – Pandey et al. (2021)    | ✕   | ✕   | ✓   | ✕   | ✕   | ✕   |
| Automated web-based curriculum vitae system with QR code integration for portfolio access – Setiawan et al. (2024)    | ✕   | ✕   | ✓   | ✕   | ✕   | ✕   |
| Boost your career: Real-time job analytics, virtual voice feedback and job notification using collaborative filtering algorithms – Cabrera et al. (2024)    | ✕   | ✕   | ✕   | ✓   | ✕   | ✕   |
| Integrating large language models with near real-time web crawling for enhanced job recommendation systems – Gauhl et al. (2025)    | ✕   | ✕   | ✕   | ✓   | ✕   | ✕   |
| Technical job recommendation system using APIs and web crawling – Kumar et al. (2022)    | ✕   | ✕   | ✕   | ✓   | ✕   | ✕   |
| Comparison of real-time and batch job recommendations – Kwieciński et al. (2023)    | ✕   | ✕   | ✕   | ✓   | ✕   | ✕   |
| Designed framework for advanced intelligent job recommendation system – Sahoo et al. (2023)    | ✕   | ✕   | ✕   | ✓   | ✕   | ✕   |
| Decision support system for employee recruitment optimization – Adriantantri and Indriani (2023)    | ✕   | ✕   | ✕   | ✕   | ✓   | ✕   |
| AI-powered recruitment systems: Conversational assessment and predictive shortlisting – Patil et al. (2025)    | ✕   | ✕   | ✕   | ✕   | ✓   | ✕   |
| An automated system for employee recruitment management – Silva et al. (2022)    | ✕   | ✕   | ✕   | ✕   | ✓   | ✕   |
| A digital solution for student internship tracking and enhancing student’s experience – Ahmed et al. (2026)    | ✕   | ✕   | ✕   | ✕   | ✕   | ✓   |
| Student internship control system based on geolocation and QR code – Ariawan et al. (2025)    | ✕   | ✕   | ✕   | ✕   | ✕   | ✓   |
| Management information system for tracking on-the-job trainees – Cabalbag and Ontiveros (2024)    | ✕   | ✕   | ✕   | ✕   | ✕   | ✓   |
| Optimizing internship placement process: A study on the implementation of an internship placement management system (IPMS) at Universiti Poly-Tech Malaysia – Lamin et al. (2024)    | ✕   | ✕   | ✕   | ✕   | ✕   | ✓   |
| Development of Colegio De Dagupan on-the-job training portal – Noche and Mendoza (2025)    | ✕   | ✕   | ✕   | ✕   | ✕   | ✓   |
| MyIntern: A centralized role-based web platform for internship coordination and job matching in higher education – Pacaldo et al. (2025)    | ✕   | ✕   | ✕   | ✕   | ✕   | ✓   |
| Enhanced Job Recommendation System Using Skill Based Rule Matching Algorithm – Kumar et al. (2025)    | ✕   | ✓   | ✕   | ✕   | ✕   | ✕   |
Synthesis	The review of related literature and studies from 2021 to 2026 highlights a significant shift towards data-driven and automated solutions in employment services and student tracking. Researchers emphasize that centralized web-based recruitment systems are crucial for streamlining administrative workflows and bridging the gap between academic institutions and industries (Khan & Routiya, 2024; Cuyag et al., 2025). To support these centralized systems, automated digital portfolio and resume generation tools have emerged as effective ways to standardize student credentials. These tools ensure that applicants present their skills clearly and uniformly, making it easier for employers to assess their qualifications (Abalos & Palaoag, 2024; Kanagamalliga et al., 2025).
Furthermore, recent studies point to the growing reliance on intelligent algorithms to handle recruitment. Algorithmic candidate suitability scoring engines actively match verified applicant skills with strict employer requirements, which significantly reduces human bias and prevents career mismatches (Alviar et al., 2025; Gonzales et al., 2024). This smart matching is often complemented by real-time job opportunity aggregation via APIs. By continuously pulling active job data from external platforms, these systems expand the reach of institutional portals, ensuring students do not miss out on relevant industry openings (Cabrera et al., 2024; Sahoo et al., 2023). Once a match is made, intelligent applicant screening and automated interview scheduling are utilized to minimize administrative delays during the hiring process (Patil et al., 2025; Silva I et al., 2022).
To manage the deployment phase, the literature advocates for the integration of geolocation tools for OJT supervisor mapping. This technology resolves the issue of inefficient trainee tracking by providing institutions with real-time oversight of student deployments and generating optimized travel routes for monitoring (Ariawan et al., 2025; Noche & Mendoza, 2025).
Synthesizing these technological advancements, the "Hire Me" platform integrates these essential features—centralized recruitment, automated candidate skill matching, resume generation, job aggregation, screening workflows, and OJT mapping—into a single, unified ecosystem. By drawing upon the best practices identified in these studies, the system directly addresses the specific operational challenges of the Carlos Hilado Memorial State University (CHMSU) CIER office. Ultimately, it transitions fragmented, manual tracking processes into a verified, data-driven environment evaluated under ISO/IEC 25010 standards, fostering a highly efficient employment ecosystem for CHMSU graduates and partner companies.
Chapter 3
METHODOLOGY
This chapter presents the research methodology and procedures utilized in the development and evaluation of the proposed system, "Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping." Specifically, this chapter discusses the research design, software development life cycle, respondents of the study, research instruments, data gathering procedures, and the statistical treatment of data used to evaluate the system's overall quality and acceptability. 
Research Design
The research used a developmental-descriptive design. Developmental research involves creating and refining a product, while descriptive research observes and records characteristics or conditions without altering them. This method combines both approaches to design and assess the "Hire Me" platform. Developmental design is a systematic approach to creating and testing new products or programs. Richey and Klein (2007) state that it focuses on the systematic design, development, and evaluation of processes and products that must meet criteria of consistency and effectiveness. In this study, the developmental phase dictates how "Hire Me" is engineered by following four specific stages of the Software Development Life Cycle (SDLC): analysis, design, development, and evaluation. During analysis, the target users' needs and operational challenges—specifically those of the CIER office staff, OJT supervisors, students, and partner companies—are identified. Design and development involve the actual construction of the platform and its core features, including the centralized recruitment web portal, automated candidate skill matching, automated digital portfolio module, real-time external job aggregation, applicant screening, and OJT supervisor mapping system, through continuous database modeling, coding, and bug fixes. Finally, the evaluation stage assesses the built application using descriptive data (user feedback, usage patterns) and the ISO/IEC 25010:2011 Software Quality Model, standardized criteria that strictly check functional suitability, performance efficiency, usability, compatibility, reliability, security, maintainability, and portability to ensure a working platform for the institution.
The descriptive approach explains current situations or evaluates existing things. Oates et al. (2025) state that descriptive research aims to systematically identify and describe the characteristics of a population or phenomenon, often relying on surveys and observational methods to gather real-world data.  Here, the descriptive part was initially used to systematically observe and document the existing manual workflows and operational challenges of the CHMSU CIER office, On-the-Job Training (OJT) supervisors, and partner companies without altering their environment. Finally, the descriptive method serves as the framework to execute the aforementioned evaluation stage, assessing the quality of the "Hire Me" platform with the target respondents. By applying this method, the researchers measured functional suitability, usability, and other factors to determine whether the system actually helps the beneficiaries.
System Development Life Cycle
According to Tegarden et al. (2025), the system development life cycle (SDLC) is a structured set of phases that serves as the fundamental basis for systems analysis and design methodologies. The Modified Waterfall Model was chosen as the SDLC methodology for the development of the "Hire Me" platform. Unlike the traditional linear approach, the modified version allows for necessary feedback loops between phases, ensuring that requirements are accurately translated into the final product and allowing the researchers to revisit previous stages if technical adjustments are required. 
Figure 1 Modified Waterfall Model
The development of "Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping" followed the sequential yet flexible structure of the Modified Waterfall Model, executed through the following formal stages:	a. Requirements Gathering. This phase is where the project's foundation is established by defining and documenting everything involved. During this phase, the researchers conducted a literature review, identified system requirements, and prepared physical documents such as the beneficiary letter, beneficiary acknowledgement form, and data privacy form. Furthermore, interviews with the primary beneficiaries—specifically the CIER office personnel and On-the-Job Training (OJT) supervisors—were successfully conducted and documented. These activities laid out the project's goals and verified the operational gaps before moving forward. 
b. Design. This phase focuses on designing the framework for the system being developed. Based on the information collected, the system's details and compatible components were conceptualized. It concludes the design of the input and the output of the system, illustrating how it works through structural models such as flowcharts, an entity-relationship diagram, and a data flow diagram tailored to recruitment and mapping processes. 
c. Development. This phase is where the establishment section of the system occurs. The design concept is currently being realized through coding and integrating various parts. This includes establishing the central database, programming the mathematical logic for the automated candidate skill matching, developing the automated digital portfolio module, and integrating third-party APIs for real-time job aggregation and OJT supervisor mapping. 
d. Implementation. In this phase, the system will undergo rigorous testing. The proponents will deploy the application to a local/live server and execute test cases to identify and resolve bugs. System orientations and dry runs will be conducted for the CIER office and OJT supervisors to ensure the mapping and matching functions run smoothly prior to formal user evaluation. 
e. Maintenance. The final phase focuses on providing ongoing technical support and periodic software updates to ensure the platform remains operational and secure after launch. Any technical bugs identified during institutional use will be documented and resolved to maintain high performance and adapt the system to future web technology requirements. 
Research Respondents
	In this study, the respondents are grouped based on their specific role in the system evaluation process, namely test case evaluation and software quality assessment. The test case evaluation will be conducted solely by IT professionals, who possess the technical expertise necessary to systematically verify the functional correctness of the application. These respondents will execute predefined test cases covering core system features such as user authentication, the weighted matching algorithm, API data retrieval, portfolio generation, and geolocation route mapping. Their role is to determine whether each function performs according to specified technical requirements and to identify bugs prior to the overall quality evaluation.
After the completion of the test case evaluation, a broader group of respondents will participate in the software quality assessment using the ISO/IEC 25010:2011 Software Quality Model. The main respondents include the CHMSU CIER Office personnel, OJT supervisors, Partner Company HR representatives, and Information Technology students/alumni. All possess basic digital literacy and agree to participate. Table 2 outlines the profile of the test evaluators, while Table 3 shows the overall breakdown of the 30 respondents.
The first respondents are IT Professionals. These are technical experts (software developers, programmers, IT instructors) who check the platform's technical quality. Their role is to test functionality, performance efficiency, security, and maintainability.
The second group comprises the primary institutional users: CIER Office personnel and OJT Supervisors. Their role is to evaluate the system's ability to centralize records, usability, and the accuracy of the spatial mapping features for trainee monitoring.
The third group consists of Partner Companies. They will assess the platform's applicant screening, shortlisting modules, and interview scheduling functionalities to ensure it meets industry recruitment standards.
Lastly, there are the end-users: IT Students and Alumni. They will test the usability of the automated digital portfolio generation and evaluate the relevance of the career job matching recommendations provided by the system.
Table 2Respondents’ Profiles for Test Case Evaluation 
| Respondent   | Age   | Sex   | Occupation   | Device Used   | Experience Level   |
| R1   | 28   | Male   | Software Developer    | Laptop   | Advanced    |
| R2   | 32   | Female   | QA Engineer   | Laptop   | Advanced    |
| R3   | 35   | Male   | Systems Analyst   | Laptop   | Advanced    |
| R4   | 29   | Male   | Web Developer   | Laptop   | Advanced    |
| R5   | 31   | Female   | IT Instructor   | Laptop   | Advanced    |
Additionally, the proponents carefully selected 30 respondents who will evaluate the "Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping." These respondents included IT professionals, CIER Office personnel, OJT supervisors, partner company HR representatives, and IT students and alumni who are deeply connected with institutional recruitment, student deployment monitoring, applicant screening, and digital credential generation. The criteria for selection ensured that the chosen respondents had direct operational involvement or technical expertise with the proposed system's target functionalities, ensuring that the feedback provided on software quality and usability is rooted in actual administrative and hiring processes. The actual data of the evaluation respondents are presented in Table 3. 
Table 3Research Respondents 
| Respondent   | No. of Respondents   | Percent   |
| IT Professionals    | 5   | 17%   |
| CIER Office Personnel    | 3   | 10%   |
| OJT Supervisors    | 3   | 10%   |
| Partner Company HR Representatives    | 4   | 13%   |
| IT Students and Alumni    | 15   | 50%   |
| Total Score/ Mean Score   | 30   | 100%   |
Sampling Technique
	This study employs purposive sampling, a non-probability sampling technique in which respondents are intentionally selected based on their knowledge, experience, and relevance to the objectives of the study. According to Creswell and Creswell (2023), purposive sampling is appropriate when the researcher needs participants who can provide informed, in-depth, and meaningful evaluations of a specific phenomenon or system, rather than seeking random population representation. 
For the test case evaluation, the respondents are exclusively IT professionals selected based on their technical background in software development and system testing. Their expertise enables them to execute predefined test cases and objectively verify the mathematical logic of the matching algorithm and the integration of the mapping APIs.
For the software quality evaluation, purposive sampling is applied to select the CIER office personnel, OJT supervisors, and partner companies, as these individuals possess the specific operational knowledge required to assess the platform's specialized administrative and monitoring features. Conversely, stratified random sampling will be utilized to select the student and alumni respondents to ensure equitable representation across varying levels of academic standing within the College of Computer Studies. All respondents meet the inclusion criteria of possessing standard computing devices, internet access, and the willingness to evaluate all system features.
Data Gathering Instrument
This study utilizes two primary data gathering instruments to evaluate the proposed platform: a test case evaluation instrument developed by the proponents and a standardized software quality questionnaire based on the ISO/IEC 25010:2011 Software Quality Model.
For the test case evaluation, the proponents designed a structured test case checklist to systematically verify functional correctness. Each test case includes the feature to be tested, test procedures, expected results, actual outcomes, and a remarks section for observations. The test cases cover core functionalities, including the automated resume builder, the weighted scoring engine, and the mapping module. These instruments will be administered in hardcopy format to the selected group of IT professionals. The results are recorded using a pass or fail rating, supplemented by technical remarks.
For the software quality evaluation, a separate instrument adapted from the ISO/IEC 25010:2011 Software Quality Model will be used to assess overall quality. This questionnaire evaluates the application in terms of functional suitability, performance efficiency, usability, compatibility, reliability, security, maintainability, and portability. The instrument utilizes a 5-point Likert scale, ranging from 1 (Strongly Disagree) to 5 (Strongly Agree), and will be distributed through Google Forms. This approach allows for efficient data collection and ensures consistency in responses.
Table 4 5-Point Likert Scale with Verbal Interpretation 
| Scale   | Statistical Range   | Qualitative Description   | Verbal Interpretation   |
| 5   | 4.21 - 5.00   | Strongly Agree   | Excellent   |
| 4   | 3.41 - 4.20   | Agree   | Very Good   |
| 3   | 2.61 - 3.40   | Neutral   | Good   |
| 2   | 1.81 - 2.60   | Disagree   | Fair   |
| 1   | 1.00 - 1.80   | Strongly Disagree   | Poor   |
Data Gathering Procedure
The data gathering procedure for this study is carried out in a systematic, sequential, and ethical manner to ensure the accuracy of the results. Prior to data collection, the proponents secured approval of the capstone title and obtained formal permission from the study beneficiaries—the CIER Office and the OJT Supervisors. Interviews were conducted, and beneficiary acknowledgement letters were formally signed to establish the current operational gaps.
Once the development phase is completed, the test case instruments will be prepared. A system demonstration will first be conducted for the IT professionals participating in the test case evaluation to ensure a proper understanding of the application’s algorithm and API integrations. The test case evaluation phase will be administered first in hardcopy format. The selected IT professionals will execute scenarios covering user registration, matching logic, and map rendering. Identified issues and bugs will be addressed and corrected prior to proceeding to the next phase.
After implementing necessary improvements, the software quality evaluation will be conducted with the broader group of respondents. A brief orientation and system demonstration will be provided, and informed consent will be obtained. The web-based platform will then be made accessible to the respondents. Users will be instructed to explore role-specific features, such as building a portfolio, posting a job, or generating a monitoring route. After sufficient use, respondents will complete the ISO/IEC 25010:2011-based questionnaire via Google Forms.
Validity of Research Instrument
The instrument used in this study is based on ISO/IEC 25010:2011, the Software Quality Model, a standardized, internationally recognized framework for evaluating software quality. This instrument has been widely adopted and validated in prior research and professional practice, providing strong content and construct validity for this study. Given its proven effectiveness in assessing software systems, the established validity of the instrument ensures its appropriateness for the comprehensive evaluation of the platform. 
Reliability of the Questionnaire
The questionnaire used in this study is based on the trusted and widely used standard for assessing software quality. Many researchers and professionals have utilized this type of questionnaire in various software engineering studies, consistently producing reliable results. The questionnaire’s reliability is already well established through its long history of proven reliability in software evaluations; therefore, a separate reliability test is not required for this study.
Analysis/Statistical Treatment of Data
The data gathered in this study will be analyzed in two distinct phases, aligning with the two main evaluation instruments: the test case evaluation and the software quality assessment.
For the test case evaluation, the researchers will systematically review the outcomes of the hardcopy test case forms completed by the IT professionals. Each test scenario includes specific actions, expected results, pass or fail indicators, and a section for technical remarks. The pass and fail results will be tabulated to calculate the frequency and percentage of successful executions for the core functionalities of the "Hire Me" platform. To assess the system's actual functional performance and determine its overall percentage of completion, the following formula will be utilized:
P=fN×100
Where:P = Percentage of successful executionsf = Frequency of "PASS" resultsN = Total number of test cases executed
The written comments provided by the evaluators will be analyzed qualitatively to identify recurring issues, system errors, or necessary improvements. This analysis provides an objective measure of the platform's functional correctness, ensuring that required bug fixes are applied before the broader software quality evaluation begins.
For the software quality evaluation, responses from the ISO/IEC 25010:2011 questionnaire will be collected through a hybrid approach, utilizing both online distribution via Google Forms and face-to-face administration with the IT professionals, CIER office personnel, OJT supervisors, partner companies, and student respondents. The questionnaire utilizes a 5-point Likert scale, ranging from 1 (Strongly Disagree) to 5 (Strongly Agree), to evaluate the platform’s functional suitability, performance efficiency, usability, compatibility, reliability, security, maintainability, and portability. These responses will be analyzed quantitatively to provide a clear representation of user perception and satisfaction.
The primary statistical tool utilized for this analysis is the weighted mean. This will be calculated by multiplying the frequency of each response by its corresponding assigned weight on the Likert scale, summing these products, and then dividing that total by the overall number of respondents. The formula used for this calculation is:
x=fxN
Where:
x = Weighted mean score
fx = Sum of the products of the frequency (f) and the assigned Likert scale weight (x)
N = Total number of respondents
Additionally, descriptive statistics such as frequencies, percentages, and overall mean scores will be computed to determine the final level of software quality as perceived by the different stakeholder groups.
Ethical Consideration
This study strictly adheres to ethical standards throughout the research process. Prior to data collection and system interaction, informed consent will be obtained from each respondent after thoroughly explaining the study’s objectives and procedures.
The platform processes academic records, performance evaluations, and personal credentials; therefore, strict confidentiality will be maintained throughout the study. The study will fully comply with the requirements of the Data Privacy Act of 2012. Personal data will be anonymized, securely stored, and protected via role-based access controls within the system. Information will be utilized strictly for system evaluation and recruitment matching purposes as explicitly permitted by the user, ensuring that respondents are not exposed to data misuse or harm.
Operational Framework
Figure 2 illustrates the operational framework of the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. Operating through a centralized, multi-user architecture, the system enables various stakeholders to perform role-specific activities and exchange information through a Network Connection (LAN/WAN). Specifically, Student OJT trainees can manage their profiles, browse available OJT slots, and review OJT requirements, while receiving generated resumes, OJT matches, MOA requests, and interview schedules. Alumni can manage their profiles, submit job applications, and fulfill application requirements, and receive job matches, application status updates, and interview schedules. Partner companies can post job and OJT opportunities, manage interview schedules, and submit OJT evaluations, while receiving OJT shortlists, resumes and portfolios, and approved letters and documents. Meanwhile, OJT supervisors can monitor OJT progress and manage official letters and documents, and access OJT map routes, rendered OJT hours, OJT evaluations, and OJT portfolios.
All requests and information exchanged by these stakeholders pass through the Network Connection (LAN/WAN), which facilitates communication between the users and the Server. The Server processes incoming requests, manages system operations, and communicates bidirectionally with the Database to fetch and store relevant information, including user profiles, job and OJT postings, applications, documents, and evaluation records. The Admin oversees the system by configuring system settings, reviewing audit logs, and managing user accounts, while accessing system analytics, MOA lists, and placement reports. Additionally, the Server connects to External Services to access external APIs and storage when required by the system's functionalities. Through this interconnected architecture, the platform facilitates the exchange of information between users, the Server, and the Database, ensuring centralized data management, coordinated stakeholder interactions, and the timely delivery of relevant information and system outputs to authorized users.
Figure 2Operational Framework
Context Diagram (Level 0)
	Figure 3 illustrates the flow of contextual data for the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. It provides an overview of how the centralized system interacts with its five primary external entities, specifically the Student OJT, Alumni, Company, OJT Supervisor, and Admin. The diagram delineates the continuous movement of data in and out of the system, highlighting the comprehensive inputs and outputs facilitated by the platform. For instance, the system processes registration details, portfolio data, clearance documents, and DTR/GPS logs from the Student OJT, while outputting relevant OJT postings, supervisor endorsements, appraisal scores, and job matches. Similarly, companies submit MOA requests, job or OJT postings, interview schedules, and evaluations, subsequently receiving MOA status updates, applicant resumes, and trainee logs. OJT Supervisors manage academic oversight by inputting CSV rosters, clearance approvals, endorsement slips, and evaluation templates, which allows them to retrieve clearance submissions, trainee map locations, DTR audit logs, and OJT grades. Furthermore, Alumni exchange profile data, job applications, and chat messages to access internal and external job postings and job offers. Finally, the Admin governs the platform by providing MOA approvals, supervisor provisioning, and master data, enabling the system to generate critical placement KPIs, MOA compliance rates, skills gap analytics, and tracer reports. 
Figure 3Context Diagram (Level 0)
Data Flow Diagram (Level 1)
Figure 4 illustrates the detailed data flow for the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. As depicted in the diagram, the system facilitates complex information exchange among five primary entities: the Student OJT, the OJT Supervisor, the Alumni, the Company, and the Admin.
All interacting entities initiate system engagement through the Registration & Onboarding process (1.0), submitting login and setup information that is subsequently stored as authentication data in the Users table (D1). Following successful authentication, Student OJT and Alumni actors construct their professional identities by providing education and technical skills to the Manage Profile & Portfolio process (2.0). This process systematically stores the submitted profiles and verified credentials into the student_profiles (D2) and portfolio_projects (D3) data stores.
Institutional partnerships and recruitment operations are primarily formalized through interaction with the Company and Admin entities. Through the Accredit Company & MOA process (3.0), Companies and Admins manage MOA contracts and approvals, which updates the contract validity within the company_profiles repository (D4). Authorized Companies then generate training opportunities by posting OJT vacancies via the Manage OJT Postings process (4.0), securely saving these vacancy details into the ojt_postings table (D5). The Process OJT Deployment module (5.0) synthesizes inputs across multiple actors: Student OJTs upload clearances and submit OJT interests, OJT Supervisors issue endorsement slips, and Companies confirm accepted applicants. These collective actions result in the saving of clearances and active contracts into the ojt_records table (D6).
Active trainees utilize the platform to transmit GPS coordinates and time logs via the Track Geofenced Attendance process (6.0), which are captured and saved as check in/out timestamps in the time_logs table (D7), while OJT Supervisors can concurrently request DTR map data. For performance assessment, the Evaluate Trainee Performance process (7.0) receives created Likert rubrics from OJT Supervisors and submitted digital appraisals from Companies, saving these templates and Likert ratings into the student_evaluations repository (D8).
Transitioning to post-graduate placement, Companies publish career vacancies and the Admin executes the skills matching engine within the Post & Manage Job Vacancies process (8.0), saving active postings to the job_listings data store (D9). The Process Career Applications module (9.0) manages the recruitment pipeline by receiving application submissions and offer decisions from Alumni, alongside screening statuses and interview schedules from Companies, ultimately updating the application stage and messages within the job_applications table (D10). Finally, the administrative entity maintains oversight of post-graduate success metrics through the Manage Alumni Tracer Reports process (10.0). This module captures tracer survey responses from Alumni and processes CHED report requests from the Admin, systematically storing employment status records in the alumni_trackers table (D11).
Figure 4Data Flow Diagram (Level 1)
Entity Relationship Diagram
	Figure 5, the Entity Relationship Diagram (ERD), provides the visual presentation of the relationships among the entities inside the database of the developed Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. The ERD ensured that the proposed system maintained data integrity and a logical, centralized structure anchored primarily by the central User entity. This architectural design makes it easier to manage the attributes and complex relational dependencies of the various user profiles, verified digital portfolios, career job listings, and geofenced time-tracking records present within the platform. Furthermore, the updated diagram reflects the integration of new advanced institutional workflows, specifically incorporating specialized tables for OJT safety governance—such as emergency interruptions and formal pull-out requests—as well as curriculum accreditation tracking through Program Educational Objectives (PEO) definitions and alumni assessments. Ultimately, the ERD was designed to offer the proponents a complete visualization of how these expanded backend components interact, allowing for easier identification, optimization, and analysis of the system's comprehensive data architecture. 
Figure 5Entity Relationship Diagram (ERD)
Use Case Diagram
Figure 6 illustrates the use cases of the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. As depicted in the diagram, there are five primary actors interacting with the platform: the Student OJT, the Alumni, the Company, the OJT Supervisor, and the Admin. The Student OJT is able to manage their profile and portfolio, submit pre-deployment clearance, log their geofenced OJT attendance, manage their resume, and search, browse, and apply for jobs. The Alumni are equipped to manage their resume, search, browse, and apply for jobs, and accept or reject job offers. The Companies, acting as industry partners, are able to upload and track their Memorandum of Agreement (MOA), post OJT and job vacancies, screen applicants and schedule interviews, and evaluate student trainees. Meanwhile, the OJT Supervisors have the capability to review clearances and endorse trainees, monitor overall OJT progress and the Daily Time Record (DTR) map, and author and dispatch evaluation rubrics. Lastly, the Admin oversees the system's core governance, with functionalities to validate companies and MOA contracts, run the skills matching engine, and generate comprehensive institutional reports. 
Figure 6Use Case Diagram
Data Dictionary
The data dictionary is a component that stores the names, definitions, and attributes for data elements present inside the database of the proposed system. The tables listed below are the listings of the actual field names, data types, lengths, and descriptions of data elements that are present in the database of Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 5
User
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the User record. |
| name | varchar | 255 | Full legal name or display name of the user. |
| email | varchar | 255 | Unique corporate, university, or personal email used for login credentials. |
| email_verified_at | timestamp | - | Email verified at recorded for User. |
| password | varchar | 255 | Bcrypt-hashed password string. |
| remember_token | varchar | 100 | Remember token recorded for User. |
| created_at | timestamp | - | System audit timestamp recording when the User entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the User entry was last modified. |
| role | varchar | 255 | Primary authorization role (student, company, supervisor, graduate, jobseeker, admin). |
| onboarding_completed | bool | 1 | Flag indicating whether mandatory onboarding profile wizard was completed. |
| avatar_url | varchar | 255 | Relative or CDN URL pointing to user profile photo image. |
Table 5 is for the core account credentials, authentication records, and system role assignments of all users in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 6
CompanyProfile
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the CompanyProfile record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| company_name | varchar | 255 | Registered business name of the Host Training Establishment. |
| company_location | varchar | 255 | Company location recorded for CompanyProfile. |
| company_type | varchar | 255 | Enterprise classification (Private Corporation, Government, NGO, Startup). |
| website | varchar | 255 | Website recorded for CompanyProfile. |
| created_at | timestamp | - | System audit timestamp recording when the CompanyProfile entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the CompanyProfile entry was last modified. |
| company_size | varchar | 255 | Workforce size tier (1-10, 11-50, 51-200, 201+ employees). |
| contact_email | varchar | 255 | Official HR / internship coordinator email address. |
| contact_phone | varchar | 255 | Official corporate telephone or mobile contact number. |
| description | text | - | Description recorded for CompanyProfile. |
| logo_url | varchar | 255 | Storage URL or CDN link to company corporate logo. |
| profile_completed | bool | 1 | Flag indicating completion of corporate profile accreditation details. |
| contact_person | varchar | 255 | Name of authorized corporate liaison or HR coordinator. |
| moa_file_path | varchar | 255 | Storage path to verified bilateral MOA agreement PDF document. |
| moa_start_date | date | - | Official effective commencement date of partnership MOA. |
| moa_end_date | date | - | Expiration date of MOA contract duration. |
| moa_status | varchar | 255 | Partnership validity state (active, pending, expired, for_renewal). |
| status | varchar | 255 | Status recorded for CompanyProfile. |
| ownership_type | varchar | 255 | Ownership classification (Sole Proprietorship, Partnership, Corporation). |
| year_founded | varchar | 255 | Year when enterprise or organization was officially founded. |
| full_address | varchar | 255 | Physical operational street address of corporate facility. |
| contact_title | varchar | 255 | Job designation or title of primary corporate contact. |
| registration_source | varchar | 255 | Registration pathway (self-registered online or CIER admin provisioned). |
| moa_requested_at | timestamp | - | Timestamp when company initiated formal bilateral MOA partnership request. |
| moa_request_notes | text | - | Administrative remarks regarding MOA review or legal provisions. |
Table 6 is for managing registered company details, workforce sizes, and bilateral Memorandum of Agreement (MOA) partnership contracts in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 7
StudentProfile
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentProfile record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| school | varchar | 255 | University name (Carlos Hilado Memorial State University). |
| campus | varchar | 255 | Campus location (Talisay, Fortune Towne, Binalbagan, Alijis). |
| program | varchar | 255 | Degree program (BS Information Technology, BS Computer Science, etc.). |
| year_level | varchar | 255 | Current academic standing (e.g. 4th Year, Graduating, Alumni). |
| student_id | varchar | 10 | Official university student identification number (e.g. 2022-0145). |
| created_at | timestamp | - | System audit timestamp recording when the StudentProfile entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentProfile entry was last modified. |
| headline | varchar | 255 | Headline recorded for StudentProfile. |
| bio | text | - | Bio recorded for StudentProfile. |
| location | varchar | 255 | Location recorded for StudentProfile. |
| github_url | varchar | 255 | Personal GitHub developer profile link. |
| linkedin_url | varchar | 255 | Professional LinkedIn profile web address. |
| portfolio_url | varchar | 255 | External portfolio website or personal domain link. |
| status | varchar | 255 | Academic placement eligibility status. |
| phone | varchar | 255 | Phone recorded for StudentProfile. |
| cover_color | varchar | 255 | Cover color recorded for StudentProfile. |
| resume_type | varchar | 255 | Selected resume design template layout. |
| resume_objective | text | - | Targeted career objective statement rendered on resume. |
| section | varchar | 255 | Assigned class section block (e.g. 4A, 4B). |
| batch | varchar | 255 | Batch recorded for StudentProfile. |
| requirements_drive_url | text | - | Cloud repository folder URL for internship compliance documentation. |
Table 7 is for storing the student academic profiles, enrolled degree programs, and professional biographies in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 8
SupervisorProfile
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the SupervisorProfile record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| company_name | varchar | 255 | University branch or affiliated industry training organization. |
| position | varchar | 255 | Academic designation (OJT Coordinator, Department Chair, Faculty Mentor). |
| created_at | timestamp | - | System audit timestamp recording when the SupervisorProfile entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the SupervisorProfile entry was last modified. |
| course | varchar | 255 | Supervised degree program course code (BSIT, BSIS, BSCS). |
| phone | varchar | 50 | Official institutional contact phone/mobile number. |
Table 8 is for storing the professional titles, departments, and assigned campus or company affiliations of internship supervisors in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 9
GraduateProfile
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the GraduateProfile record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| year_graduated | varchar | 255 | Academic graduation batch year (e.g. 2024-2025). |
| campus | varchar | 255 | Graduating campus branch. |
| course | varchar | 255 | Completed degree program. |
| section | varchar | 255 | Graduating cohort section. |
| employment_status | varchar | 255 | Current tracer status (employed, looking, freelance, studying). |
| created_at | timestamp | - | System audit timestamp recording when the GraduateProfile entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the GraduateProfile entry was last modified. |
Table 9 is for monitoring the graduation batches, degree programs, and post-graduation employment tracer information of university alumni in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 10
JobseekerProfile
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the JobseekerProfile record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| desired_job_title | varchar | 255 | Target career role (e.g. Full-Stack Developer, QA Analyst). |
| work_preference | varchar | 255 | Preferred workplace modality (Remote, Hybrid, On-site). |
| years_of_experience | varchar | 255 | Total cumulative years of professional work experience. |
| headline | varchar | 255 | Headline recorded for JobseekerProfile. |
| bio | text | - | Bio recorded for JobseekerProfile. |
| location | varchar | 255 | Current residential city or province. |
| portfolio_url | varchar | 255 | External web portfolio or GitHub profile link. |
| linkedin_url | varchar | 255 | Linkedin url recorded for JobseekerProfile. |
| phone | varchar | 255 | Phone recorded for JobseekerProfile. |
| avatar_url | varchar | 255 | Avatar url recorded for JobseekerProfile. |
| profile_completed | bool | 1 | Status flag indicating full profile readiness for recruiters. |
| created_at | timestamp | - | System audit timestamp recording when the JobseekerProfile entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the JobseekerProfile entry was last modified. |
Table 10 is for storing candidate career preferences, desired job titles, professional headlines, and contact details for job placement in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 11
StudentEducation
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentEducation record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| school | varchar | 255 | Academic institution or college attended. |
| degree | varchar | 255 | Degree earned or pursued (e.g. BS in Information Technology). |
| year_start | varchar | 255 | Enrollment matriculation year. |
| year_end | varchar | 255 | Graduation or anticipated completion year. |
| gpa | varchar | 255 | Cumulative Grade Point Average (GPA) or academic evaluation score. |
| description | text | - | Detailed narrative of academic achievements, honors, or extracurricular activities. |
| is_current | bool | 1 | Flag indicating whether the student is currently enrolled. |
| sort_order | int | 10 | Display sorting sequence index. |
| created_at | timestamp | - | System audit timestamp recording when the StudentEducation entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentEducation entry was last modified. |
Table 11 is for maintaining historical educational records, academic institutions, degrees pursued, and matriculation timelines in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 12
StudentSkill
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentSkill record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| name | varchar | 255 | Skill or technology name (e.g. Laravel, React, PostgreSQL). |
| level | smallint | 5 | Competency rating level (0 to 100). |
| category | varchar | 255 | Domain classification (language, framework, database, tool, soft_skill). |
| endorsed_count | int | 10 | Number of validated endorsements received from supervisors. |
| sort_order | int | 10 | Numerical preference order for displaying skills on profile and resume. |
| created_at | timestamp | - | System audit timestamp recording when the StudentSkill entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentSkill entry was last modified. |
Table 12 is for categorizing and tracking itemized technical proficiencies, soft skills, and competency level ratings in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 13
StudentExperience
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentExperience record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| role | varchar | 255 | Position title held during engagement. |
| company | varchar | 255 | Employing enterprise or client name. |
| type | varchar | 255 | Classification (OJT, Freelance, Part-time, Full-time). |
| period_start | varchar | 255 | Commencement date string. |
| period_end | varchar | 255 | Completion date or end of employment/internship engagement. |
| description | text | - | Key responsibilities, achievements, and contributions performed in the role. |
| skills | json | - | JSON array of technical tools, competencies, and technologies applied. |
| is_current | bool | 1 | Flag indicating if the candidate currently holds this active position. |
| sort_order | int | 10 | Display sorting sequence index. |
| created_at | timestamp | - | System audit timestamp recording when the StudentExperience entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentExperience entry was last modified. |
| location | varchar | 255 | Geographical work location or remote employment designation. |
| is_it_related | bool | 1 | Audit flag determining IT curriculum alignment for tracer statistics. |
Table 13 is for documenting past work history, professional roles, companies, freelance projects, and prior practical internships in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 14
StudentAchievement
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentAchievement record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| title | varchar | 255 | Award or certification title (e.g. AWS Certified Cloud Practitioner). |
| description | text | - | Detailed description of the honor, award, or certification earned. |
| type | varchar | 255 | Classification (certification, competition, academic, leadership). |
| icon | varchar | 255 | Icon recorded for StudentAchievement. |
| date | varchar | 255 | Date or year of credential issuance. |
| sort_order | int | 10 | Display sorting sequence index. |
| created_at | timestamp | - | System audit timestamp recording when the StudentAchievement entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentAchievement entry was last modified. |
| issuer | varchar | 255 | Issuing accreditation entity or organization. |
| credential_id | varchar | 10 | Official certificate serial or verification identification code. |
| credential_url | varchar | 255 | Public URL or verification link to authenticate credential. |
| certificate_url | varchar | 255 | Certificate url recorded for StudentAchievement. |
| award_level | varchar | 255 | Scope of recognition (Institutional, Regional, National, International). |
| expires_at | varchar | 255 | Expiration date for time-limited professional certifications. |
| does_not_expire | bool | 1 | Boolean flag indicating lifetime certification validity. |
Table 14 is for recording academic honors, technical certifications, hackathon awards, and recognized co-curricular credentials in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 15
PortfolioProject
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the PortfolioProject record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| title | varchar | 255 | Software project or repository name. |
| description | text | - | Comprehensive overview, problem statement, and solution implemented in project. |
| tech_stack | json | - | Key technologies utilized (e.g. Laravel, Vue.js, Tailwind). |
| project_url | varchar | 255 | Public web URL or GitHub code repository link. |
| repo_url | varchar | 255 | Public GitHub/GitLab source code repository URL. |
| image_url | varchar | 255 | Storage path or URL to project thumbnail preview image. |
| is_featured | bool | 1 | Highlight flag designating project for prominent portfolio display. |
| sort_order | int | 10 | Display sorting sequence index. |
| created_at | timestamp | - | System audit timestamp recording when the PortfolioProject entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the PortfolioProject entry was last modified. |
| category | varchar | 255 | Category recorded for PortfolioProject. |
| role | varchar | 255 | Role recorded for PortfolioProject. |
| date_completed | varchar | 255 | Date completed recorded for PortfolioProject. |
| outcomes | text | - | Measurable outcomes, project impact, and performance metrics achieved. |
Table 15 is for storing portfolio project titles, technical stacks, descriptions, and repository or live demonstration links in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 16
StudentOjtRequirement
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentOjtRequirement record. |
| student_user_id | int | 10 | Foreign key referencing users.id. |
| supervisor_user_id | int | 10 | Foreign key referencing users.id. |
| interest_id | int | 10 | Foreign key referencing student_ojt_interests.id. |
| posting_id | int | 10 | Foreign key referencing ojt_postings.id. |
| title | varchar | 255 | Clearance document title (e.g. Pre-Deployment Document Packet). |
| items | json | - | Array of mandatory compliance item checklists. |
| instructions | text | - | Instructions recorded for StudentOjtRequirement. |
| due_date | date | - | Mandatory deadline for pre-deployment compliance submission. |
| status | varchar | 255 | Verification state (pending, submitted, verified, needs_revision). |
| drive_url | text | - | Cloud storage link for supporting clearance attachments. |
| supervisor_remarks | text | - | Supervisor remarks recorded for StudentOjtRequirement. |
| submitted_at | timestamp | - | Submitted at recorded for StudentOjtRequirement. |
| verified_at | timestamp | - | Timestamp when OJT supervisor verified document compliance. |
| created_at | timestamp | - | System audit timestamp recording when the StudentOjtRequirement entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentOjtRequirement entry was last modified. |
Table 16 is for managing mandatory pre-deployment clearance document submissions, submission statuses, and supervisor approvals in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 17
OjtPosting
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the OjtPosting record. |
| company_user_id | int | 10 | Foreign key referencing users.id. |
| title | varchar | 255 | Internship job title (e.g. Web Developer Trainee). |
| company_name | varchar | 255 | Company name recorded for OjtPosting. |
| company_initial | varchar | 4 | Company initial recorded for OjtPosting. |
| company_color | varchar | 20 | Company color recorded for OjtPosting. |
| department | varchar | 255 | Operating department or business unit hosting internship slot. |
| industry | varchar | 255 | Industry recorded for OjtPosting. |
| location | varchar | 255 | Workplace office location or remote arrangement. |
| description | text | - | Description recorded for OjtPosting. |
| required_skills | json | - | Required skills recorded for OjtPosting. |
| preferred_courses | json | - | Preferred courses recorded for OjtPosting. |
| slots_total | int | 10 | Total allotted trainee capacity quota. |
| slots_remaining | int | 10 | Real-time remaining uncommitted placement slots. |
| duration | varchar | 255 | Expected internship timeframe (e.g. 486 Hours / 3 Months). |
| schedule_type | varchar | 255 | Schedule type recorded for OjtPosting. |
| status | varchar | 255 | Posting state (open, closed, filled, paused). |
| expires_at | timestamp | - | Expires at recorded for OjtPosting. |
| created_at | timestamp | - | System audit timestamp recording when the OjtPosting entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the OjtPosting entry was last modified. |
| branch_name | varchar | 255 | Specific physical company branch or training facility name. |
| latitude | numeric | 10,7 | Geographical latitude coordinate for supervisor monitoring map. |
| longitude | numeric | 10,7 | Geographical longitude coordinate for supervisor monitoring map. |
| learning_outcomes | text | - | Learning outcomes recorded for OjtPosting. |
| required_documents | json | - | JSON array of prerequisites required prior to trainee deployment. |
| qualifications | json | - | Qualifications recorded for OjtPosting. |
Table 17 is for managing On-the-Job Training vacancies, departmental assignments, training locations, and available trainee quota slots in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 18
StudentOjtInterest
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentOjtInterest record. |
| student_user_id | int | 10 | Foreign key referencing users.id. |
| ojt_posting_id | int | 10 | Foreign key referencing ojt_postings.id. |
| status | varchar | 255 | Pipeline workflow status (applied, endorsed, company_accepted, ojt_confirmed). |
| student_message | text | - | Student message recorded for StudentOjtInterest. |
| endorsed_by | int | 10 | Foreign key referencing users.id. |
| endorsed_at | timestamp | - | Endorsed at recorded for StudentOjtInterest. |
| created_at | timestamp | - | System audit timestamp recording when the StudentOjtInterest entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentOjtInterest entry was last modified. |
| endorsement_letter | varchar | 255 | Endorsement letter recorded for StudentOjtInterest. |
| company_accepted_at | timestamp | - | Company accepted at recorded for StudentOjtInterest. |
| endorsement_requested_at | timestamp | - | Endorsement requested at recorded for StudentOjtInterest. |
| ojt_started_at | timestamp | - | Ojt started at recorded for StudentOjtInterest. |
| resume_viewed_at | timestamp | - | Resume viewed at recorded for StudentOjtInterest. |
| company_note | text | - | Company note recorded for StudentOjtInterest. |
| interview_scheduled_at | timestamp | - | Interview scheduled at recorded for StudentOjtInterest. |
| interview_type | varchar | 255 | Interview type recorded for StudentOjtInterest. |
| interview_location | text | - | Interview location recorded for StudentOjtInterest. |
| coordinator_note | text | - | Coordinator note recorded for StudentOjtInterest. |
| endorsement_letter_sent_at | timestamp | - | Endorsement letter sent at recorded for StudentOjtInterest. |
| ojt_start_date | date | - | Agreed upon internship duty start date. |
| ojt_instructions | text | - | Ojt instructions recorded for StudentOjtInterest. |
| schedule_days | json | - | Schedule days recorded for StudentOjtInterest. |
| shift_start | varchar | 10 | Shift start recorded for StudentOjtInterest. |
| shift_end | varchar | 10 | Shift end recorded for StudentOjtInterest. |
| lunch_start | varchar | 10 | Lunch start recorded for StudentOjtInterest. |
| lunch_end | varchar | 10 | Lunch end recorded for StudentOjtInterest. |
| has_lunch_break | bool | 1 | Has lunch break recorded for StudentOjtInterest. |
| daily_hours | numeric | 4,2 | Standard contracted working hours per day. |
| weekly_hours | numeric | 5,2 | Total cumulative contracted hours per week. |
| allow_overtime | bool | 1 | Allow overtime recorded for StudentOjtInterest. |
| max_overtime_hours | numeric | 4,2 | Max overtime hours recorded for StudentOjtInterest. |
| estimated_end_date | date | - | Calculated expected completion target date. |
Table 18 is for tracking student internship applications, coordinator endorsement slips, interview statuses, and company acceptance decisions in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 19
OjtRecord
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the OjtRecord record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| company_name | varchar | 255 | Official name of the Host Training Establishment. |
| supervisor_name | varchar | 255 | Designated industry mentor / supervisor name. |
| supervisor_email | varchar | 255 | Supervisor email recorded for OjtRecord. |
| location | varchar | 255 | Location recorded for OjtRecord. |
| start_date | date | - | Official commencement date of active duty. |
| end_date | date | - | End date recorded for OjtRecord. |
| required_hours | int | 10 | Curricular internship requirement (e.g. 486 Hours for BSIT). |
| completed_hours | numeric | 8,2 | Verified cumulative hours logged by trainee. |
| status | varchar | 255 | Placement lifecycle state (active, completed, dropped, pull_out, emergency_leave). |
| created_at | timestamp | - | System audit timestamp recording when the OjtRecord entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the OjtRecord entry was last modified. |
| company_instructions | text | - | Company instructions recorded for OjtRecord. |
| schedule_days | json | - | Schedule days recorded for OjtRecord. |
| shift_start | varchar | 10 | Shift start recorded for OjtRecord. |
| shift_end | varchar | 10 | Shift end recorded for OjtRecord. |
| lunch_start | varchar | 10 | Lunch start recorded for OjtRecord. |
| lunch_end | varchar | 10 | Lunch end recorded for OjtRecord. |
| has_lunch_break | bool | 1 | Has lunch break recorded for OjtRecord. |
| daily_hours | numeric | 4,2 | Daily hours recorded for OjtRecord. |
| weekly_hours | numeric | 5,2 | Weekly hours recorded for OjtRecord. |
| allow_overtime | bool | 1 | Allow overtime recorded for OjtRecord. |
| max_overtime_hours | numeric | 4,2 | Max overtime hours recorded for OjtRecord. |
| estimated_end_date | date | - | Forecasted conclusion date based on schedule shift parameters. |
Table 19 is for tracking student internship placements, host establishments, required training hours, and cumulative completed hours in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 20
TimeLog
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the TimeLog record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| ojt_record_id | int | 10 | Foreign key referencing ojt_records.id. |
| log_date | date | - | Calendar date of duty rendered. |
| time_in | time | - | Time in recorded for TimeLog. |
| time_out | time | - | Time out recorded for TimeLog. |
| hours_rendered | numeric | 4,2 | Total verified daily credit hours. |
| description | text | - | Description recorded for TimeLog. |
| latitude | numeric | 10,7 | Latitude recorded for TimeLog. |
| longitude | numeric | 10,7 | Longitude recorded for TimeLog. |
| status | varchar | 255 | Audit verification state (pending, approved, rejected). |
| created_at | timestamp | - | System audit timestamp recording when the TimeLog entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the TimeLog entry was last modified. |
| time_in_lat | numeric | 10,7 | Morning clock-in GPS latitude coordinate. |
| time_in_lon | numeric | 10,7 | Morning clock-in GPS longitude coordinate. |
| time_out_lat | numeric | 10,7 | Morning clock-out GPS latitude coordinate. |
| time_out_lon | numeric | 10,7 | Morning clock-out GPS longitude coordinate. |
| location_validity | varchar | 255 | Geofence verification state (valid, out_of_bounds, flagged). |
| distance_meters | int | 10 | Calculated spatial distance in meters from authorized training premises. |
| morning_in | time | - | Morning in recorded for TimeLog. |
| morning_out | time | - | Morning out recorded for TimeLog. |
| afternoon_in | time | - | Afternoon in recorded for TimeLog. |
| afternoon_out | time | - | Afternoon out recorded for TimeLog. |
| morning_hours | numeric | 4,2 | Total credit hours rendered during morning session. |
| afternoon_hours | numeric | 4,2 | Total credit hours rendered during afternoon session. |
| morning_in_lat | numeric | 10,7 | Morning in lat recorded for TimeLog. |
| morning_in_lon | numeric | 10,7 | Morning in lon recorded for TimeLog. |
| morning_out_lat | numeric | 10,7 | Morning out lat recorded for TimeLog. |
| morning_out_lon | numeric | 10,7 | Morning out lon recorded for TimeLog. |
| afternoon_in_lat | numeric | 10,7 | Afternoon session clock-in GPS latitude coordinate. |
| afternoon_in_lon | numeric | 10,7 | Afternoon session clock-in GPS longitude coordinate. |
| afternoon_out_lat | numeric | 10,7 | Afternoon session clock-out GPS latitude coordinate. |
| afternoon_out_lon | numeric | 10,7 | Afternoon session clock-out GPS longitude coordinate. |
| morning_validity | varchar | 255 | Morning validity recorded for TimeLog. |
| afternoon_validity | varchar | 255 | Afternoon validity recorded for TimeLog. |
| auto_morning_timeout | bool | 1 | Auto morning timeout recorded for TimeLog. |
Table 20 is for recording daily trainee attendance, split-session morning and afternoon clock-in/out timestamps, GPS coordinates, and verified hours rendered in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 21
OjtEmergencyRequest
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the OjtEmergencyRequest record. |
| student_user_id | int | 10 | Foreign key referencing users.id. |
| ojt_record_id | int | 10 | Foreign key referencing ojt_records.id. |
| ojt_interest_id | int | 10 | Foreign key referencing student_ojt_interests.id. |
| type | varchar | 30 | Interruption category (temporary_leave, permanent_withdrawal). |
| category | varchar | 50 | Emergency ground (medical, family_emergency, accident, other). |
| reason | text | - | Reason recorded for OjtEmergencyRequest. |
| supporting_document_path | varchar | 255 | Supporting document path recorded for OjtEmergencyRequest. |
| supporting_document_name | varchar | 255 | Supporting document name recorded for OjtEmergencyRequest. |
| start_date | date | - | Beginning date of excused absence or withdrawal. |
| expected_return_date | date | - | Expected return date recorded for OjtEmergencyRequest. |
| actual_return_date | date | - | Actual return date recorded for OjtEmergencyRequest. |
| hours_rendered_snapshot | numeric | 6,2 | Snapshot of hours rendered at time of filing. |
| required_hours_snapshot | numeric | 6,2 | Required hours snapshot recorded for OjtEmergencyRequest. |
| coordinator_status | varchar | 30 | Academic supervisor status (pending, approved, rejected). |
| coordinator_remarks | text | - | Coordinator remarks recorded for OjtEmergencyRequest. |
| coordinator_action_by | int | 10 | Foreign key referencing users.id. |
| coordinator_action_at | timestamp | - | Coordinator action at recorded for OjtEmergencyRequest. |
| credited_hours | numeric | 6,2 | Credited hours recorded for OjtEmergencyRequest. |
| academic_verdict | varchar | 50 | Final academic standing (excused_leave, incomplete_inc, official_drop). |
| company_status | varchar | 30 | Host enterprise clearance status (pending, notified, cleared). |
| company_clearance_notes | text | - | Company clearance notes recorded for OjtEmergencyRequest. |
| company_cleared_at | timestamp | - | Company cleared at recorded for OjtEmergencyRequest. |
| assets_returned | bool | 1 | Assets returned recorded for OjtEmergencyRequest. |
| fit_to_work_document_path | varchar | 255 | Fit to work document path recorded for OjtEmergencyRequest. |
| cleared_to_resume_at | timestamp | - | Cleared to resume at recorded for OjtEmergencyRequest. |
| created_at | timestamp | - | System audit timestamp recording when the OjtEmergencyRequest entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the OjtEmergencyRequest entry was last modified. |
Table 21 is for logging student emergency leave requests, interruption categories, medical certificates, and formal return-to-training clearances in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 22
OjtPullOutRequest
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the OjtPullOutRequest record. |
| student_user_id | int | 10 | Foreign key referencing users.id. |
| ojt_record_id | int | 10 | Foreign key referencing ojt_records.id. |
| ojt_interest_id | int | 10 | Foreign key referencing student_ojt_interests.id. |
| reason_category | varchar | 50 | Classification (breach_of_moa, safety_hostile, task_mismatch, medical_personal). |
| reason | text | - | Reason recorded for OjtPullOutRequest. |
| student_letter_path | varchar | 255 | Student letter path recorded for OjtPullOutRequest. |
| student_letter_name | varchar | 255 | Student letter name recorded for OjtPullOutRequest. |
| hours_rendered_snapshot | numeric | 8,2 | Hours completed prior to requested pull-out. |
| required_hours_snapshot | numeric | 8,2 | Required hours snapshot recorded for OjtPullOutRequest. |
| status | varchar | 40 | Lifecycle status (pending_supervisor, recommended, emailed_to_dean, approved). |
| supervisor_id | int | 10 | Foreign key referencing users.id. |
| supervisor_remarks | text | - | Supervisor remarks recorded for OjtPullOutRequest. |
| supervisor_action_at | timestamp | - | Supervisor action at recorded for OjtPullOutRequest. |
| dean_name | varchar | 255 | Dean name recorded for OjtPullOutRequest. |
| dean_email | varchar | 255 | Dean email recorded for OjtPullOutRequest. |
| generated_letter_body | text | - | Generated letter body recorded for OjtPullOutRequest. |
| delivery_method | varchar | 30 | Delivery method recorded for OjtPullOutRequest. |
| emailed_at | timestamp | - | Emailed at recorded for OjtPullOutRequest. |
| admin_action_by | int | 10 | Foreign key referencing users.id. |
| admin_remarks | text | - | Admin remarks recorded for OjtPullOutRequest. |
| admin_action_at | timestamp | - | Admin action at recorded for OjtPullOutRequest. |
| dean_verdict | varchar | 30 | Official decision of the College Dean (approved, rejected). |
| credited_hours | numeric | 8,2 | Final approved hours credited toward curricular completion. |
| allow_redeployment | bool | 1 | Flag authorizing student trainee for secondary company reassignment. |
| created_at | timestamp | - | System audit timestamp recording when the OjtPullOutRequest entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the OjtPullOutRequest entry was last modified. |
Table 22 is for processing formal trainee withdrawal and pull-out workflows, multi-tiered supervisor recommendations, and dean authorizations in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 23
EvaluationTemplate
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the EvaluationTemplate record. |
| supervisor_id | int | 10 | Foreign key referencing users.id. |
| program | varchar | 50 | Academic degree program (e.g. BSIT 486-Hour Rubric). |
| title | varchar | 255 | Official evaluation title (e.g. OJT Performance Appraisal). |
| description | text | - | Evaluation guidelines and score calculation weighting criteria. |
| is_active | bool | 1 | Flag designating if rubric is currently active for evaluations. |
| created_at | timestamp | - | System audit timestamp recording when the EvaluationTemplate entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the EvaluationTemplate entry was last modified. |
| term | varchar | 20 | Target academic evaluation period (midterm, endterm, both). |
Table 23 is for managing standardized university internship performance evaluation rubrics created by faculty supervisors in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 24
EvaluationQuestion
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the EvaluationQuestion record. |
| template_id | int | 10 | Foreign key referencing evaluation_templates.id. |
| category | varchar | 100 | Competency category (Technical Competence, Work Ethic, Teamwork). |
| question_text | text | - | Specific performance criterion question prompt. |
| question_type | varchar | 30 | Input format (scale, rating, text, boolean). |
| options | json | - | Options recorded for EvaluationQuestion. |
| scale_min | int | 10 | Scale min recorded for EvaluationQuestion. |
| scale_max | int | 10 | Maximum Likert scale value (e.g. 5 for a 1-5 scale). |
| is_required | bool | 1 | Flag mandating question response before submission. |
| sort_order | int | 10 | Display sorting sequence index. |
| created_at | timestamp | - | System audit timestamp recording when the EvaluationQuestion entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the EvaluationQuestion entry was last modified. |
Table 24 is for storing itemized performance criteria, rating questions, and Likert scoring scales belonging to an evaluation rubric in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 25
StudentEvaluation
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentEvaluation record. |
| template_id | int | 10 | Foreign key referencing evaluation_templates.id. |
| student_user_id | int | 10 | Foreign key referencing users.id. |
| company_user_id | int | 10 | Foreign key referencing users.id. |
| supervisor_user_id | int | 10 | Foreign key referencing users.id. |
| ojt_record_id | int | 10 | Foreign key referencing ojt_records.id. |
| ojt_posting_id | int | 10 | Foreign key referencing ojt_postings.id. |
| status | varchar | 30 | Appraisal workflow state (sent, submitted, verified). |
| overall_score | numeric | 5,2 | Composite percentage score computed across all criteria (0 to 100%). |
| general_feedback | text | - | General feedback recorded for StudentEvaluation. |
| recommendation | varchar | 100 | Recommendation recorded for StudentEvaluation. |
| evaluator_name | varchar | 255 | Evaluator name recorded for StudentEvaluation. |
| evaluator_position | varchar | 255 | Evaluator position recorded for StudentEvaluation. |
| sent_at | timestamp | - | Sent at recorded for StudentEvaluation. |
| submitted_at | timestamp | - | Submitted at recorded for StudentEvaluation. |
| created_at | timestamp | - | System audit timestamp recording when the StudentEvaluation entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentEvaluation entry was last modified. |
| term | varchar | 20 | Evaluation period term (midterm, endterm). |
| is_waived | bool | 1 | Flag indicating if evaluation requirement was waived by supervisor. |
| waiver_reason | text | - | Waiver reason recorded for StudentEvaluation. |
| weight | numeric | 4,2 | Academic weighting coefficient (e.g. 0.50 for 50% grade contribution). |
Table 25 is for storing formal internship performance appraisals, evaluator credentials, overall scores, and host company recommendations in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 26
StudentEvaluationAnswer
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the StudentEvaluationAnswer record. |
| student_evaluation_id | int | 10 | Foreign key referencing student_evaluations.id. |
| evaluation_question_id | int | 10 | Foreign key referencing evaluation_questions.id. |
| rating_value | int | 10 | Numeric score assigned by evaluator on Likert scale. |
| text_value | text | - | Qualitative commendation or constructive remarks. |
| created_at | timestamp | - | System audit timestamp recording when the StudentEvaluationAnswer entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the StudentEvaluationAnswer entry was last modified. |
Table 26 is for recording itemized ratings and qualitative feedback given per rubric criterion for student evaluations in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 27
JobListing
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the JobListing record. |
| company_user_id | int | 10 | Foreign key referencing users.id. |
| title | varchar | 255 | Professional job title (e.g. Associate Software Engineer). |
| department | varchar | 255 | Organizational department. |
| location | varchar | 255 | Office location or remote job classification. |
| employment_type | varchar | 255 | Contract structure (Full-time, Part-time, Contract, Internship). |
| salary_range | varchar | 255 | Remuneration compensation package bracket. |
| description | text | - | Description recorded for JobListing. |
| responsibilities | json | - | Responsibilities recorded for JobListing. |
| requirements | json | - | Requirements recorded for JobListing. |
| benefits | json | - | Benefits recorded for JobListing. |
| required_skills | json | - | Required skills recorded for JobListing. |
| status | varchar | 255 | Vacancy status (active, closed, archived). |
| expires_at | timestamp | - | Expires at recorded for JobListing. |
| created_at | timestamp | - | System audit timestamp recording when the JobListing entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the JobListing entry was last modified. |
| experience_level | varchar | 60 | Experience level recorded for JobListing. |
Table 27 is for managing professional career job vacancies, job descriptions, departmental assignments, salary ranges, and hiring statuses in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 28
JobApplication
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the JobApplication record. |
| job_listing_id | int | 10 | Foreign key referencing job_listings.id. |
| applicant_user_id | int | 10 | Foreign key referencing users.id. |
| status | varchar | 255 | Recruitment pipeline state (applied, screening, interview, offered, hired, rejected). |
| match_score | int | 10 | Algorithmically computed resume-to-job competency match percentage. |
| cover_letter | text | - | Candidate letter of intent and qualification summary. |
| notes | text | - | Notes recorded for JobApplication. |
| created_at | timestamp | - | System audit timestamp recording when the JobApplication entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the JobApplication entry was last modified. |
| offer_details | json | - | Offer details recorded for JobApplication. |
| offer_decision | varchar | 20 | Final applicant response to job offer (accepted, declined, pending). |
| offer_decided_at | timestamp | - | Offer decided at recorded for JobApplication. |
Table 28 is for tracking candidate job applications, resume submissions, weighted candidate suitability match scores, and hiring offer decisions in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 29
Interview
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the Interview record. |
| job_application_id | int | 10 | Foreign key referencing job_applications.id. |
| company_user_id | int | 10 | Foreign key referencing users.id. |
| type | varchar | 255 | Session mode (Technical, Initial HR, Final Panel Interview). |
| scheduled_date | date | - | Calendar date of interview meeting. |
| scheduled_time | time | - | Scheduled time recorded for Interview. |
| platform | varchar | 255 | Interview platform (Google Meet, Zoom, On-site Office). |
| status | varchar | 255 | Interview outcome (scheduled, completed, cancelled, rescheduled). |
| notes | text | - | Notes recorded for Interview. |
| created_at | timestamp | - | System audit timestamp recording when the Interview entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the Interview entry was last modified. |
| interviewer_name | varchar | 255 | Interviewer name recorded for Interview. |
| duration | varchar | 255 | Duration recorded for Interview. |
| meeting_link | varchar | 255 | Meeting link recorded for Interview. |
Table 29 is for coordinating and managing candidate recruitment interview schedules, meeting platforms, and interview statuses in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 30
ChatMessage
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the ChatMessage record. |
| conversation_key | varchar | 255 | Conversation key recorded for ChatMessage. |
| sender_id | int | 10 | Foreign key referencing users.id. |
| receiver_id | int | 10 | Foreign key referencing users.id. |
| message | text | - | Message text payload content. |
| read_at | timestamp | - | Timestamp when recipient viewed the message. |
| created_at | timestamp | - | Transmission timestamp. |
| updated_at | timestamp | - | System audit timestamp recording when the ChatMessage entry was last modified. |
Table 30 is for storing direct messaging conversations and communication exchanges between students, supervisors, and industry partners in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 31
AppNotification
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the AppNotification record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| type | varchar | 255 | Event classification (endorsement_issued, eval_submitted, pull_out_updated). |
| title | varchar | 255 | Alert headline message. |
| message | text | - | Detailed descriptive alert explanation. |
| data | json | - | Data recorded for AppNotification. |
| read_at | timestamp | - | Timestamp indicating acknowledgement by user. |
| created_at | timestamp | - | System audit timestamp recording when the AppNotification entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the AppNotification entry was last modified. |
Table 31 is for logging automated system notifications, application status changes, and critical milestone alerts delivered to users in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 32
PeoDefinition
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the PeoDefinition record. |
| program | varchar | 100 | Academic degree program (e.g. Bachelor of Science in Information Technology). |
| code | varchar | 20 | Standard PEO identifier code (e.g. PEO 1, PEO 2, PEO 3, PEO 4). |
| title | varchar | 255 | Descriptive competency title of the objective. |
| description | text | - | Comprehensive narrative definition and graduate expectations. |
| target_benchmark | numeric | 5,2 | Target percentage performance benchmark for accreditation compliance. |
| indicators | json | - | JSON array of measurable performance indicator criteria. |
| sort_order | int | 10 | Display sequence ordering on tracer assessment dashboards. |
| created_at | timestamp | - | System audit timestamp recording when the PeoDefinition entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the PeoDefinition entry was last modified. |
Table 32 is for defining Program Educational Objectives (PEO), competency statements, and performance indicators for curriculum accreditation in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Table 33
AlumniPeoAssessment
| Field Name   | Field Type   | Length   | Description   |
| :--- | :--- | :--- | :--- |
| id | int | 10 | Primary key. Unique auto-incrementing identifier for the AlumniPeoAssessment record. |
| user_id | int | 10 | Foreign key referencing users.id. |
| peo_id | int | 10 | Foreign key referencing peo_definitions.id. |
| score | numeric | 4,2 | Attainment rating score on 1.00 to 5.00 Likert scale. |
| assessment_source | varchar | 50 | Collection method (direct_survey, automated_heuristic, employer_evaluation). |
| survey_year | varchar | 20 | Annual tracer survey collection period (e.g. 2026). |
| evidence_summary | text | - | Qualitative summary evidence supporting PEO competency attainment. |
| created_at | timestamp | - | System audit timestamp recording when the AlumniPeoAssessment entry was created. |
| updated_at | timestamp | - | System audit timestamp recording when the AlumniPeoAssessment entry was last modified. |
Table 33 is for recording alumni graduate outcome assessments and evidence summaries mapped against institutional Program Educational Objectives in the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.

Hardware and Software Requirements
This section presents the hardware and software requirements necessary for the development, deployment, and proper utilization of the Hire Me: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping.
Hardware Requirements
In developing and utilizing the Hire Me platform, the minimum required hardware components and specifications are categorized to accommodate both the system administrators (or local development server) and the general end-users (students, graduates, companies, and supervisors). 
Table 34Hardware And Specifications
| Hardware Components   | Minimum Specifications   |
| Hardware Components   | Minimum Specifications   |
| CPU   | Intel(R) Core(TM) i3 or equivalent @ 1.80GHz or higher   |
| RAM   | 4.00 GB   |
| Hard Disk  Monitor Resolution   Network Connectivity   | 100 GB  1366 x 768  Download Speed: 5Mbps; Upload Speed: 5Mbps   |
Software Requirements
	For the software needed to run CHMSU HireMe, users simply need an up-to-date web browser such as Google Chrome or Microsoft Edge, since the live version of the system will be hosted online where both the website and the database are stored. This setup makes the system faster, more secure, and always accessible. It is also worth noting that while the development was carried out on Windows 11, the system should still work properly on any modern computer that meets the same setup.
Time Table (Gantt Chart)
	The Gantt chart illustrates the timeline and scheduling of each sub-activity within the stages of the Modified Waterfall Model, tracking the project from the initial requirements gathering and beneficiary coordination through development, implementation, and final software evaluation. 
Figure 7Gantt Chart
Chapter 4 
RESULTS AND DISCUSSIONS 
This chapter presents the results and discussions derived from the functionality testing and evaluation of the HIREME: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. It includes system screenshots based on specific features, test case result, and an assessment based on ISO 25010. The results and discussion based on the objectives are presented in this part of the document. 
Presentation of Results 
1. Designed and developed the  HIREME: A Centralized Platform for Digital Portfolio, Career Job Matching Recommendation, and Mapping. The screenshot of the homepage is presented in Figure 
REFERENCES
Published Books/Journals
Abalos, P. N. S., & Palaoag, T. D. (2024). AI-based resume skills extractor and recommender modules for state university human resource analytics system. PES Journal, 6(4). https://pesjournal.net/journal/v6-n4/6.pdf
Adriantantri, E., & Indriani, S. (2023). Decision support system for employee recruitment optimization. World Journal of Advanced Research and Reviews, 17(1), 1275–1285. https://doi.org/10.30574/wjarr.2023.17.1.0184
Ahmed, M. O., Neal, A. O., & Chizoba, C. C. (2026). A digital solution for student internship: Tracking and enhancing student’s experience. Asian Journal of Basic Science & Research, 8(1), 23–36. https://doi.org/10.38177/ajbsr.2026.8103
Alsulami, M. M., Althobaiti, K., & Algethami, H. (2026). JobMatcher: Multi-layer personalized and inclusive job recommendations. Journal of Universal Computer Science, 32(2), 286–302. https://doi.org/10.3897/jucs.157024
Andini, D., Kusnandar, H. F., Andriati, Y. S., Sumarni, R., Faizal, R., Abdillah, W. A., & Marlina, L. (2024). Developing digital portfolios to enhance employability and career success. Dedikasi Sains Dan Teknologi (DST), 4(2), 204–212. https://doi.org/10.47709/dst.v4i2.4925
Ariawan, M. P. A., Atmaja, I. M. A. D. S., Peling, I. B. A., & Agetia, I. W. A. (2025). Student internship control system based on geolocation and QR code. In Proceedings of Atlantis Press. https://doi.org/10.2991/978-94-6463-878-3_42
Cabalbag, A. F., & Ontiveros, M. K. X. (2024). Management information system for tracking on-the-job trainees. International Journal of Arts, Sciences and Education, 5(2), 203–211. http://mail.ijase.org/index.php/ijase/article/view/352
Cabrera, A. B., Centeno, C. J., Mercado, M. A. S., Miranda, J. A. A., Regala, R. C., & Tenio, J. R. M. (2024). Boost your career: Real-time job analytics and job notification using collaborative filtering algorithms. IEEE. https://ieeexplore.ieee.org/abstract/document/10910875
Creswell, J. W., & Creswell, J. D. (2023). Research design: Qualitative, quantitative, and mixed methods approaches (6th ed.). SAGE Publications. https://us.sagepub.com/en-us/nam/research-design/book270550
Cuyag, M. M., Tandog, M. G., & Binayao, B. S. (2025). Evolving meritocracy: Teacher recruitment in the Philippines following DepEd's 2024 guidelines. International Journal of Academic and Practical Research. 
De Castro, C. A. (2026). Employment outcomes of graduates in a state university in the Philippines. MultiRev. https://doi.org/10.31893/multirev.2026427
Erlano-De Torres, J. A. (2021). Implementation of decision support personnel recruitment system for Laguna State Polytechnic University-San Pablo City Campus. International Journal of Managing Information Technology, 13(3), 45–63. https://doi.org/10.5121/ijmit.2021.13304
Foo, B.-L., Ting, C.-Y., & Goh, H. N. (2025). Dynamic job recommendation by profiling undergraduates’ academic performances. Journal of Informatics and Web Engineering, 4(2), 182–208. https://doi.org/10.33093/jiwe.2025.4.2.12
Gauhl, D., Kakkanattu, K., Mukkattu, M. M., & Hanne, T. (2025). Integrating large language models with near real-time web crawling for enhanced job recommendation systems. Computers, 14, 387. https://doi.org/10.3390/computers14090387
Gonzales, J. G., Lagman, A. C., De Angel, R. M., Fernando, M. C. G., Bulacan, R. C. A., & Canlas, J. D. (2024). Graduate tracer monitoring platform with decision support feature. In IEEE ICSGRC 2024 (pp. 261–266).
Idris, M., & Mohammed, M. N. (2023). Design and implementation of an online recruitment system for youth graduates. Open Computer Science Journal.
Idrus, S. A., Wibawa, A. P., Herwanto, H. W., Fauwaz, M. W. R., & Ahmad, F. S. (2021). An automated portfolio for job opportunities. In IEEE ICEEIE 2021 (pp. 516–521). https://doi.org/10.1109/ICEEIE52663.2021.9616818
Kanagamalliga, S., Rajalingam, S., Roshan, R., & Rohith, N. M. (2025). A professional resume generation system using modern web technologies. In ICAAIC 2025 (pp. 1327–1332). https://doi.org/10.1109/ICAAIC64647.2025.11331147
Khan, N., & Routiya, V. (2024). Establishing a centralized recruitment commission for academic staff in India. International Journal of Social Sciences and Management Review, 7(5), 123–136. https://doi.org/10.37602/IJSSMR.2024.7510
Kumar, N., Gupta, M., Sharma, D., & Isaac, O. (2022). Technical job recommendation system using APIs and web crawling. Computational Intelligence and Neuroscience, 2022, 1–11. https://doi.org/10.1155/2022/7797548
Kwieciński, R., Melniczak, G., & Górecki, T. (2023). Comparison of real-time and batch job recommendations. IEEE Access, 11, 20553–20559. https://doi.org/10.1109/ACCESS.2023.3249356
Noche, E. B., & Mendoza, K. R. M. (2025). Development of Colegio De Dagupan on-the-job training portal. AIP Conference Proceedings, 3287, 040002. https://doi.org/10.1063/5.0262366
Oates, B. J., Griffiths, M., & McLean, R. (2025). Researching information systems and computing (3rd ed.). SAGE Publications. https://uk.sagepub.com/en-gb/eur/researching-information-systems-and-computing/book288230
Pacaldo, P. L., Patatag, E., Jayoma, J. M., Maestrado, A., Cadaves, A., & Abao, R. P. (2025). MyIntern: A Centralized Role-Based Web Platform for Internship Coordination and Job Matching in Higher Education. In 2025 9th International Artificial Intelligence and Data Processing Symposium (IDAP) (pp. 1-6). https://doi.org/10.1109/IDAP68205.2025.11222302
Parkar, A., Deshmukh, M. G., & Deshmukh, G. (2025). Job recommendation system. International Journal of Basic and Applied Sciences, 14(3), 163–169. https://doi.org/10.14419/mhjxnq18
Patil, D., Aher, K., Bhoite, A., & Bhosale, A. (2025). AI-powered recruitment systems: Conversational assessment and predictive shortlisting. International Journal of Advanced Research in Science, Communication and Technology, 354–361. https://doi.org/10.48175/IJARSCT-29846
Priya, S. K., Julious, I. C., & Abisha, D. (2025). Smart campus placement system. In ICSCDS 2025. https://doi.org/10.1109/ICSCDS65426.2025.11167857
Richey, R. C., & Klein, J. D. (2007). Design and development research: Methods, strategies, and issues. Routledge.
Sahoo, D., Nayak, S. C., Paul, N. R., Saha, S., Patra, P. R., & Kuanr, P. K. (2023). Designed framework for advanced intelligent job recommendation system. In OCIT 2023 (pp. 880–885). https://doi.org/10.1109/OCIT59427.2023.10430867
Setiawan, W. F., Shanty, R. N. T., & Swastyastu, C. A. (2024). Automated web-based curriculum vitae system with QR code integration. Jutisi: Jurnal Ilmiah Teknik Informatika dan Sistem Informasi, 13, 536–549. https://doi.org/10.35889/jutisi.v13i1.1874
Silva, G. L. L. I., Jayasinghe, T. L., Rangalla, R. H. M., Gunarathna, W. K. L., & Tissera, W. (2022). An automated system for employee recruitment management. In ICAC 2022 (pp. 346–351). https://doi.org/10.1109/ICAC57685.2022.10025159
Yasi, N. M. E., Supat, P. S., Tayco, R. O., & Balansag, S. S. (2025). Bridging the gap: Employability outcomes of state university graduates in the Philippines. Social Science and Human Research Bulletin, 2(11). https://doi.org/10.55677/SSHRB/2025-3050-1105
Online Sources
Alviar, M. I. V., Galang, A. A. D., & Contillo, G. L. (2025). Optimizing job search through a user-centric job recommender system. https://ijirt.org/publishedpaper/IJIRT187725_PAPER.pdf
Melchor, M. (2024). Resolving education-employment mismatches in the Philippines. SSRN. https://doi.org/10.2139/ssrn.4952062
Pandey, K., John, C. A., Nanjundan, D., Sri Saiomkar, R., & Reddy, C. G. (2021). Portfolio builder and career recommender using Flask and TensorFlow. 
APPENDICES
APPENDIX A
Transmittal Letters
Appendix B
Evaluation Tools
RESEARCH INSTRUMENT
HIRE ME: A CENTRALIZED PLATFORM FOR DIGITAL PORTFOLIO, CAREER JOB MATCHINGRECOMMENDATION, AND MAPPING
Type of Respondent:
☐ CIER Office Personnel   ☐ OJT Supervisors   ☐ Partner Company HR Representatives
☐ IT Professionals   ☐ IT Students and Alumni

Direction: The following statements are designed to assess the software product quality of the System Project based on the ISO/IEC 25010:2011 standard. Kindly review each statement carefully and please check (/) the appropriate box for each statement that corresponds to the answer you selected using the scale below:

Rating scale:
| Code | Interpretation | Description |
| 5 | Excellent | 4.51 – 5.00. The system is complete and fully functional. |
| 4 | Very Good | 3.51 – 4.50. The system is complete and functional. |
| 3 | Good | 2.51 – 3.50 The system is somewhat complete and functional. |
| 2 | Poor | 1.51 – 2.50. The system is incomplete and somewhat functional. |
| 1 | Very Poor | 1.50 - below. The system is incomplete and non-functional. |

| A. Functional Suitability | 5 | 4 | 3 | 2 | 1 |
| 1. Functional completeness. Degree to which the set of functions covers all the specified tasks and user objectives. | | | | | |
| 2. Functional correctness. Degree to which a product or system provides the correct results with the needed degree of precision. | | | | | |
| 3. Functional appropriateness. Degree to which the functions facilitate the accomplishment of specified tasks and objectives. | | | | | |
| Total Score / Mean Score | | | | | |

| B. Performance Efficiency | 5 | 4 | 3 | 2 | 1 |
| 1. Time Behavior. The response and processing times and throughput rates of a product or system, when performing its functions meet requirements. | | | | | |
| 2. Resource Utilization. The amount and types of resources used by the system, when performing its functions, meet requirements. | | | | | |
| 3. Capacity. The maximum limits of a product or system parameter meet requirements. | | | | | |
| Total Score / Mean Score | | | | | |

| C. Usability | 5 | 4 | 3 | 2 | 1 |
| 1. Appropriateness recognizability. Degree to which users can recognize whether a product or system is appropriate for their needs. | | | | | |
| 2. Learnability. Degree to which a product or system can be used by specified users to achieve specified goals of learning to use the product or system with effectiveness, efficiency, freedom from risk and satisfaction in a specified context of use. | | | | | |
| 3. Operability. Degree to which a product or system has attributes that make it easy to operate and control. | | | | | |
| 4. User error protection. Degree to which a system protects users against making errors. | | | | | |
| 5. User interface aesthetics. Degree to which a user interface enables pleasing and satisfying interaction for the user. | | | | | |
| 6. Accessibility. Degree to which a product or system can be used by people with the widest range of characteristics and capabilities to achieve a specified goal in a specified context of use. | | | | | |
| Total Score / Mean Score | | | | | |

| D. Compatibility | 5 | 4 | 3 | 2 | 1 |
| 1. Co-existence. Degree to which a product can perform its required functions efficiently while sharing a common environment and resources with other products, without detrimental impact on any other product. | | | | | |
| 2. Interoperability. Degree to which two or more systems, products or components can exchange information and use the information that has been exchanged. | | | | | |
| Total Score / Mean Score | | | | | |

| E. Reliability | 5 | 4 | 3 | 2 | 1 |
| 1. Maturity. Degree to which a system, product or component meets needs for reliability under normal operation. | | | | | |
| 2. Availability. Degree to which a system, product or component is operational and accessible when required for use. | | | | | |
| 3. Fault tolerance. Degree to which a system, product or component operates as intended despite the presence of hardware or software fault. | | | | | |
| 4. Recoverability. Degree to which, in the event of an interruption or a failure, a product or system can recover the data directly affected and re-establish the desired state of the system. | | | | | |
| Total Score / Mean Score | | | | | |

| F. Security | 5 | 4 | 3 | 2 | 1 |
| 1. Confidentiality. Degree to which a product or system ensures that data are accessible only to those authorized to have access. | | | | | |
| 2. Integrity. Degree to which a system, product or component prevents unauthorized access to, or modification of, computer programs or data. | | | | | |
| 3. Non-repudiation. Degree to which actions or events can be proven to have taken place, so that the events or actions cannot be repudiated later. | | | | | |
| 4. Accountability. Degree to which the actions of an entity can be traced uniquely to the entity. | | | | | |
| 5. Authenticity. Degree to which the identity of a subject or resource can be proved to be the one claimed. | | | | | |
| Total Score / Mean Score | | | | | |

| G. Maintainability | 5 | 4 | 3 | 2 | 1 |
| 1. Modularity. Degree to which a system or computer program is composed of discrete components such that a change to one component has minimal impact on other components. | | | | | |
| 2. Reusability. Degree to which an asset can be used in more than one system, or in building other assets. | | | | | |
| 3. Analyzability. Degree of effectiveness and efficiency with which it is possible to assess the impact on a product or system of an intended change to one or more of its parts, or to diagnose a product for deficiencies or causes of failures, or to identify parts to be modified. | | | | | |
| 4. Modifiability. Degree to which a product or system can be effectively and efficiently modified without introducing defects or degrading existing product quality. | | | | | |
| 5. Testability. Degree of effectiveness and efficiency with which test criteria can be established for a system, product or component and tests can be performed to determine whether those criteria have been met. | | | | | |
| Total Score / Mean Score | | | | | |

| H. Portability | 5 | 4 | 3 | 2 | 1 |
| 1. Adaptability. Degree to which a product or system can effectively and efficiently be adapted for different or evolving hardware, software or other operational or usage environments. | | | | | |
| 2. Installability. Degree of effectiveness and efficiency with which a product or system can be successfully installed and/or uninstalled in a specified environment. | | | | | |
| 3. Replaceability. Degree to which a product can replace another specified software product for the same purpose in the same environment. | | | | | |
| Total Score / Mean Score | | | | | |
| Overall Score and Mean Score | | | | | |

___________________________________
Signature

___________________________________
Date

TEST CASE EVALUATION INSTRUMENT FOR IT PROFESSIONALS

Evaluator Name (Optional): _________________________________
Age: _____ Sex: _____
Occupation: _____________________________________________
Device Used: ____________________________________________
Experience Level: ________________________________________

General Instructions: This test case evaluation checklist is designed to verify the functional correctness of the "Hire Me" platform. As an IT Professional, you are requested to execute the predefined test steps and verify if the system's actual behavior matches the expected result. Please mark the status as "Pass" if the system functions correctly, or "Fail" if an error or unexpected behavior occurs. You may utilize the remarks column to note any technical observations, bugs, or mapping/algorithmic inaccuracies.

I. Test Case Rating Scale and Interpretation
| Percentage of Passed Test Cases | Descriptive Rating | Interpretation |
| :--- | :--- | :--- |
| 96% – 100% | Excellent | The system passed almost all test cases and functions correctly with minimal or no errors. |
| 90% – 95% | Very Good | The system passed most test cases with only minor issues detected. |
| 85% – 89% | Good | The system functions properly but requires some improvements in certain features. |
| 80% – 84% | Fair | The system meets basic functional requirements but several issues need correction. |
| Below 80% | Poor | The system failed significant test cases and requires major revisions and debugging. |

II. Test Case Execution Checklist
| Test Case ID | Test Scenario / Objective | Test Description | Preconditions | Test Steps | Expected Result | Status (Pass/Fail) | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | User Auth | Verify login with valid credentials | User is registered | 1. Enter valid username & password<br>2. Click login | User is successfully authenticated and redirected to the dashboard. | | |
| TC-02 (Neg) | User Auth | Verify login with invalid password | User is registered | 1. Enter correct username & wrong password<br>2. Click login | System denies access and an error message is displayed. | | |
| TC-03 | Resume Builder | Verify system saves digital portfolio | Student is logged in | 1. Fill in all academic and skills fields<br>2. Click Save | System successfully saves the record and generates the resume view. | | |
| TC-04 (Neg) | Resume Builder | Verify behavior when required fields are blank | Student is logged in | 1. Leave mandatory fields blank<br>2. Click Save | System prevents saving and highlights required fields with an error prompt. | | |
| TC-05 | Job Posting | Verify company can post an OJT opening | Company is logged in | 1. Click Add New Post<br>2. Fill details and Submit | System adds the new OJT opening to the active listings database. | | |
| TC-06 | Matching Algo | Verify weighted scoring engine returns matches | Student has completed skills profile | 1. Navigate to Job Recommendations | System accurately displays jobs ordered by highest match percentage based on skills. | | |
| TC-07 | Mapping API | Verify system generates an OJT route | Supervisor is logged in | 1. Select deployed student<br>2. Click "View Route" | Mapping API renders a valid route between the two location coordinates. | | |
| TC-08 (Neg) | Mapping API | Verify mapping behavior with invalid address | Supervisor is logged in | 1. Input an invalid company address<br>2. Click "View Route" | System displays an error stating the address cannot be mapped/located. | | |
| TC-09 | Application | Verify student can apply for matched OJT | Student is logged in | 1. View matched OJT<br>2. Click "Apply" | Application is submitted and status changes to "Pending". | | |
| TC-10 | Analytics | Verify Admin can generate placement reports | Admin is logged in | 1. Select parameters<br>2. Click Generate | System accurately compiles data and generates a downloadable report. | | |

Signature over Printed Name of IT Professional Evaluator Date: _________________