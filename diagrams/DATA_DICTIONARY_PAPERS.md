# Carlos Hilado Memorial State University (CHMSU)
## CHMSU HireMe Integrated OJT & Placement Platform — Academic Data Dictionary

> **Document Type:** Research Paper Technical Appendix / Database Specification  
> **Target System:** CHMSU HireMe Integrated OJT & Career Placement Management System  
> **Database Engine:** PostgreSQL 16 (Laravel 12 Eloquent Architecture)  
> **Total Core Entities:** 26 System Entities  
> **Attribute Constraint:** Strictly &le; 10 attributes per entity (under the 12+ limit)  
> **Notation:** Crow's Foot Entity-Relationship Model (1:1, 1:N, N:1)  

---

### 1. System Architecture & Domain Taxonomy

The relational database schema is structured into seven operational domains:
1. **Authentication & Core Access Control (`auth`):** Central user identity management across all user actors (`User`).
2. **Actor Profiles & Role Metadata (`profile`):** Entity specialization for students (`StudentProfile`), host companies (`CompanyProfile`), faculty supervisors (`SupervisorProfile`), graduates (`GraduateProfile`), jobseekers (`JobseekerProfile`), and longitudinal tracer surveys (`AlumniTracker`).
3. **Verified Digital Portfolio & Credentials (`portfolio`):** Verified academic credentials (`StudentEducation`), technical proficiencies (`StudentSkill`), work history (`StudentExperience`), verified achievements (`StudentAchievement`), and project repositories (`PortfolioProject`).
4. **OJT Internship Lifecycle & Daily Monitoring (`ojt`):** Internship vacancy postings (`OjtPosting`), application pipeline (`StudentOjtInterest`), pre-deployment clearance (`StudentOjtRequirement`), active training contracts (`OjtRecord`), and geofenced attendance logs (`TimeLog`).
5. **Trainee Performance Evaluation (`eval`):** Standardized rubrics (`EvaluationTemplate`), question criteria (`EvaluationQuestion`), employer performance appraisals (`StudentEvaluation`), and itemized Likert scores (`StudentEvaluationAnswer`).
6. **Career Recruitment & Job Placement (`job`):** Industry career openings (`JobListing`), candidate job applications (`JobApplication`), and scheduled interview sessions (`Interview`).
7. **System Communication & Alerts (`comm`):** Direct message threads (`ChatMessage`) and automated event notifications (`AppNotification`).

---

### 2. Comprehensive Entity Data Dictionary

#### 2.1. Entity: `User` (Table: `users`)
- **Domain:** Authentication & Access Control
- **Description:** Central user identity record for all system actors (students, company managers, supervisors, graduates, jobseekers, admins).
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate primary key identifying the user. |
| `name` | `varchar(255)` | - | No | Full legal name or display name of the user. |
| `email` | `varchar(255)` | **Unique** | No | Unique corporate, university, or personal email used for login credentials. |
| `password` | `varchar(255)` | - | No | Bcrypt-hashed password string. |
| `role` | `varchar(50)` | - | No | Primary authorization role (student, company, supervisor, graduate, jobseeker, admin). |
| `onboarding_completed` | `boolean` | - | No | Flag indicating whether mandatory onboarding profile wizard was completed. |
| `avatar_url` | `varchar(255)` | - | Yes | Relative or CDN URL pointing to user profile photo image. |

---

#### 2.2. Entity: `StudentProfile` (Table: `student_profiles`)
- **Domain:** Actor Metadata & Academic Profiles
- **Description:** Extended academic profile for enrolled undergraduate student trainees.
- **Attribute Count:** 10 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for student profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing the parent user identity. |
| `student_id` | `varchar(50)` | **Unique** | No | Official university student identification number (e.g. 2022-0145). |
| `school` | `varchar(255)` | - | No | University name (Carlos Hilado Memorial State University). |
| `campus` | `varchar(100)` | - | No | Campus location (Talisay, Fortune Towne, Binalbagan, Alijis). |
| `program` | `varchar(100)` | - | No | Degree program (BS Information Technology, BS Computer Science, etc.). |
| `year_level` | `varchar(50)` | - | No | Current academic standing (e.g. 4th Year, Graduating, Alumni). |
| `section` | `varchar(20)` | - | Yes | Assigned class section block (e.g. 4A, 4B). |
| `headline` | `varchar(255)` | - | Yes | Professional bio headline or career objective statement. |
| `bio` | `text` | - | Yes | Narrative description of career goals, competencies, and aspirations. |

