# CHMSU HireMe — Core Academic Data Dictionary (17 Entities)

> **Document Type:** Research Paper Technical Appendix / Database Specification  
> **System:** CHMSU HireMe Integrated OJT & Career Placement Management System  
> **Target Diagram:** `erd_core_academic.svg` / `erd_core_academic.png`  
> **Parity Guarantee:** Exactly 17 Entities, identical attribute names, keys, and Crow's foot cardinalities.  
> **Last Updated:** October 14, 2026  

---

### 1. Entity: `User` (Table: `users`)
- **Domain:** Authentication & Access Control
- **Description:** Central user identity record for all system actors (students, company managers, supervisors, graduates, jobseekers, admins).

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate primary key identifying the user. |
| `name` | `varchar(255)` | **-** | No | Full legal name or display name of the user. |
| `email` | `varchar(255)` | **Unique** | No | Unique corporate, university, or personal email used for login credentials. |
| `password` | `varchar(255)` | **-** | No | Bcrypt-hashed password string. |
| `role` | `varchar(50)` | **-** | No | Primary authorization role (student, company, supervisor, graduate, jobseeker, admin). |
| `onboarding_completed` | `boolean` | **-** | No | Flag indicating whether mandatory onboarding profile wizard was completed. |
| `avatar_url` | `varchar(255)` | **-** | Yes | Relative or CDN URL pointing to user profile photo image. |

---

### 2. Entity: `CompanyProfile` (Table: `company_profiles`)
- **Domain:** Host Training Establishment & Industry Partnerships
- **Description:** Host Training Establishment (HTE) corporate profile and Memorandum of Agreement (MOA) tracking.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for company profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing company representative user account. |
| `company_name` | `varchar(255)` | **-** | No | Registered business name of the Host Training Establishment. |
| `company_type` | `varchar(100)` | **-** | No | Enterprise classification (Private Corporation, Government, NGO, Startup). |
| `company_size` | `varchar(50)` | **-** | No | Workforce size tier (1-10, 11-50, 51-200, 201+ employees). |
| `contact_email` | `varchar(255)` | **-** | No | Official HR / internship coordinator email address. |
| `moa_status` | `varchar(50)` | **-** | No | Partnership validity state (active, pending, expired, for_renewal). |
| `moa_file_path` | `varchar(255)` | **-** | Yes | Storage path to verified bilateral MOA agreement PDF document. |
| `moa_start_date` | `date` | **-** | Yes | Official effective commencement date of partnership MOA. |
| `moa_end_date` | `date` | **-** | Yes | Expiration date of MOA contract duration. |

---

### 3. Entity: `GraduateProfile` (Table: `graduate_profiles`)
- **Domain:** Alumni & Graduate Tracer Studies
- **Description:** Alumni graduation metadata used for institutional graduate tracer studies and career outcomes.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for graduate profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing graduate user in users.id. |
| `year_graduated` | `varchar(50)` | **-** | No | Academic graduation batch year (e.g. 2024-2025). |
| `campus` | `varchar(100)` | **-** | No | Graduating campus branch. |
| `course` | `varchar(100)` | **-** | No | Completed degree program. |
| `section` | `varchar(20)` | **-** | Yes | Graduating cohort section. |
| `employment_status` | `varchar(50)` | **-** | No | Current tracer status (employed, looking, freelance, studying). |

---

### 4. Entity: `SupervisorProfile` (Table: `supervisor_profiles`)
- **Domain:** Academic Faculty & OJT Coordination
- **Description:** Faculty internship coordinators and designated academic supervisors.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for supervisor profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing supervisor user account in users.id. |
| `company_name` | `varchar(255)` | **-** | Yes | University branch or affiliated industry training organization. |
| `position` | `varchar(100)` | **-** | No | Academic designation (OJT Coordinator, Department Chair, Faculty Mentor). |
| `course` | `varchar(100)` | **-** | No | Supervised degree program course code (BSIT, BSIS, BSCS). |
| `phone` | `varchar(50)` | **-** | Yes | Official institutional contact phone/mobile number. |

---

### 5. Entity: `PeoDefinition` (Table: `peo_definitions`)
- **Domain:** Accreditation & Curriculum Objectives
- **Description:** Program Educational Objectives (PEOs) defined for BSIT/BSCS degree programs pursuant to CHED and institutional accreditation standards.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate primary key for PEO statement. |
| `program` | `varchar(100)` | **-** | No | Academic degree program (e.g. Bachelor of Science in Information Technology). |
| `code` | `varchar(20)` | **-** | No | Standard PEO identifier code (e.g. PEO 1, PEO 2, PEO 3, PEO 4). |
| `title` | `varchar(255)` | **-** | No | Descriptive competency title of the objective. |
| `description` | `text` | **-** | No | Comprehensive narrative definition and graduate expectations. |
| `target_benchmark` | `numeric(5,2)` | **-** | No | Institutional target attainment benchmark percentage (e.g. 70.00%). |
| `indicators` | `json` | **-** | Yes | JSON array of measurable performance indicator criteria. |
| `sort_order` | `integer` | **-** | No | Display sequence ordering on tracer assessment dashboards. |

