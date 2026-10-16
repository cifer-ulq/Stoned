# Carlos Hilado Memorial State University (CHMSU)
## CHMSU HireMe Integrated OJT & Placement Platform — Complete System Data Dictionary

> **Document Type:** Technical Appendix / Comprehensive Database Specification  
> **Target System:** CHMSU HireMe Integrated OJT & Career Placement Management System  
> **Database Engine:** PostgreSQL 16 (Laravel 12/13 Eloquent ORM Architecture)  
> **Total Core Entities:** 29 System Entities  
> **Total Attributes:** 481 Total Database Fields (100% Complete, No Exemptions)  
> **Notation:** Crow's Foot Entity-Relationship Model (1:1, 1:N, N:1)  
> **Specification Date:** October 14, 2026 (Reflecting Live Active Production PostgreSQL Schema)  

---

### 1. Architectural Domain Classification

The relational database schema is structured into eight operational domains:
1. **Authentication & Core Access Control (`auth`):** Central user identity management across all user actors (`User`).
2. **Actor Profiles & Role Metadata (`profile`):** Entity specialization for students (`StudentProfile`), host companies (`CompanyProfile`), faculty supervisors (`SupervisorProfile`), graduates (`GraduateProfile`), and jobseekers (`JobseekerProfile`).
3. **Program Educational Objectives & Accreditation (`peo`):** Institutional competency rubrics (`PeoDefinition`) and alumni graduate outcome assessments (`AlumniPeoAssessment`).
4. **Verified Digital Portfolio & Credentials (`portfolio`):** Verified academic credentials (`StudentEducation`), technical proficiencies (`StudentSkill`), work history (`StudentExperience`), verified achievements (`StudentAchievement`), and project repositories (`PortfolioProject`).
5. **OJT Internship Lifecycle & Daily Monitoring (`ojt`):** Internship vacancy postings (`OjtPosting`), application pipeline (`StudentOjtInterest`), pre-deployment clearance (`StudentOjtRequirement`), active training contracts (`OjtRecord`), and geofenced attendance logs (`TimeLog`).
6. **OJT Academic Safety & Exception Governance (`safety`):** Emergency medical/family leave tracking (`OjtEmergencyRequest`) and multi-tier institutional withdrawal pull-out requests (`OjtPullOutRequest`).
7. **Trainee Performance Evaluation (`eval`):** Standardized rubrics (`EvaluationTemplate`), question criteria (`EvaluationQuestion`), employer performance appraisals (`StudentEvaluation`), and itemized Likert scores (`StudentEvaluationAnswer`).
8. **Career Recruitment & Placement (`job`) & System Alerts (`comm`):** Industry career openings (`JobListing`), candidate job applications (`JobApplication`), interview sessions (`Interview`), direct chats (`ChatMessage`), and automated alerts (`AppNotification`).

---

### 2. Comprehensive Entity Specifications

#### 2.1. Entity: `StudentEducation` (Table: `student_education`)
- **Domain:** Student Portfolio & Verified Credentials
- **Table Description:** Educational history records displayed on the student verified resume.
- **Total Fields:** 12 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentEducation` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `school` | `varchar` | 255 | Academic institution or college attended. |
| `degree` | `varchar` | 255 | Degree earned or pursued (e.g. BS in Information Technology). |
| `year_start` | `varchar` | 255 | Enrollment matriculation year. |
| `year_end` | `varchar` | 255 | Graduation or anticipated completion year. |
| `gpa` | `varchar` | 255 | Stores gpa information for `StudentEducation`. |
| `description` | `text` | -- | Stores description information for `StudentEducation`. |
| `is_current` | `bool` | 1 | Flag indicating whether student is actively enrolled. |
| `sort_order` | `int` | 10 | Stores sort order information for `StudentEducation`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentEducation entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentEducation entry was last modified. |

---

#### 2.2. Entity: `StudentSkill` (Table: `student_skills`)
- **Domain:** Student Portfolio & Verified Credentials
- **Table Description:** Itemized technical proficiencies, soft skills, and competency level ratings.
- **Total Fields:** 9 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentSkill` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `name` | `varchar` | 255 | Skill or technology name (e.g. Laravel, React, PostgreSQL). |
| `level` | `smallint` | 5 | Competency rating level (0 to 100). |
| `category` | `varchar` | 255 | Domain classification (language, framework, database, tool, soft_skill). |
| `endorsed_count` | `int` | 10 | Number of validated endorsements received from supervisors. |
| `sort_order` | `int` | 10 | Stores sort order information for `StudentSkill`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentSkill entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentSkill entry was last modified. |

---

#### 2.3. Entity: `StudentExperience` (Table: `student_experiences`)
- **Domain:** Student Portfolio & Verified Credentials
- **Table Description:** Past work history, freelance contracts, and prior practical internships.
- **Total Fields:** 15 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentExperience` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `role` | `varchar` | 255 | Position title held during engagement. |
| `company` | `varchar` | 255 | Employing enterprise or client name. |
| `type` | `varchar` | 255 | Classification (OJT, Freelance, Part-time, Full-time). |
| `period_start` | `varchar` | 255 | Commencement date string. |
| `period_end` | `varchar` | 255 | Stores period end information for `StudentExperience`. |
| `description` | `text` | -- | Stores description information for `StudentExperience`. |
| `skills` | `json` | -- | Stores skills information for `StudentExperience`. |
| `is_current` | `bool` | 1 | Stores is current information for `StudentExperience`. |
| `sort_order` | `int` | 10 | Stores sort order information for `StudentExperience`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentExperience entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentExperience entry was last modified. |
| `location` | `varchar` | 255 | Stores location information for `StudentExperience`. |
| `is_it_related` | `bool` | 1 | Audit flag determining IT curriculum alignment for tracer statistics. |

---

#### 2.4. Entity: `StudentAchievement` (Table: `student_achievements`)
- **Domain:** Student Portfolio & Verified Credentials
- **Table Description:** Honors, certifications, hackathon awards, and recognized credentials.
- **Total Fields:** 17 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentAchievement` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `title` | `varchar` | 255 | Award or certification title (e.g. AWS Certified Cloud Practitioner). |
| `description` | `text` | -- | Stores description information for `StudentAchievement`. |
| `type` | `varchar` | 255 | Classification (certification, competition, academic, leadership). |
| `icon` | `varchar` | 255 | Stores icon information for `StudentAchievement`. |
| `date` | `varchar` | 255 | Date or year of credential issuance. |
| `sort_order` | `int` | 10 | Stores sort order information for `StudentAchievement`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentAchievement entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentAchievement entry was last modified. |
| `issuer` | `varchar` | 255 | Issuing accreditation entity or organization. |
| `credential_id` | `varchar` | 10 | Official certificate serial or verification badge license number. |
| `credential_url` | `varchar` | 255 | Stores credential url information for `StudentAchievement`. |
| `certificate_url` | `varchar` | 255 | Stores certificate url information for `StudentAchievement`. |
| `award_level` | `varchar` | 255 | Stores award level information for `StudentAchievement`. |
| `expires_at` | `varchar` | 255 | Stores expires at information for `StudentAchievement`. |
| `does_not_expire` | `bool` | 1 | Stores does not expire information for `StudentAchievement`. |