---

#### 2.3. Entity: `CompanyProfile` (Table: `company_profiles`)
- **Domain:** Host Training Establishment & Industry Partnerships
- **Description:** Host Training Establishment (HTE) corporate profile and Memorandum of Agreement (MOA) tracking.
- **Attribute Count:** 10 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for company profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing company representative user account. |
| `company_name` | `varchar(255)` | - | No | Registered business name of the Host Training Establishment. |
| `company_type` | `varchar(100)` | - | No | Enterprise classification (Private Corporation, Government, NGO, Startup). |
| `company_size` | `varchar(50)` | - | No | Workforce size tier (1-10, 11-50, 51-200, 201+ employees). |
| `contact_email` | `varchar(255)` | - | No | Official HR / internship coordinator email address. |
| `moa_status` | `varchar(50)` | - | No | Partnership validity state (active, pending, expired, for_renewal). |
| `moa_file_path` | `varchar(255)` | - | Yes | Storage path to verified bilateral MOA agreement PDF document. |
| `moa_start_date` | `date` | - | Yes | Official effective commencement date of partnership MOA. |
| `moa_end_date` | `date` | - | Yes | Expiration date of MOA contract duration. |

---

#### 2.4. Entity: `SupervisorProfile` (Table: `supervisor_profiles`)
- **Domain:** Academic Faculty & OJT Coordination
- **Description:** Faculty internship coordinators and designated academic supervisors.
- **Attribute Count:** 6 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for supervisor profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing supervisor user account in users.id. |
| `company_name` | `varchar(255)` | - | Yes | University branch or affiliated industry training organization. |
| `position` | `varchar(100)` | - | No | Academic designation (OJT Coordinator, Department Chair, Faculty Mentor). |
| `course` | `varchar(100)` | - | No | Supervised degree program course code (BSIT, BSIS, BSCS). |
| `department` | `varchar(100)` | - | Yes | Collegiate department under the College of Computer Studies. |

---

#### 2.5. Entity: `GraduateProfile` (Table: `graduate_profiles`)
- **Domain:** Alumni & Graduate Tracer Studies
- **Description:** Alumni graduation metadata used for institutional graduate tracer studies and career outcomes.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique identifier for graduate profile record. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing graduate user in users.id. |
| `year_graduated` | `varchar(50)` | - | No | Academic graduation batch year (e.g. 2024-2025). |
| `campus` | `varchar(100)` | - | No | Graduating campus branch. |
| `course` | `varchar(100)` | - | No | Completed degree program. |
| `section` | `varchar(20)` | - | Yes | Graduating cohort section. |
| `employment_status` | `varchar(50)` | - | No | Current tracer status (employed, looking, freelance, studying). |

---

#### 2.6. Entity: `AlumniTracker` (Table: `alumni_trackers`)
- **Domain:** Alumni & Graduate Tracer Studies
- **Description:** Periodic longitudinal survey responses tracking employment rates and curriculum alignment.
- **Attribute Count:** 8 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate identifier for survey response entry. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing graduate alumni user. |
| `employment_status` | `varchar(50)` | - | No | Employment classification (Employed Full-Time, Self-Employed, Unemployed). |
| `current_employer` | `varchar(255)` | - | Yes | Name of hiring enterprise or client. |
| `current_position` | `varchar(100)` | - | Yes | Current job title or professional role held. |
| `employment_type` | `varchar(50)` | - | Yes | Contract nature (Regular, Contractual, Freelance, Project-based). |
| `course_related` | `boolean` | - | No | Boolean metric verifying if employment aligns with university IT curriculum. |
| `survey_year` | `varchar(20)` | - | No | Annual tracer survey collection period. |