---

### 6. Entity: `JobListing` (Table: `job_listings`)
- **Domain:** Career Placement & Job Recruitment
- **Description:** Full-time, contractual, and graduate career vacancies posted by partner companies.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key for career opening. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing recruiting enterprise. |
| `title` | `varchar(255)` | **-** | No | Professional job title (e.g. Associate Software Engineer). |
| `department` | `varchar(100)` | **-** | No | Organizational department. |
| `location` | `varchar(255)` | **-** | No | Office location or remote job classification. |
| `employment_type` | `varchar(50)` | **-** | No | Contract structure (Full-time, Part-time, Contract, Internship). |
| `salary_range` | `varchar(100)` | **-** | Yes | Remuneration compensation package bracket. |
| `status` | `varchar(50)` | **-** | No | Vacancy status (active, closed, archived). |

---

### 7. Entity: `JobApplication` (Table: `job_applications`)
- **Domain:** Career Placement & Job Recruitment
- **Description:** Career applications submitted by graduates, students, or registered jobseekers.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `job_listing_id` | `bigint` | **FK -> job_listings.id** | No | Foreign key referencing target job opening. |
| `applicant_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing candidate applicant user. |
| `status` | `varchar(50)` | **-** | No | Recruitment pipeline state (applied, screening, interview, offered, hired, rejected). |
| `match_score` | `numeric(5,2)` | **-** | Yes | Algorithmically computed resume-to-job competency match percentage. |
| `cover_letter` | `text` | **-** | Yes | Candidate letter of intent and qualification summary. |
| `offer_decision` | `varchar(50)` | **-** | Yes | Final applicant response to job offer (accepted, declined, pending). |

---

### 8. Entity: `StudentProfile` (Table: `student_profiles`)
- **Domain:** Actor Metadata & Academic Profiles
- **Description:** Extended academic profile for enrolled undergraduate student trainees.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for student profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing the parent user identity. |
| `student_id` | `varchar(50)` | **Unique** | No | Official university student identification number (e.g. 2022-0145). |
| `school` | `varchar(255)` | **-** | No | University name (Carlos Hilado Memorial State University). |
| `campus` | `varchar(100)` | **-** | No | Campus location (Talisay, Fortune Towne, Binalbagan, Alijis). |
| `program` | `varchar(100)` | **-** | No | Degree program (BS Information Technology, BS Computer Science, etc.). |
| `year_level` | `varchar(50)` | **-** | No | Current academic standing (e.g. 4th Year, Graduating, Alumni). |
| `section` | `varchar(20)` | **-** | Yes | Assigned class section block (e.g. 4A, 4B). |
| `requirements_drive_url` | `varchar(255)` | **-** | Yes | Google Drive folder link for submitted clearance requirements. |
| `status` | `varchar(50)` | **-** | No | Academic placement eligibility status. |

---

### 9. Entity: `OjtPosting` (Table: `ojt_postings`)
- **Domain:** OJT Internship Lifecycle & Vacancies
- **Description:** Internship openings posted by verified Host Training Establishments (HTEs).

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate primary key for vacancy posting. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing HTE employer user. |
| `title` | `varchar(255)` | **-** | No | Internship job title (e.g. Web Developer Trainee). |
| `department` | `varchar(100)` | **-** | No | Operating business unit (e.g. IT Solutions, QA Dept). |
| `location` | `varchar(255)` | **-** | No | Workplace office location or remote arrangement. |
| `slots_total` | `integer` | **-** | No | Total allotted trainee capacity quota. |
| `slots_remaining` | `integer` | **-** | No | Real-time remaining uncommitted placement slots. |
| `duration` | `varchar(50)` | **-** | Yes | Expected internship timeframe (e.g. 486 Hours / 3 Months). |
| `status` | `varchar(50)` | **-** | No | Posting state (open, closed, filled, paused). |

---

### 10. Entity: `StudentOjtInterest` (Table: `student_ojt_interests`)
- **Domain:** OJT Internship Lifecycle & Placement Pipeline
- **Description:** Formal internship application pipeline tracking coordinator endorsements, schedule contracts, and company acceptance.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `student_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing applicant student user. |
| `ojt_posting_id` | `bigint` | **FK -> ojt_postings.id** | No | Foreign key referencing targeted OJT vacancy. |
| `endorsed_by` | `bigint` | **FK -> users.id** | Yes | Foreign key referencing academic supervisor who issued endorsement. |
| `status` | `varchar(50)` | **-** | No | Pipeline workflow status (applied, endorsed, company_accepted, ojt_confirmed). |
| `ojt_start_date` | `date` | **-** | Yes | Agreed upon internship duty start date. |
| `daily_hours` | `numeric(4,2)` | **-** | Yes | Standard contracted working hours per day. |
| `weekly_hours` | `numeric(4,2)` | **-** | Yes | Total cumulative contracted hours per week. |
| `estimated_end_date` | `date` | **-** | Yes | Calculated expected completion target date. |

---