---

#### 2.5. Entity: `PortfolioProject` (Table: `portfolio_projects`)
- **Domain:** Student Portfolio & Verified Credentials
- **Table Description:** Software repositories, capstone projects, and deployed web systems.
- **Total Fields:** 16 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `PortfolioProject` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `title` | `varchar` | 255 | Software project or repository name. |
| `description` | `text` | -- | System architecture overview and feature contributions. |
| `tech_stack` | `json` | -- | Key technologies utilized (e.g. Laravel, Vue.js, Tailwind). |
| `project_url` | `varchar` | 255 | Public web URL or GitHub code repository link. |
| `repo_url` | `varchar` | 255 | Stores repo url information for `PortfolioProject`. |
| `image_url` | `varchar` | 255 | Stores image url information for `PortfolioProject`. |
| `is_featured` | `bool` | 1 | Stores is featured information for `PortfolioProject`. |
| `sort_order` | `int` | 10 | Stores sort order information for `PortfolioProject`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the PortfolioProject entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the PortfolioProject entry was last modified. |
| `category` | `varchar` | 255 | Stores category information for `PortfolioProject`. |
| `role` | `varchar` | 255 | Stores role information for `PortfolioProject`. |
| `date_completed` | `varchar` | 255 | Stores date completed information for `PortfolioProject`. |
| `outcomes` | `text` | -- | Stores outcomes information for `PortfolioProject`. |

---

#### 2.6. Entity: `StudentProfile` (Table: `student_profiles`)
- **Domain:** Actor Metadata & Academic Profiles
- **Table Description:** Extended student academic profile for enrolled undergraduates.
- **Total Fields:** 23 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentProfile` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `school` | `varchar` | 255 | University name (Carlos Hilado Memorial State University). |
| `campus` | `varchar` | 255 | Campus location (Talisay, Fortune Towne, Binalbagan, Alijis). |
| `program` | `varchar` | 255 | Degree program (BS Information Technology, BS Computer Science, etc.). |
| `year_level` | `varchar` | 255 | Current academic standing (e.g. 4th Year, Graduating, Alumni). |
| `student_id` | `varchar` | 10 | Official university student identification number (e.g. 2022-0145). |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentProfile entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentProfile entry was last modified. |
| `headline` | `varchar` | 255 | Stores headline information for `StudentProfile`. |
| `bio` | `text` | -- | Stores bio information for `StudentProfile`. |
| `location` | `varchar` | 255 | Stores location information for `StudentProfile`. |
| `github_url` | `varchar` | 255 | Stores github url information for `StudentProfile`. |
| `linkedin_url` | `varchar` | 255 | Stores linkedin url information for `StudentProfile`. |
| `portfolio_url` | `varchar` | 255 | Stores portfolio url information for `StudentProfile`. |
| `status` | `varchar` | 255 | Academic placement eligibility status. |
| `phone` | `varchar` | 255 | Stores phone information for `StudentProfile`. |
| `cover_color` | `varchar` | 255 | Stores cover color information for `StudentProfile`. |
| `resume_type` | `varchar` | 255 | Stores resume type information for `StudentProfile`. |
| `resume_objective` | `text` | -- | Stores resume objective information for `StudentProfile`. |
| `section` | `varchar` | 255 | Assigned class section block (e.g. 4A, 4B). |
| `batch` | `varchar` | 255 | Stores batch information for `StudentProfile`. |
| `requirements_drive_url` | `text` | -- | Google Drive folder link for submitted clearance requirements. |

---

#### 2.7. Entity: `StudentOjtRequirement` (Table: `student_ojt_requirements`)
- **Domain:** OJT Pre-Deployment Clearance Compliance
- **Table Description:** Mandatory pre-internship clearance checklist reviewed by supervisors.
- **Total Fields:** 16 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentOjtRequirement` record. |
| `student_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `supervisor_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `interest_id` | `int` | 10 | Foreign key referencing `student_ojt_interests.id`. |
| `posting_id` | `int` | 10 | Foreign key referencing `ojt_postings.id`. |
| `title` | `varchar` | 255 | Clearance document title (e.g. Pre-Deployment Document Packet). |
| `items` | `json` | -- | Array of mandatory compliance item checklists. |
| `instructions` | `text` | -- | Stores instructions information for `StudentOjtRequirement`. |
| `due_date` | `date` | -- | Mandatory deadline for pre-deployment compliance submission. |
| `status` | `varchar` | 255 | Verification state (pending, submitted, verified, needs_revision). |
| `drive_url` | `text` | -- | Cloud storage verification link to uploaded documents. |
| `supervisor_remarks` | `text` | -- | Stores supervisor remarks information for `StudentOjtRequirement`. |
| `submitted_at` | `timestamp` | -- | Stores submitted at information for `StudentOjtRequirement`. |
| `verified_at` | `timestamp` | -- | Stores verified at information for `StudentOjtRequirement`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentOjtRequirement entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentOjtRequirement entry was last modified. |