---

#### 2.7. Entity: `JobseekerProfile` (Table: `jobseeker_profiles`)
- **Domain:** Actor Metadata & Career Seekers
- **Description:** Career profile for external applicants and graduates seeking employment opportunities.
- **Attribute Count:** 8 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate identifier for jobseeker profile. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing user identity. |
| `desired_job_title` | `varchar(100)` | - | Yes | Target career role (e.g. Full-Stack Developer, QA Analyst). |
| `work_preference` | `varchar(50)` | - | No | Preferred workplace modality (Remote, Hybrid, On-site). |
| `years_of_experience` | `integer` | - | No | Total cumulative years of professional work experience. |
| `location` | `varchar(100)` | - | Yes | Current residential city or province. |
| `portfolio_url` | `varchar(255)` | - | Yes | External web portfolio or GitHub profile link. |
| `profile_completed` | `boolean` | - | No | Status flag indicating full profile readiness for recruiters. |

---

#### 2.8. Entity: `StudentEducation` (Table: `student_education`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Academic background records displayed on the verified student resume.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user account. |
| `school` | `varchar(255)` | - | No | Academic institution or college attended. |
| `degree` | `varchar(255)` | - | No | Degree earned or pursued (e.g. BS in Information Technology). |
| `year_start` | `varchar(20)` | - | Yes | Enrollment matriculation year. |
| `year_end` | `varchar(20)` | - | Yes | Graduation or anticipated completion year. |
| `is_current` | `boolean` | - | No | Flag indicating whether student is actively enrolled. |

---

#### 2.9. Entity: `StudentSkill` (Table: `student_skills`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Itemized competencies, programming skills, and supervisor validation endorsements.
- **Attribute Count:** 6 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `name` | `varchar(100)` | - | No | Skill or technology name (e.g. Laravel, React, PostgreSQL). |
| `level` | `integer` | - | No | Competency rating level (0 to 100). |
| `category` | `varchar(50)` | - | No | Domain classification (language, framework, database, tool, soft_skill). |
| `endorsed_count` | `integer` | - | No | Number of validated endorsements received from supervisors. |

---

#### 2.10. Entity: `StudentExperience` (Table: `student_experiences`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Past work history, freelance contracts, and prior internship roles.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `role` | `varchar(100)` | - | No | Position title held during engagement. |
| `company` | `varchar(255)` | - | No | Employing enterprise or client name. |
| `type` | `varchar(50)` | - | No | Classification (OJT, Freelance, Part-time, Full-time). |
| `period_start` | `varchar(50)` | - | Yes | Commencement date string. |
| `is_it_related` | `boolean` | - | No | Audit flag determining IT curriculum alignment for tracer statistics. |

---

#### 2.11. Entity: `StudentAchievement` (Table: `student_achievements`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Honors, certifications, hackathon awards, and recognized digital badges.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `title` | `varchar(255)` | - | No | Award or certification title (e.g. AWS Certified Cloud Practitioner). |
| `type` | `varchar(50)` | - | No | Classification (certification, competition, academic, leadership). |
| `issuer` | `varchar(255)` | - | Yes | Issuing accreditation entity or organization. |
| `date` | `varchar(50)` | - | Yes | Date or year of credential issuance. |
| `credential_id` | `varchar(100)` | - | Yes | Official certificate serial or verification badge license number. |

---

#### 2.12. Entity: `PortfolioProject` (Table: `portfolio_projects`)
- **Domain:** Verified Digital Resume & Credentials
- **Description:** Software repositories, capstone projects, and deployed web portfolio systems.
- **Attribute Count:** 6 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student user. |
| `title` | `varchar(255)` | - | No | Software project or repository name. |
| `tech_stack` | `varchar(255)` | - | No | Key technologies utilized (e.g. Laravel, Vue.js, Tailwind). |
| `project_url` | `varchar(255)` | - | Yes | Public web URL or GitHub code repository link. |
| `description` | `text` | - | Yes | System architecture overview and feature contributions. |