### 11. Entity: `StudentEducation` (Table: `student_education`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Academic background records displayed on the verified student resume.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user account. |
| `school` | `varchar(255)` | **-** | No | Academic institution or college attended. |
| `degree` | `varchar(255)` | **-** | No | Degree earned or pursued (e.g. BS in Information Technology). |
| `year_start` | `varchar(20)` | **-** | Yes | Enrollment matriculation year. |
| `year_end` | `varchar(20)` | **-** | Yes | Graduation or anticipated completion year. |
| `is_current` | `boolean` | **-** | No | Flag indicating whether student is actively enrolled. |

---

### 12. Entity: `StudentExperience` (Table: `student_experiences`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Past work history, freelance contracts, and prior internship roles.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `role` | `varchar(100)` | **-** | No | Position title held during engagement. |
| `company` | `varchar(255)` | **-** | No | Employing enterprise or client name. |
| `type` | `varchar(50)` | **-** | No | Classification (OJT, Freelance, Part-time, Full-time). |
| `period_start` | `varchar(50)` | **-** | Yes | Commencement date string. |
| `is_it_related` | `boolean` | **-** | No | Audit flag determining IT curriculum alignment for tracer statistics. |

---

### 13. Entity: `StudentSkill` (Table: `student_skills`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Itemized competencies, programming skills, and supervisor validation endorsements.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `name` | `varchar(100)` | **-** | No | Skill or technology name (e.g. Laravel, React, PostgreSQL). |
| `level` | `integer` | **-** | No | Competency rating level (0 to 100). |
| `category` | `varchar(50)` | **-** | No | Domain classification (language, framework, database, tool, soft_skill). |
| `endorsed_count` | `integer` | **-** | No | Number of validated endorsements received from supervisors. |

---

### 14. Entity: `PortfolioProject` (Table: `portfolio_projects`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Software repositories, capstone projects, and deployed web portfolio systems.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `title` | `varchar(255)` | **-** | No | Software project or repository name. |
| `tech_stack` | `varchar(255)` | **-** | No | Key technologies utilized (e.g. Laravel, Vue.js, Tailwind). |
| `project_url` | `varchar(255)` | **-** | Yes | Public web URL or GitHub code repository link. |
| `description` | `text` | **-** | Yes | System architecture overview and feature contributions. |

---

### 15. Entity: `Interview` (Table: `interviews`)
- **Domain:** Career Placement & Job Recruitment
- **Description:** Recruitment interview sessions scheduled between corporate hiring teams and candidates.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `job_application_id` | `bigint` | **FK -> job_applications.id** | No | Foreign key referencing applicant job application. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing hiring manager user. |
| `type` | `varchar(50)` | **-** | No | Session mode (Technical, Initial HR, Final Panel Interview). |
| `scheduled_date` | `date` | **-** | No | Calendar date of interview meeting. |
| `platform` | `varchar(100)` | **-** | No | Interview platform (Google Meet, Zoom, On-site Office). |
| `status` | `varchar(50)` | **-** | No | Interview outcome (scheduled, completed, cancelled, rescheduled). |

---

### 16. Entity: `OjtRecord` (Table: `ojt_records`)
- **Domain:** OJT Placement & Progress Tracking
- **Description:** Active internship placement contract tracking required curriculum hours versus rendered progress.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing deployed trainee student. |
| `company_name` | `varchar(255)` | **-** | No | Official name of the Host Training Establishment. |
| `supervisor_name` | `varchar(255)` | **-** | Yes | Designated industry mentor / supervisor name. |
| `required_hours` | `integer` | **-** | No | Curricular internship requirement (e.g. 486 Hours for BSIT). |
| `completed_hours` | `numeric(6,2)` | **-** | No | Verified cumulative hours logged by trainee. |
| `start_date` | `date` | **-** | Yes | Official commencement date of active duty. |
| `estimated_end_date` | `date` | **-** | Yes | Forecasted conclusion date based on schedule shift parameters. |
| `status` | `varchar(50)` | **-** | No | Placement lifecycle state (active, completed, dropped, pull_out, emergency_leave). |

---

### 17. Entity: `TimeLog` (Table: `time_logs`)
- **Domain:** Daily Attendance & Geofenced Timekeeping
- **Description:** Daily Time Record (DTR) morning/afternoon split-session check-ins with automated GPS geofence validation.

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing trainee student. |
| `ojt_record_id` | `bigint` | **FK -> ojt_records.id** | Yes | Foreign key referencing active placement record. |
| `log_date` | `date` | **-** | No | Calendar date of duty rendered. |
| `morning_hours` | `numeric(4,2)` | **-** | No | Total credit hours rendered during morning session. |
| `afternoon_hours` | `numeric(4,2)` | **-** | No | Total credit hours rendered during afternoon session. |
| `hours_rendered` | `numeric(4,2)` | **-** | No | Total verified daily credit hours. |
| `location_validity` | `varchar(50)` | **-** | Yes | GPS validation result (In Site [<=100m], Too Far, Verified). |
| `status` | `varchar(50)` | **-** | No | Audit verification state (pending, approved, rejected). |

---