---

#### 2.8. Entity: `AppNotification` (Table: `app_notifications`)
- **Domain:** System Communication & Alerts
- **Table Description:** Real-time transactional notifications alerting users to events.
- **Total Fields:** 9 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `AppNotification` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `type` | `varchar` | 255 | Event classification (endorsement_issued, eval_submitted, pull_out_updated). |
| `title` | `varchar` | 255 | Alert headline message. |
| `message` | `text` | -- | Detailed descriptive alert explanation. |
| `data` | `json` | -- | Stores data information for `AppNotification`. |
| `read_at` | `timestamp` | -- | Timestamp indicating acknowledgement by user. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the AppNotification entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the AppNotification entry was last modified. |

---

#### 2.9. Entity: `ChatMessage` (Table: `chat_messages`)
- **Domain:** System Communication & Alerts
- **Table Description:** Direct messaging exchange between students, supervisors, and mentors.
- **Total Fields:** 8 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `ChatMessage` record. |
| `conversation_key` | `varchar` | 255 | Stores conversation key information for `ChatMessage`. |
| `sender_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `receiver_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `message` | `text` | -- | Message text payload content. |
| `read_at` | `timestamp` | -- | Timestamp when recipient viewed the message. |
| `created_at` | `timestamp` | -- | Transmission timestamp. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the ChatMessage entry was last modified. |

---

#### 2.10. Entity: `User` (Table: `users`)
- **Domain:** Authentication & Core Access Control
- **Table Description:** Central user identity record for all system actors and role assignments.
- **Total Fields:** 11 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `User` record. |
| `name` | `varchar` | 255 | Full legal name or display name of the user. |
| `email` | `varchar` | 255 | Unique corporate, university, or personal email used for login credentials. |
| `email_verified_at` | `timestamp` | -- | Stores email verified at information for `User`. |
| `password` | `varchar` | 255 | Bcrypt-hashed password string. |
| `remember_token` | `varchar` | 100 | Stores remember token information for `User`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the User entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the User entry was last modified. |
| `role` | `varchar` | 255 | Primary authorization role (student, company, supervisor, graduate, jobseeker, admin). |
| `onboarding_completed` | `bool` | 1 | Flag indicating whether mandatory onboarding profile wizard was completed. |
| `avatar_url` | `varchar` | 255 | Relative or CDN URL pointing to user profile photo image. |

---

#### 2.11. Entity: `JobseekerProfile` (Table: `jobseeker_profiles`)
- **Domain:** Actor Metadata & Career Seekers
- **Table Description:** Career profile for external applicants and graduates seeking employment.
- **Total Fields:** 15 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `JobseekerProfile` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `desired_job_title` | `varchar` | 255 | Target career role (e.g. Full-Stack Developer, QA Analyst). |
| `work_preference` | `varchar` | 255 | Preferred workplace modality (Remote, Hybrid, On-site). |
| `years_of_experience` | `varchar` | 255 | Total cumulative years of professional work experience. |
| `headline` | `varchar` | 255 | Stores headline information for `JobseekerProfile`. |
| `bio` | `text` | -- | Stores bio information for `JobseekerProfile`. |
| `location` | `varchar` | 255 | Current residential city or province. |
| `portfolio_url` | `varchar` | 255 | External web portfolio or GitHub profile link. |
| `linkedin_url` | `varchar` | 255 | Stores linkedin url information for `JobseekerProfile`. |
| `phone` | `varchar` | 255 | Stores phone information for `JobseekerProfile`. |
| `avatar_url` | `varchar` | 255 | Stores avatar url information for `JobseekerProfile`. |
| `profile_completed` | `bool` | 1 | Status flag indicating full profile readiness for recruiters. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the JobseekerProfile entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the JobseekerProfile entry was last modified. |

---

#### 2.12. Entity: `SupervisorProfile` (Table: `supervisor_profiles`)
- **Domain:** Academic Faculty & OJT Coordination
- **Table Description:** Faculty internship coordinators and designated academic supervisors.
- **Total Fields:** 8 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `SupervisorProfile` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `company_name` | `varchar` | 255 | University branch or affiliated industry training organization. |
| `position` | `varchar` | 255 | Academic designation (OJT Coordinator, Department Chair, Faculty Mentor). |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the SupervisorProfile entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the SupervisorProfile entry was last modified. |
| `course` | `varchar` | 255 | Supervised degree program course code (BSIT, BSIS, BSCS). |
| `phone` | `varchar` | 50 | Official institutional contact phone/mobile number. |

---

#### 2.13. Entity: `GraduateProfile` (Table: `graduate_profiles`)
- **Domain:** Alumni & Graduate Tracer Studies
- **Table Description:** Alumni graduation metadata used for institutional tracer studies.
- **Total Fields:** 9 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `GraduateProfile` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `year_graduated` | `varchar` | 255 | Academic graduation batch year (e.g. 2024-2025). |
| `campus` | `varchar` | 255 | Graduating campus branch. |
| `course` | `varchar` | 255 | Completed degree program. |
| `section` | `varchar` | 255 | Graduating cohort section. |
| `employment_status` | `varchar` | 255 | Current tracer status (employed, looking, freelance, studying). |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the GraduateProfile entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the GraduateProfile entry was last modified. |

---