---

#### 2.13. Entity: `OjtPosting` (Table: `ojt_postings`)
- **Domain:** OJT Internship Lifecycle & Vacancies
- **Description:** Internship openings posted by verified Host Training Establishments (HTEs).
- **Attribute Count:** 9 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Unique surrogate primary key for vacancy posting. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing HTE employer user. |
| `title` | `varchar(255)` | - | No | Internship job title (e.g. Web Developer Trainee). |
| `department` | `varchar(100)` | - | No | Operating business unit (e.g. IT Solutions, QA Dept). |
| `location` | `varchar(255)` | - | No | Workplace office location or remote arrangement. |
| `slots_total` | `integer` | - | No | Total allotted trainee capacity quota. |
| `slots_remaining` | `integer` | - | No | Real-time remaining uncommitted placement slots. |
| `duration` | `varchar(50)` | - | Yes | Expected internship timeframe (e.g. 486 Hours / 3 Months). |
| `status` | `varchar(50)` | - | No | Posting state (open, closed, filled, paused). |

---

#### 2.14. Entity: `StudentOjtInterest` (Table: `student_ojt_interests`)
- **Domain:** OJT Internship Lifecycle & Placement Pipeline
- **Description:** Formal internship application pipeline tracking coordinator endorsements and company acceptance.
- **Attribute Count:** 8 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `student_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing applicant student user. |
| `ojt_posting_id` | `bigint` | **FK -> ojt_postings.id** | No | Foreign key referencing targeted OJT vacancy. |
| `endorsed_by` | `bigint` | **FK -> users.id** | Yes | Foreign key referencing academic supervisor who issued endorsement. |
| `status` | `varchar(50)` | - | No | Pipeline workflow status (applied, endorsed, company_accepted, ojt_confirmed). |
| `student_message` | `text` | - | Yes | Statement of motivation submitted by trainee. |
| `endorsed_at` | `date` | - | Yes | Timestamp of official academic endorsement validation. |
| `ojt_start_date` | `date` | - | Yes | Agreed upon internship duty start date. |

---

#### 2.15. Entity: `StudentOjtRequirement` (Table: `student_ojt_requirements`)
- **Domain:** OJT Internship Lifecycle & Clearance Compliance
- **Description:** Mandatory pre-internship clearance checklist (medical exam, consent, waiver, insurance).
- **Attribute Count:** 9 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `student_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing student submitting requirement. |
| `supervisor_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing inspecting academic supervisor. |
| `interest_id` | `bigint` | **FK -> student_ojt_interests.id** | Yes | Foreign key referencing associated OJT application. |
| `posting_id` | `bigint` | **FK -> ojt_postings.id** | Yes | Foreign key referencing target company vacancy. |
| `title` | `varchar(255)` | - | No | Clearance document title (e.g. Parents Consent & Medical Certificate). |
| `status` | `varchar(50)` | - | No | Verification state (pending, approved, rejected, reupload_requested). |
| `drive_url` | `varchar(255)` | - | No | Cloud storage verification link to uploaded documents. |
| `due_date` | `date` | - | Yes | Mandatory deadline for pre-deployment compliance submission. |

---

#### 2.16. Entity: `OjtRecord` (Table: `ojt_records`)
- **Domain:** OJT Placement & Progress Tracking
- **Description:** Active internship placement contract tracking required curriculum hours versus rendered progress.
- **Attribute Count:** 8 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing deployed trainee student. |
| `company_name` | `varchar(255)` | - | No | Official name of the Host Training Establishment. |
| `supervisor_name` | `varchar(255)` | - | No | Designated industry mentor / supervisor name. |
| `required_hours` | `integer` | - | No | Curricular internship requirement (e.g. 486 Hours for BSIT). |
| `completed_hours` | `numeric(6,2)` | - | No | Verified cumulative hours logged by trainee. |
| `start_date` | `date` | - | No | Official commencement date of active duty. |
| `status` | `varchar(50)` | - | No | Placement lifecycle state (active, completed, dropped, on_hold). |

---

#### 2.17. Entity: `TimeLog` (Table: `time_logs`)
- **Domain:** Daily Attendance & Geofenced Timekeeping
- **Description:** Daily Time Record (DTR) check-in/out entries with automated GPS geofence validation.
- **Attribute Count:** 9 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing trainee student. |
| `ojt_record_id` | `bigint` | **FK -> ojt_records.id** | No | Foreign key referencing active placement record. |
| `log_date` | `date` | - | No | Calendar date of duty rendered. |
| `time_in` | `varchar(10)` | - | No | Morning / session check-in timestamp (HH:MM). |
| `time_out` | `varchar(10)` | - | Yes | Session completion check-out timestamp (HH:MM). |
| `hours_rendered` | `numeric(4,2)` | - | No | Total credit hours rendered for the day. |
| `location_validity` | `varchar(50)` | - | No | GPS validation result (In Site [<=100m], Too Far, Verified). |
| `status` | `varchar(50)` | - | No | Audit verification state (pending, approved, rejected). |

---

#### 2.18. Entity: `EvaluationTemplate` (Table: `evaluation_templates`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Description:** Standardized university performance evaluation rubrics created by faculty coordinators.
- **Attribute Count:** 6 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `supervisor_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing supervisor authoring the rubric. |
| `program` | `varchar(100)` | - | No | Academic degree program (e.g. BSIT 486-Hour Rubric). |
| `title` | `varchar(255)` | - | No | Official evaluation title (e.g. Final Employer Performance Appraisal). |
| `description` | `text` | - | Yes | Evaluation guidelines and score calculation weighting criteria. |
| `is_active` | `boolean` | - | No | Flag designating if rubric is currently active for evaluations. |