#### 2.14. Entity: `CompanyProfile` (Table: `company_profiles`)
- **Domain:** Host Training Establishment & MOA
- **Table Description:** Host Training Establishment corporate profile and MOA agreement tracking.
- **Total Fields:** 27 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `CompanyProfile` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `company_name` | `varchar` | 255 | Registered business name of the Host Training Establishment. |
| `company_location` | `varchar` | 255 | Stores company location information for `CompanyProfile`. |
| `company_type` | `varchar` | 255 | Enterprise classification (Private Corporation, Government, NGO, Startup). |
| `website` | `varchar` | 255 | Stores website information for `CompanyProfile`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the CompanyProfile entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the CompanyProfile entry was last modified. |
| `company_size` | `varchar` | 255 | Workforce size tier (1-10, 11-50, 51-200, 201+ employees). |
| `contact_email` | `varchar` | 255 | Official HR / internship coordinator email address. |
| `contact_phone` | `varchar` | 255 | Stores contact phone information for `CompanyProfile`. |
| `description` | `text` | -- | Stores description information for `CompanyProfile`. |
| `logo_url` | `varchar` | 255 | Stores logo url information for `CompanyProfile`. |
| `profile_completed` | `bool` | 1 | Stores profile completed information for `CompanyProfile`. |
| `contact_person` | `varchar` | 255 | Stores contact person information for `CompanyProfile`. |
| `moa_file_path` | `varchar` | 255 | Storage path to verified bilateral MOA agreement PDF document. |
| `moa_start_date` | `date` | -- | Official effective commencement date of partnership MOA. |
| `moa_end_date` | `date` | -- | Expiration date of MOA contract duration. |
| `moa_status` | `varchar` | 255 | Partnership validity state (active, pending, expired, for_renewal). |
| `status` | `varchar` | 255 | Stores status information for `CompanyProfile`. |
| `ownership_type` | `varchar` | 255 | Stores ownership type information for `CompanyProfile`. |
| `year_founded` | `varchar` | 255 | Stores year founded information for `CompanyProfile`. |
| `full_address` | `varchar` | 255 | Stores full address information for `CompanyProfile`. |
| `contact_title` | `varchar` | 255 | Stores contact title information for `CompanyProfile`. |
| `registration_source` | `varchar` | 255 | Stores registration source information for `CompanyProfile`. |
| `moa_requested_at` | `timestamp` | -- | Stores moa requested at information for `CompanyProfile`. |
| `moa_request_notes` | `text` | -- | Stores moa request notes information for `CompanyProfile`. |

---

#### 2.15. Entity: `PeoDefinition` (Table: `peo_definitions`)
- **Domain:** Accreditation & Curriculum Objectives
- **Table Description:** Program Educational Objectives defined for BSIT/BSCS degree accreditation.
- **Total Fields:** 10 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `PeoDefinition` record. |
| `program` | `varchar` | 100 | Academic degree program (e.g. Bachelor of Science in Information Technology). |
| `code` | `varchar` | 20 | Standard PEO identifier code (e.g. PEO 1, PEO 2, PEO 3, PEO 4). |
| `title` | `varchar` | 255 | Descriptive competency title of the objective. |
| `description` | `text` | -- | Comprehensive narrative definition and graduate expectations. |
| `target_benchmark` | `numeric` | 5,2 | Institutional target attainment benchmark percentage (e.g. 70.00%). |
| `indicators` | `json` | -- | JSON array of measurable performance indicator criteria. |
| `sort_order` | `int` | 10 | Display sequence ordering on tracer assessment dashboards. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the PeoDefinition entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the PeoDefinition entry was last modified. |

---

#### 2.16. Entity: `AlumniPeoAssessment` (Table: `alumni_peo_assessments`)
- **Domain:** Accreditation & Curriculum Objectives
- **Table Description:** Graduate tracer evaluations assessing alumni attainment against defined PEOs.
- **Total Fields:** 9 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `AlumniPeoAssessment` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `peo_id` | `int` | 10 | Foreign key referencing `peo_definitions.id`. |
| `score` | `numeric` | 4,2 | Attainment rating score on 1.00 to 5.00 Likert scale. |
| `assessment_source` | `varchar` | 50 | Collection method (direct_survey, automated_heuristic, employer_evaluation). |
| `survey_year` | `varchar` | 20 | Annual tracer survey collection period (e.g. 2026). |
| `evidence_summary` | `text` | -- | Qualitative evidence narrative describing professional application. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the AlumniPeoAssessment entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the AlumniPeoAssessment entry was last modified. |

---

#### 2.17. Entity: `OjtPosting` (Table: `ojt_postings`)
- **Domain:** OJT Vacancies & Capacity Quotas
- **Table Description:** Internship openings posted by verified Host Training Establishments.
- **Total Fields:** 26 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `OjtPosting` record. |
| `company_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `title` | `varchar` | 255 | Internship job title (e.g. Web Developer Trainee). |
| `company_name` | `varchar` | 255 | Stores company name information for `OjtPosting`. |
| `company_initial` | `varchar` | 4 | Stores company initial information for `OjtPosting`. |
| `company_color` | `varchar` | 20 | Stores company color information for `OjtPosting`. |
| `department` | `varchar` | 255 | Operating business unit (e.g. IT Solutions, QA Dept). |
| `industry` | `varchar` | 255 | Stores industry information for `OjtPosting`. |
| `location` | `varchar` | 255 | Workplace office location or remote arrangement. |
| `description` | `text` | -- | Stores description information for `OjtPosting`. |
| `required_skills` | `json` | -- | Stores required skills information for `OjtPosting`. |
| `preferred_courses` | `json` | -- | Stores preferred courses information for `OjtPosting`. |
| `slots_total` | `int` | 10 | Total allotted trainee capacity quota. |
| `slots_remaining` | `int` | 10 | Real-time remaining uncommitted placement slots. |
| `duration` | `varchar` | 255 | Expected internship timeframe (e.g. 486 Hours / 3 Months). |
| `schedule_type` | `varchar` | 255 | Stores schedule type information for `OjtPosting`. |
| `status` | `varchar` | 255 | Posting state (open, closed, filled, paused). |
| `expires_at` | `timestamp` | -- | Stores expires at information for `OjtPosting`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the OjtPosting entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the OjtPosting entry was last modified. |
| `branch_name` | `varchar` | 255 | Stores branch name information for `OjtPosting`. |
| `latitude` | `numeric` | 10,7 | Stores latitude information for `OjtPosting`. |
| `longitude` | `numeric` | 10,7 | Stores longitude information for `OjtPosting`. |
| `learning_outcomes` | `text` | -- | Stores learning outcomes information for `OjtPosting`. |
| `required_documents` | `json` | -- | Stores required documents information for `OjtPosting`. |
| `qualifications` | `json` | -- | Stores qualifications information for `OjtPosting`. |

---

#### 2.18. Entity: `StudentOjtInterest` (Table: `student_ojt_interests`)
- **Domain:** OJT Application & Matching Pipeline
- **Table Description:** Formal internship application pipeline tracking coordinator endorsements.
- **Total Fields:** 33 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentOjtInterest` record. |
| `student_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `ojt_posting_id` | `int` | 10 | Foreign key referencing `ojt_postings.id`. |
| `status` | `varchar` | 255 | Pipeline workflow status (applied, endorsed, company_accepted, ojt_confirmed). |
| `student_message` | `text` | -- | Stores student message information for `StudentOjtInterest`. |
| `endorsed_by` | `int` | 10 | Foreign key referencing `users.id`. |
| `endorsed_at` | `timestamp` | -- | Stores endorsed at information for `StudentOjtInterest`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentOjtInterest entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentOjtInterest entry was last modified. |
| `endorsement_letter` | `varchar` | 255 | Stores endorsement letter information for `StudentOjtInterest`. |
| `company_accepted_at` | `timestamp` | -- | Stores company accepted at information for `StudentOjtInterest`. |
| `endorsement_requested_at` | `timestamp` | -- | Stores endorsement requested at information for `StudentOjtInterest`. |
| `ojt_started_at` | `timestamp` | -- | Stores ojt started at information for `StudentOjtInterest`. |
| `resume_viewed_at` | `timestamp` | -- | Stores resume viewed at information for `StudentOjtInterest`. |
| `company_note` | `text` | -- | Stores company note information for `StudentOjtInterest`. |
| `interview_scheduled_at` | `timestamp` | -- | Stores interview scheduled at information for `StudentOjtInterest`. |
| `interview_type` | `varchar` | 255 | Stores interview type information for `StudentOjtInterest`. |
| `interview_location` | `text` | -- | Stores interview location information for `StudentOjtInterest`. |
| `coordinator_note` | `text` | -- | Stores coordinator note information for `StudentOjtInterest`. |
| `endorsement_letter_sent_at` | `timestamp` | -- | Stores endorsement letter sent at information for `StudentOjtInterest`. |
| `ojt_start_date` | `date` | -- | Agreed upon internship duty start date. |
| `ojt_instructions` | `text` | -- | Stores ojt instructions information for `StudentOjtInterest`. |
| `schedule_days` | `json` | -- | Stores schedule days information for `StudentOjtInterest`. |
| `shift_start` | `varchar` | 10 | Stores shift start information for `StudentOjtInterest`. |
| `shift_end` | `varchar` | 10 | Stores shift end information for `StudentOjtInterest`. |
| `lunch_start` | `varchar` | 10 | Stores lunch start information for `StudentOjtInterest`. |
| `lunch_end` | `varchar` | 10 | Stores lunch end information for `StudentOjtInterest`. |
| `has_lunch_break` | `bool` | 1 | Stores has lunch break information for `StudentOjtInterest`. |
| `daily_hours` | `numeric` | 4,2 | Standard contracted working hours per day. |
| `weekly_hours` | `numeric` | 5,2 | Total cumulative contracted hours per week. |
| `allow_overtime` | `bool` | 1 | Stores allow overtime information for `StudentOjtInterest`. |
| `max_overtime_hours` | `numeric` | 4,2 | Stores max overtime hours information for `StudentOjtInterest`. |
| `estimated_end_date` | `date` | -- | Calculated expected completion target date. |

---

#### 2.19. Entity: `OjtRecord` (Table: `ojt_records`)
- **Domain:** OJT Placement & Progress Tracking
- **Table Description:** Active training contract tracking required curriculum hours versus rendered progress.
- **Total Fields:** 25 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `OjtRecord` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `company_name` | `varchar` | 255 | Official name of the Host Training Establishment. |
| `supervisor_name` | `varchar` | 255 | Designated industry mentor / supervisor name. |
| `supervisor_email` | `varchar` | 255 | Stores supervisor email information for `OjtRecord`. |
| `location` | `varchar` | 255 | Stores location information for `OjtRecord`. |
| `start_date` | `date` | -- | Official commencement date of active duty. |
| `end_date` | `date` | -- | Stores end date information for `OjtRecord`. |
| `required_hours` | `int` | 10 | Curricular internship requirement (e.g. 486 Hours for BSIT). |
| `completed_hours` | `numeric` | 8,2 | Verified cumulative hours logged by trainee. |
| `status` | `varchar` | 255 | Placement lifecycle state (active, completed, dropped, pull_out, emergency_leave). |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the OjtRecord entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the OjtRecord entry was last modified. |
| `company_instructions` | `text` | -- | Stores company instructions information for `OjtRecord`. |
| `schedule_days` | `json` | -- | Stores schedule days information for `OjtRecord`. |
| `shift_start` | `varchar` | 10 | Stores shift start information for `OjtRecord`. |
| `shift_end` | `varchar` | 10 | Stores shift end information for `OjtRecord`. |
| `lunch_start` | `varchar` | 10 | Stores lunch start information for `OjtRecord`. |
| `lunch_end` | `varchar` | 10 | Stores lunch end information for `OjtRecord`. |
| `has_lunch_break` | `bool` | 1 | Stores has lunch break information for `OjtRecord`. |
| `daily_hours` | `numeric` | 4,2 | Stores daily hours information for `OjtRecord`. |
| `weekly_hours` | `numeric` | 5,2 | Stores weekly hours information for `OjtRecord`. |
| `allow_overtime` | `bool` | 1 | Stores allow overtime information for `OjtRecord`. |
| `max_overtime_hours` | `numeric` | 4,2 | Stores max overtime hours information for `OjtRecord`. |
| `estimated_end_date` | `date` | -- | Forecasted conclusion date based on schedule shift parameters. |

---

#### 2.20. Entity: `TimeLog` (Table: `time_logs`)
- **Domain:** Daily Attendance & Geofenced Timekeeping
- **Table Description:** Daily Time Record morning/afternoon split-session check-ins with GPS geofencing.
- **Total Fields:** 36 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `TimeLog` record. |
| `user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `ojt_record_id` | `int` | 10 | Foreign key referencing `ojt_records.id`. |
| `log_date` | `date` | -- | Calendar date of duty rendered. |
| `time_in` | `time` | -- | Stores time in information for `TimeLog`. |
| `time_out` | `time` | -- | Stores time out information for `TimeLog`. |
| `hours_rendered` | `numeric` | 4,2 | Total verified daily credit hours. |
| `description` | `text` | -- | Stores description information for `TimeLog`. |
| `latitude` | `numeric` | 10,7 | Stores latitude information for `TimeLog`. |
| `longitude` | `numeric` | 10,7 | Stores longitude information for `TimeLog`. |
| `status` | `varchar` | 255 | Audit verification state (pending, approved, rejected). |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the TimeLog entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the TimeLog entry was last modified. |
| `time_in_lat` | `numeric` | 10,7 | Stores time in lat information for `TimeLog`. |
| `time_in_lon` | `numeric` | 10,7 | Stores time in lon information for `TimeLog`. |
| `time_out_lat` | `numeric` | 10,7 | Stores time out lat information for `TimeLog`. |
| `time_out_lon` | `numeric` | 10,7 | Stores time out lon information for `TimeLog`. |
| `location_validity` | `varchar` | 255 | GPS validation result (In Site [<=100m], Too Far, Verified). |
| `distance_meters` | `int` | 10 | Stores distance meters information for `TimeLog`. |
| `morning_in` | `time` | -- | Stores morning in information for `TimeLog`. |
| `morning_out` | `time` | -- | Stores morning out information for `TimeLog`. |
| `afternoon_in` | `time` | -- | Stores afternoon in information for `TimeLog`. |
| `afternoon_out` | `time` | -- | Stores afternoon out information for `TimeLog`. |
| `morning_hours` | `numeric` | 4,2 | Total credit hours rendered during morning session. |
| `afternoon_hours` | `numeric` | 4,2 | Total credit hours rendered during afternoon session. |
| `morning_in_lat` | `numeric` | 10,7 | Stores morning in lat information for `TimeLog`. |
| `morning_in_lon` | `numeric` | 10,7 | Stores morning in lon information for `TimeLog`. |
| `morning_out_lat` | `numeric` | 10,7 | Stores morning out lat information for `TimeLog`. |
| `morning_out_lon` | `numeric` | 10,7 | Stores morning out lon information for `TimeLog`. |
| `afternoon_in_lat` | `numeric` | 10,7 | Stores afternoon in lat information for `TimeLog`. |
| `afternoon_in_lon` | `numeric` | 10,7 | Stores afternoon in lon information for `TimeLog`. |
| `afternoon_out_lat` | `numeric` | 10,7 | Stores afternoon out lat information for `TimeLog`. |
| `afternoon_out_lon` | `numeric` | 10,7 | Stores afternoon out lon information for `TimeLog`. |
| `morning_validity` | `varchar` | 255 | Stores morning validity information for `TimeLog`. |
| `afternoon_validity` | `varchar` | 255 | Stores afternoon validity information for `TimeLog`. |
| `auto_morning_timeout` | `bool` | 1 | Stores auto morning timeout information for `TimeLog`. |