---

#### 2.19. Entity: `EvaluationQuestion` (Table: `evaluation_questions`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Description:** Itemized criteria and Likert rating questions belonging to an evaluation template.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `template_id` | `bigint` | **FK -> evaluation_templates.id** | No | Foreign key referencing parent evaluation rubric. |
| `category` | `varchar(100)` | - | No | Competency category (Technical Competence, Work Ethic, Teamwork). |
| `question_text` | `text` | - | No | Specific performance criterion question prompt. |
| `question_type` | `varchar(50)` | - | No | Input format (scale, rating, text, boolean). |
| `scale_max` | `integer` | - | No | Maximum Likert scale value (e.g. 5 for a 1-5 scale). |
| `is_required` | `boolean` | - | No | Flag mandating question response before submission. |

---

#### 2.20. Entity: `StudentEvaluation` (Table: `student_evaluations`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Description:** Comprehensive trainee performance appraisal submitted by host employer upon completion.
- **Attribute Count:** 8 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `template_id` | `bigint` | **FK -> evaluation_templates.id** | No | Foreign key referencing rubric template utilized. |
| `student_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing evaluated student trainee. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing host employer evaluator. |
| `supervisor_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing reviewing academic coordinator. |
| `ojt_record_id` | `bigint` | **FK -> ojt_records.id** | No | Foreign key referencing active internship record. |
| `status` | `varchar(50)` | - | No | Appraisal workflow state (sent, submitted, verified). |
| `overall_score` | `numeric(5,2)` | - | Yes | Composite percentage score computed across all criteria (0 to 100%). |

---

#### 2.21. Entity: `StudentEvaluationAnswer` (Table: `student_evaluation_answers`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Description:** Itemized rating scores and qualitative feedback recorded per rubric criterion.
- **Attribute Count:** 5 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `student_evaluation_id` | `bigint` | **FK -> student_evaluations.id** | No | Foreign key referencing parent evaluation appraisal. |
| `evaluation_question_id` | `bigint` | **FK -> evaluation_questions.id** | No | Foreign key referencing specific rubric criterion. |
| `rating_value` | `integer` | - | Yes | Numeric score assigned by evaluator on Likert scale. |
| `text_value` | `text` | - | Yes | Qualitative commendation or constructive remarks. |