---

#### 2.21. Entity: `OjtEmergencyRequest` (Table: `ojt_emergency_requests`)
- **Domain:** OJT Safety Governance & Exceptions
- **Table Description:** Formal emergency interruption filing for medical crises, family emergencies, or accidents.
- **Total Fields:** 28 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `OjtEmergencyRequest` record. |
| `student_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `ojt_record_id` | `int` | 10 | Foreign key referencing `ojt_records.id`. |
| `ojt_interest_id` | `int` | 10 | Foreign key referencing `student_ojt_interests.id`. |
| `type` | `varchar` | 30 | Interruption category (temporary_leave, permanent_withdrawal). |
| `category` | `varchar` | 50 | Emergency ground (medical, family_emergency, accident, other). |
| `reason` | `text` | -- | Stores reason information for `OjtEmergencyRequest`. |
| `supporting_document_path` | `varchar` | 255 | Stores supporting document path information for `OjtEmergencyRequest`. |
| `supporting_document_name` | `varchar` | 255 | Stores supporting document name information for `OjtEmergencyRequest`. |
| `start_date` | `date` | -- | Beginning date of excused absence or withdrawal. |
| `expected_return_date` | `date` | -- | Stores expected return date information for `OjtEmergencyRequest`. |
| `actual_return_date` | `date` | -- | Stores actual return date information for `OjtEmergencyRequest`. |
| `hours_rendered_snapshot` | `numeric` | 6,2 | Snapshot of hours rendered at time of filing. |
| `required_hours_snapshot` | `numeric` | 6,2 | Stores required hours snapshot information for `OjtEmergencyRequest`. |
| `coordinator_status` | `varchar` | 30 | Academic supervisor status (pending, approved, rejected). |
| `coordinator_remarks` | `text` | -- | Stores coordinator remarks information for `OjtEmergencyRequest`. |
| `coordinator_action_by` | `int` | 10 | Foreign key referencing `users.id`. |
| `coordinator_action_at` | `timestamp` | -- | Stores coordinator action at information for `OjtEmergencyRequest`. |
| `credited_hours` | `numeric` | 6,2 | Stores credited hours information for `OjtEmergencyRequest`. |
| `academic_verdict` | `varchar` | 50 | Final academic standing (excused_leave, incomplete_inc, official_drop). |
| `company_status` | `varchar` | 30 | Host enterprise clearance status (pending, notified, cleared). |
| `company_clearance_notes` | `text` | -- | Stores company clearance notes information for `OjtEmergencyRequest`. |
| `company_cleared_at` | `timestamp` | -- | Stores company cleared at information for `OjtEmergencyRequest`. |
| `assets_returned` | `bool` | 1 | Stores assets returned information for `OjtEmergencyRequest`. |
| `fit_to_work_document_path` | `varchar` | 255 | Stores fit to work document path information for `OjtEmergencyRequest`. |
| `cleared_to_resume_at` | `timestamp` | -- | Stores cleared to resume at information for `OjtEmergencyRequest`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the OjtEmergencyRequest entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the OjtEmergencyRequest entry was last modified. |

---

#### 2.22. Entity: `OjtPullOutRequest` (Table: `ojt_pull_out_requests`)
- **Domain:** OJT Safety Governance & Exceptions
- **Table Description:** Official student internship pull-out request with multi-tiered recommendations and clearances.
- **Total Fields:** 27 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `OjtPullOutRequest` record. |
| `student_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `ojt_record_id` | `int` | 10 | Foreign key referencing `ojt_records.id`. |
| `ojt_interest_id` | `int` | 10 | Foreign key referencing `student_ojt_interests.id`. |
| `reason_category` | `varchar` | 50 | Classification (breach_of_moa, safety_hostile, task_mismatch, medical_personal). |
| `reason` | `text` | -- | Stores reason information for `OjtPullOutRequest`. |
| `student_letter_path` | `varchar` | 255 | Stores student letter path information for `OjtPullOutRequest`. |
| `student_letter_name` | `varchar` | 255 | Stores student letter name information for `OjtPullOutRequest`. |
| `hours_rendered_snapshot` | `numeric` | 8,2 | Hours completed prior to requested pull-out. |
| `required_hours_snapshot` | `numeric` | 8,2 | Stores required hours snapshot information for `OjtPullOutRequest`. |
| `status` | `varchar` | 40 | Lifecycle status (pending_supervisor, recommended, emailed_to_dean, approved). |
| `supervisor_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `supervisor_remarks` | `text` | -- | Stores supervisor remarks information for `OjtPullOutRequest`. |
| `supervisor_action_at` | `timestamp` | -- | Stores supervisor action at information for `OjtPullOutRequest`. |
| `dean_name` | `varchar` | 255 | Stores dean name information for `OjtPullOutRequest`. |
| `dean_email` | `varchar` | 255 | Stores dean email information for `OjtPullOutRequest`. |
| `generated_letter_body` | `text` | -- | Stores generated letter body information for `OjtPullOutRequest`. |
| `delivery_method` | `varchar` | 30 | Stores delivery method information for `OjtPullOutRequest`. |
| `emailed_at` | `timestamp` | -- | Stores emailed at information for `OjtPullOutRequest`. |
| `admin_action_by` | `int` | 10 | Foreign key referencing `users.id`. |
| `admin_remarks` | `text` | -- | Stores admin remarks information for `OjtPullOutRequest`. |
| `admin_action_at` | `timestamp` | -- | Stores admin action at information for `OjtPullOutRequest`. |
| `dean_verdict` | `varchar` | 30 | Official decision of the College Dean (approved, rejected). |
| `credited_hours` | `numeric` | 8,2 | Final approved hours credited toward curricular completion. |
| `allow_redeployment` | `bool` | 1 | Flag authorizing student trainee for secondary company reassignment. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the OjtPullOutRequest entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the OjtPullOutRequest entry was last modified. |

---

#### 2.23. Entity: `EvaluationTemplate` (Table: `evaluation_templates`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Table Description:** Standardized university performance evaluation rubrics created by faculty.
- **Total Fields:** 9 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `EvaluationTemplate` record. |
| `supervisor_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `program` | `varchar` | 50 | Academic degree program (e.g. BSIT 486-Hour Rubric). |
| `title` | `varchar` | 255 | Official evaluation title (e.g. OJT Performance Appraisal). |
| `description` | `text` | -- | Evaluation guidelines and score calculation weighting criteria. |
| `is_active` | `bool` | 1 | Flag designating if rubric is currently active for evaluations. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the EvaluationTemplate entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the EvaluationTemplate entry was last modified. |
| `term` | `varchar` | 20 | Target academic evaluation period (midterm, endterm, both). |

---

#### 2.24. Entity: `EvaluationQuestion` (Table: `evaluation_questions`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Table Description:** Itemized criteria and Likert rating questions belonging to an evaluation rubric.
- **Total Fields:** 12 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `EvaluationQuestion` record. |
| `template_id` | `int` | 10 | Foreign key referencing `evaluation_templates.id`. |
| `category` | `varchar` | 100 | Competency category (Technical Competence, Work Ethic, Teamwork). |
| `question_text` | `text` | -- | Specific performance criterion question prompt. |
| `question_type` | `varchar` | 30 | Input format (scale, rating, text, boolean). |
| `options` | `json` | -- | Stores options information for `EvaluationQuestion`. |
| `scale_min` | `int` | 10 | Stores scale min information for `EvaluationQuestion`. |
| `scale_max` | `int` | 10 | Maximum Likert scale value (e.g. 5 for a 1-5 scale). |
| `is_required` | `bool` | 1 | Flag mandating question response before submission. |
| `sort_order` | `int` | 10 | Stores sort order information for `EvaluationQuestion`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the EvaluationQuestion entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the EvaluationQuestion entry was last modified. |

---

#### 2.25. Entity: `StudentEvaluation` (Table: `student_evaluations`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Table Description:** Comprehensive trainee performance appraisal submitted by host employer evaluator.
- **Total Fields:** 21 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentEvaluation` record. |
| `template_id` | `int` | 10 | Foreign key referencing `evaluation_templates.id`. |
| `student_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `company_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `supervisor_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `ojt_record_id` | `int` | 10 | Foreign key referencing `ojt_records.id`. |
| `ojt_posting_id` | `int` | 10 | Foreign key referencing `ojt_postings.id`. |
| `status` | `varchar` | 30 | Appraisal workflow state (sent, submitted, verified). |
| `overall_score` | `numeric` | 5,2 | Composite percentage score computed across all criteria (0 to 100%). |
| `general_feedback` | `text` | -- | Stores general feedback information for `StudentEvaluation`. |
| `recommendation` | `varchar` | 100 | Stores recommendation information for `StudentEvaluation`. |
| `evaluator_name` | `varchar` | 255 | Stores evaluator name information for `StudentEvaluation`. |
| `evaluator_position` | `varchar` | 255 | Stores evaluator position information for `StudentEvaluation`. |
| `sent_at` | `timestamp` | -- | Stores sent at information for `StudentEvaluation`. |
| `submitted_at` | `timestamp` | -- | Stores submitted at information for `StudentEvaluation`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentEvaluation entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentEvaluation entry was last modified. |
| `term` | `varchar` | 20 | Evaluation period term (midterm, endterm). |
| `is_waived` | `bool` | 1 | Flag indicating if evaluation requirement was waived by supervisor. |
| `waiver_reason` | `text` | -- | Stores waiver reason information for `StudentEvaluation`. |
| `weight` | `numeric` | 4,2 | Academic weighting coefficient (e.g. 0.50 for 50% grade contribution). |