---

#### 2.22. Entity: `JobListing` (Table: `job_listings`)
- **Domain:** Career Placement & Job Recruitment
- **Description:** Full-time, contractual, and graduate career vacancies posted by partner companies.
- **Attribute Count:** 8 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key for career opening. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing recruiting enterprise. |
| `title` | `varchar(255)` | - | No | Professional job title (e.g. Associate Software Engineer). |
| `department` | `varchar(100)` | - | No | Organizational department. |
| `location` | `varchar(255)` | - | No | Office location or remote job classification. |
| `employment_type` | `varchar(50)` | - | No | Contract structure (Full-time, Part-time, Contract, Internship). |
| `salary_range` | `varchar(100)` | - | Yes | Remuneration compensation package bracket. |
| `status` | `varchar(50)` | - | No | Vacancy status (active, closed, archived). |

---

#### 2.23. Entity: `JobApplication` (Table: `job_applications`)
- **Domain:** Career Placement & Job Recruitment
- **Description:** Career applications submitted by graduates, students, or registered jobseekers.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `job_listing_id` | `bigint` | **FK -> job_listings.id** | No | Foreign key referencing target job opening. |
| `applicant_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing candidate applicant user. |
| `status` | `varchar(50)` | - | No | Recruitment pipeline state (applied, screening, interview, offered, hired, rejected). |
| `match_score` | `numeric(5,2)` | - | Yes | Algorithmically computed resume-to-job competency match percentage. |
| `cover_letter` | `text` | - | Yes | Candidate letter of intent and qualification summary. |
| `offer_decision` | `varchar(50)` | - | Yes | Final applicant response to job offer (accepted, declined, pending). |

---

#### 2.24. Entity: `Interview` (Table: `interviews`)
- **Domain:** Career Placement & Job Recruitment
- **Description:** Recruitment interview sessions scheduled between corporate hiring teams and candidates.
- **Attribute Count:** 7 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `job_application_id` | `bigint` | **FK -> job_applications.id** | No | Foreign key referencing applicant job application. |
| `company_user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing hiring manager user. |
| `type` | `varchar(50)` | - | No | Session mode (Technical, Initial HR, Final Panel Interview). |
| `scheduled_date` | `date` | - | No | Calendar date of interview meeting. |
| `platform` | `varchar(100)` | - | No | Interview platform (Google Meet, Zoom, On-site Office). |
| `status` | `varchar(50)` | - | No | Interview outcome (scheduled, completed, cancelled, rescheduled). |

---

#### 2.25. Entity: `ChatMessage` (Table: `chat_messages`)
- **Domain:** System Communication & Notifications
- **Description:** Direct messaging exchange between students, supervisors, and industry mentors.
- **Attribute Count:** 6 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `sender_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing message author user in users.id. |
| `receiver_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing recipient user in users.id. |
| `message` | `text` | - | No | Message text payload content. |
| `read_at` | `date` | - | Yes | Timestamp when recipient viewed the message. |
| `created_at` | `date` | - | No | Transmission timestamp. |

---

#### 2.26. Entity: `AppNotification` (Table: `app_notifications`)
- **Domain:** System Communication & Notifications
- **Description:** Real-time transactional notifications alerting users to endorsements, evaluations, and offers.
- **Attribute Count:** 6 attributes (Under 12-attribute limit)

| Attribute Name | Data Type | Key Constraint | Nullable | Description & Academic Rules |
| :--- | :---: | :---: | :---: | :--- |
| `id` | `bigint` | **PK** | No | Surrogate primary key. |
| `user_id` | `bigint` | **FK -> users.id** | No | Foreign key referencing recipient user account. |
| `type` | `varchar(100)` | - | No | Event classification (endorsement_issued, eval_submitted, interview_booked). |
| `title` | `varchar(255)` | - | No | Alert headline message. |
| `message` | `text` | - | No | Detailed descriptive alert explanation. |
| `read_at` | `date` | - | Yes | Timestamp indicating acknowledgement by user. |

---