---

#### 2.26. Entity: `StudentEvaluationAnswer` (Table: `student_evaluation_answers`)
- **Domain:** Trainee Performance Evaluation & Rubrics
- **Table Description:** Itemized rating scores and qualitative feedback recorded per rubric criterion.
- **Total Fields:** 7 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `StudentEvaluationAnswer` record. |
| `student_evaluation_id` | `int` | 10 | Foreign key referencing `student_evaluations.id`. |
| `evaluation_question_id` | `int` | 10 | Foreign key referencing `evaluation_questions.id`. |
| `rating_value` | `int` | 10 | Numeric score assigned by evaluator on Likert scale. |
| `text_value` | `text` | -- | Qualitative commendation or constructive remarks. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the StudentEvaluationAnswer entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the StudentEvaluationAnswer entry was last modified. |

---

#### 2.27. Entity: `JobListing` (Table: `job_listings`)
- **Domain:** Career Recruitment & Job Placement
- **Table Description:** Full-time, contractual, and graduate career vacancies posted by partner companies.
- **Total Fields:** 17 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `JobListing` record. |
| `company_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `title` | `varchar` | 255 | Professional job title (e.g. Associate Software Engineer). |
| `department` | `varchar` | 255 | Organizational department. |
| `location` | `varchar` | 255 | Office location or remote job classification. |
| `employment_type` | `varchar` | 255 | Contract structure (Full-time, Part-time, Contract, Internship). |
| `salary_range` | `varchar` | 255 | Remuneration compensation package bracket. |
| `description` | `text` | -- | Stores description information for `JobListing`. |
| `responsibilities` | `json` | -- | Stores responsibilities information for `JobListing`. |
| `requirements` | `json` | -- | Stores requirements information for `JobListing`. |
| `benefits` | `json` | -- | Stores benefits information for `JobListing`. |
| `required_skills` | `json` | -- | Stores required skills information for `JobListing`. |
| `status` | `varchar` | 255 | Vacancy status (active, closed, archived). |
| `expires_at` | `timestamp` | -- | Stores expires at information for `JobListing`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the JobListing entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the JobListing entry was last modified. |
| `experience_level` | `varchar` | 60 | Stores experience level information for `JobListing`. |

---

#### 2.28. Entity: `JobApplication` (Table: `job_applications`)
- **Domain:** Career Recruitment & Job Placement
- **Table Description:** Career applications submitted by graduates, students, or registered jobseekers.
- **Total Fields:** 12 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `JobApplication` record. |
| `job_listing_id` | `int` | 10 | Foreign key referencing `job_listings.id`. |
| `applicant_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `status` | `varchar` | 255 | Recruitment pipeline state (applied, screening, interview, offered, hired, rejected). |
| `match_score` | `int` | 10 | Algorithmically computed resume-to-job competency match percentage. |
| `cover_letter` | `text` | -- | Candidate letter of intent and qualification summary. |
| `notes` | `text` | -- | Stores notes information for `JobApplication`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the JobApplication entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the JobApplication entry was last modified. |
| `offer_details` | `json` | -- | Stores offer details information for `JobApplication`. |
| `offer_decision` | `varchar` | 20 | Final applicant response to job offer (accepted, declined, pending). |
| `offer_decided_at` | `timestamp` | -- | Stores offer decided at information for `JobApplication`. |

---

#### 2.29. Entity: `Interview` (Table: `interviews`)
- **Domain:** Career Recruitment & Job Placement
- **Table Description:** Recruitment interview sessions scheduled between corporate hiring teams and candidates.
- **Total Fields:** 14 columns

| Field Name | Field Type | Length | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | 10 | Primary key. Unique auto-incrementing identifier for the `Interview` record. |
| `job_application_id` | `int` | 10 | Foreign key referencing `job_applications.id`. |
| `company_user_id` | `int` | 10 | Foreign key referencing `users.id`. |
| `type` | `varchar` | 255 | Session mode (Technical, Initial HR, Final Panel Interview). |
| `scheduled_date` | `date` | -- | Calendar date of interview meeting. |
| `scheduled_time` | `time` | -- | Stores scheduled time information for `Interview`. |
| `platform` | `varchar` | 255 | Interview platform (Google Meet, Zoom, On-site Office). |
| `status` | `varchar` | 255 | Interview outcome (scheduled, completed, cancelled, rescheduled). |
| `notes` | `text` | -- | Stores notes information for `Interview`. |
| `created_at` | `timestamp` | -- | System audit timestamp recording when the Interview entry was created. |
| `updated_at` | `timestamp` | -- | System audit timestamp recording when the Interview entry was last modified. |
| `interviewer_name` | `varchar` | 255 | Stores interviewer name information for `Interview`. |
| `duration` | `varchar` | 255 | Stores duration information for `Interview`. |
| `meeting_link` | `varchar` | 255 | Stores meeting link information for `Interview`. |

---
