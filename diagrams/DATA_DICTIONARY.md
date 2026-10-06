# Carlos Hilado Memorial State University (CHMSU)
## CHMSU HireMe Platform — System Data Dictionary & Database Specification

> **Document Type:** Academic Research Paper Technical Appendix / Database Specification  
> **Target System:** CHMSU HireMe Integrated OJT & Career Placement Management System  
> **Database Engine:** PostgreSQL 16 (Laravel 12 Eloquent ORM Architecture)  
> **Total Application Entities:** 27 Core Tables  
> **Date of Specification:** October 2026  

---

### 1. Architectural Overview & Domain Classification

The database schema of the CHMSU HireMe platform is structured into seven distinct architectural domains:

1. **Authentication & Core Access Control (`auth`):** Manages user identities (`users`), API tokens (`personal_access_tokens`), and password security.
2. **User Profiles & Role Metadata (`profile`):** Specializes actors into Students (`student_profiles`), Host Training Establishments (`company_profiles`), Faculty Supervisors (`supervisor_profiles`), Alumni (`graduate_profiles`), and Jobseekers (`jobseeker_profiles`).
3. **Student Portfolio & Career Credentials (`portfolio`):** Houses verified digital resumes including academic history (`student_education`), technical proficiencies (`student_skills`), work history (`student_experiences`), certifications (`student_achievements`), and repositories (`portfolio_projects`).
4. **OJT Internship Lifecycle & DTR Tracking (`ojt`):** Powers internship vacancy creation (`ojt_postings`), matching/endorsements (`student_ojt_interests`), clearance packets (`student_ojt_requirements`), placement records (`ojt_records`), and GPS-geofenced daily time records (`time_logs`).
5. **Trainee Evaluation System (`eval`):** Manages standardized university rubrics (`evaluation_templates`), question banks (`evaluation_questions`), host employer appraisals (`student_evaluations`), and itemized question scores (`student_evaluation_answers`).
6. **Recruitment & Job Hiring Pipeline (`job`):** Supports graduate hiring via job openings (`job_listings`), candidate applications (`job_applications`), and interview schedules (`interviews`).
7. **System Communication & Alerts (`comm`):** Facilitates real-time thread communication (`chat_messages`) and event-driven notifications (`app_notifications`).

---

### 2. Comprehensive Entity Data Dictionary

#### 2.1. Entity: `student_education`

- **Functional Domain:** Student Portfolio & Credentials
- **Entity Description:** Educational history records displayed on the student verified resume and portfolio.
- **Total Attributes:** 12 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the student user in users.id. |
| `school` | `character varying(255)` | NOT NULL | - | Name of academic institution attended. |
| `degree` | `character varying(255)` | NOT NULL | - | Degree title or certification earned (e.g. "BS in Information Technology"). |
| `year_start` | `character varying(255)` | NULL | - | Start year of attendance. |
| `year_end` | `character varying(255)` | NULL | - | Completion or expected graduation year. |
| `gpa` | `character varying(255)` | NULL | - | Grade Point Average or academic distinction. |
| `description` | `text` | NULL | - | Notable academic projects, electives, or honors. |
| `is_current` | `boolean` | NOT NULL | - | Boolean flag indicating current enrollment. |
| `sort_order` | `integer` | NOT NULL | - | Display sequence index on the resume view. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of update. |

---

#### 2.2. Entity: `student_skills`

- **Functional Domain:** Student Portfolio & Credentials
- **Entity Description:** Itemized technical and soft skills, competency level ratings, and peer/supervisor endorsements.
- **Total Attributes:** 9 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the student user in users.id. |
| `name` | `character varying(255)` | NOT NULL | - | Skill title (e.g. "Laravel", "React", "PostgreSQL", "UI/UX Design"). |
| `level` | `smallint` | NOT NULL | - | Self-assessed or verified proficiency score (0 to 100). |
| `category` | `character varying(255)` | NOT NULL | - | Skill domain: "language", "framework", "tool", "database", "soft_skill". |
| `endorsed_count` | `integer` | NOT NULL | - | Number of validated endorsements from supervisors or instructors. |
| `sort_order` | `integer` | NOT NULL | - | Display sequence index. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of update. |

---

#### 2.3. Entity: `student_experiences`

- **Functional Domain:** Student Portfolio & Credentials
- **Entity Description:** Work experience entries including prior internships, freelance gigs, and volunteer projects.
- **Total Attributes:** 15 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the student user in users.id. |
| `role` | `character varying(255)` | NOT NULL | - | Position or title held (e.g. "Junior Web Developer Intern"). |
| `company` | `character varying(255)` | NOT NULL | - | Organization or client name. |
| `type` | `character varying(255)` | NOT NULL | - | Employment classification: "OJT", "Freelance", "Volunteer", "Full-time", "Part-time". |
| `period_start` | `character varying(255)` | NULL | - | Start date of engagement. |
| `period_end` | `character varying(255)` | NULL | - | End date (null if ongoing). |
| `description` | `text` | NULL | - | Key duties, responsibilities, and achievements. |
| `skills` | `json` | NULL | - | JSON array of technology tags utilized during the role. |
| `is_current` | `boolean` | NOT NULL | - | Boolean indicating ongoing engagement. |
| `sort_order` | `integer` | NOT NULL | - | Display sequence ordering. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of update. |
| `location` | `character varying(255)` | NULL | - | Workplace city or remote status. |
| `is_it_related` | `boolean` | NOT NULL | - | Boolean flag indicating relevance to IT curriculum. |

---

#### 2.4. Entity: `student_achievements`

- **Functional Domain:** Student Portfolio & Credentials
- **Entity Description:** Honors, certifications, hackathon awards, and verified credentials.
- **Total Attributes:** 17 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the student user in users.id. |
| `title` | `character varying(255)` | NOT NULL | - | Award or certification title (e.g. "Dean's Lister", "AWS Certified Cloud Practitioner"). |
| `description` | `text` | NULL | - | Issuing body and context for the achievement. |
| `type` | `character varying(255)` | NOT NULL | - | Category: "academic", "certification", "competition", "professional". |
| `icon` | `character varying(255)` | NOT NULL | - | UI icon identifier string for rendering. |
| `date` | `character varying(255)` | NULL | - | Date issued or awarded. |
| `sort_order` | `integer` | NOT NULL | - | Display sequence ordering. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of update. |
| `issuer` | `character varying(255)` | NULL | - | Issuing organization or university department. |
| `credential_id` | `character varying(255)` | NULL | - | Official certificate serial or credential number. |
| `credential_url` | `character varying(255)` | NULL | - | Online verification link or badge URL. |
| `certificate_url` | `character varying(255)` | NULL | - | Stores attribute value for certificate_url. |
| `award_level` | `character varying(255)` | NULL | - | Stores attribute value for award_level. |
| `expires_at` | `character varying(255)` | NULL | - | Stores attribute value for expires_at. |
| `does_not_expire` | `boolean` | NOT NULL | - | Stores attribute value for does_not_expire. |

---

#### 2.5. Entity: `portfolio_projects`

- **Functional Domain:** Student Portfolio & Credentials
- **Entity Description:** Showcase projects completed by students with screenshots, live URLs, and source repository links.
- **Total Attributes:** 16 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the student user in users.id. |
| `title` | `character varying(255)` | NOT NULL | - | Project title (e.g. "Campus Asset Tracking System"). |
| `description` | `text` | NULL | - | Summary of project purpose, problem statement, and solution. |
| `tech_stack` | `json` | NULL | - | JSON array of technologies utilized (e.g. ["PHP", "Vue", "Tailwind"]). |
| `project_url` | `character varying(255)` | NULL | - | Live deployment or demonstration URL. |
| `repo_url` | `character varying(255)` | NULL | - | Source code repository link (GitHub/GitLab). |
| `image_url` | `character varying(255)` | NULL | - | Thumbnail preview image path. |
| `is_featured` | `boolean` | NOT NULL | - | Boolean flag to highlight project in prominent showcase. |
| `sort_order` | `integer` | NOT NULL | - | Display sequence ordering. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of update. |
| `category` | `character varying(255)` | NULL | - | Stores attribute value for category. |
| `role` | `character varying(255)` | NULL | - | Student role in project: "Lead Developer", "UI Designer", "Full Stack". |
| `date_completed` | `character varying(255)` | NULL | - | Stores attribute value for date_completed. |
| `outcomes` | `text` | NULL | - | Stores attribute value for outcomes. |

---

#### 2.6. Entity: `student_profiles`

- **Functional Domain:** User Profiles & Roles
- **Entity Description:** Academic information, contact details, career headline, and OJT readiness profile for enrolled student trainees.
- **Total Attributes:** 23 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the core user account in users.id. |
| `school` | `character varying(255)` | NULL | - | College or University name (e.g. "Carlos Hilado Memorial State University"). |
| `campus` | `character varying(255)` | NULL | - | Campus location (e.g. "Talisay", "Alijis", "Fortune Towne", "Binalbagan"). |
| `program` | `character varying(255)` | NULL | - | Degree program abbreviation (e.g. "BSIT", "BSCS", "BSIS"). |
| `year_level` | `character varying(255)` | NULL | - | Academic year standing (e.g. "4th Year", "3rd Year"). |
| `student_id` | `character varying(255)` | NULL | - | Official university-issued student identification number. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of profile creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of profile last update. |
| `headline` | `character varying(255)` | NULL | - | Short professional bio/headline for job matching. |
| `bio` | `text` | NULL | - | Expanded narrative description of student interests, career focus, and aspirations. |
| `location` | `character varying(255)` | NULL | - | City or municipality of residence (e.g. "Talisay City", "Bacolod City"). |
| `github_url` | `character varying(255)` | NULL | - | External hyperlink to student public GitHub profile. |
| `linkedin_url` | `character varying(255)` | NULL | - | External hyperlink to student LinkedIn profile. |
| `portfolio_url` | `character varying(255)` | NULL | - | External link to student personal website or hosted showcase. |
| `status` | `character varying(255)` | NOT NULL | - | Academic lifecycle status: "active_ojt", "seeking", "placed", "alumni". |
| `phone` | `character varying(255)` | NULL | - | Contact mobile/telephone number. |
| `cover_color` | `character varying(255)` | NULL | - | Hex color code or theme gradient chosen for profile header. |
| `resume_type` | `character varying(255)` | NOT NULL | - | Resume format style: "objective" or "summary". |
| `resume_objective` | `text` | NULL | - | Custom statement summarizing professional intent and qualifications. |
| `section` | `character varying(255)` | NULL | - | Academic class section code (e.g. "4-A", "4-B"). |
| `batch` | `character varying(255)` | NULL | - | Graduating academic school year or batch year (e.g. "2026"). |
| `requirements_drive_url` | `text` | NULL | - | Google Drive link hosting the student pre-deployment clearance documents. |

---

#### 2.7. Entity: `student_ojt_interests`

- **Functional Domain:** OJT Internship & DTR Tracking
- **Entity Description:** Application matching table tracking student interest expressions, endorsement requests, and company acceptance.
- **Total Attributes:** 33 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `student_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing student applicant in users.id. |
| `ojt_posting_id` | `bigint` | NOT NULL | **FK** &rarr; `ojt_postings.id` | Foreign key referencing target internship vacancy in ojt_postings.id. |
| `status` | `character varying(255)` | NOT NULL | - | Pipeline status: "interested", "pending_endorsement", "endorsed", "accepted", "rejected", "withdrawn". |
| `student_message` | `text` | NULL | - | Cover message or justification submitted by the student. |
| `endorsed_by` | `bigint` | NULL | **FK** &rarr; `users.id` | Foreign key referencing faculty supervisor who endorsed the student in users.id. |
| `endorsed_at` | `timestamp without time zone` | NULL | - | Timestamp of supervisor endorsement issuance. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of interest submission. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of latest status transition. |
| `endorsement_letter` | `character varying(255)` | NULL | - | Stores attribute value for endorsement_letter. |
| `company_accepted_at` | `timestamp without time zone` | NULL | - | Timestamp when company accepted the student for placement. |
| `endorsement_requested_at` | `timestamp without time zone` | NULL | - | Timestamp when student requested supervisor endorsement. |
| `ojt_started_at` | `timestamp without time zone` | NULL | - | Stores attribute value for ojt_started_at. |
| `resume_viewed_at` | `timestamp without time zone` | NULL | - | Stores attribute value for resume_viewed_at. |
| `company_note` | `text` | NULL | - | Stores attribute value for company_note. |
| `interview_scheduled_at` | `timestamp without time zone` | NULL | - | Stores attribute value for interview_scheduled_at. |
| `interview_type` | `character varying(255)` | NULL | - | Stores attribute value for interview_type. |
| `interview_location` | `text` | NULL | - | Stores attribute value for interview_location. |
| `coordinator_note` | `text` | NULL | - | Stores attribute value for coordinator_note. |
| `endorsement_letter_sent_at` | `timestamp without time zone` | NULL | - | Stores attribute value for endorsement_letter_sent_at. |
| `ojt_start_date` | `date` | NULL | - | Stores attribute value for ojt_start_date. |
| `ojt_instructions` | `text` | NULL | - | Specific onboarding instructions sent by company to intern. |
| `schedule_days` | `json` | NULL | - | Stores attribute value for schedule_days. |
| `shift_start` | `character varying(10)` | NULL | - | Stores attribute value for shift_start. |
| `shift_end` | `character varying(10)` | NULL | - | Stores attribute value for shift_end. |
| `lunch_start` | `character varying(10)` | NULL | - | Stores attribute value for lunch_start. |
| `lunch_end` | `character varying(10)` | NULL | - | Stores attribute value for lunch_end. |
| `has_lunch_break` | `boolean` | NOT NULL | - | Stores attribute value for has_lunch_break. |
| `daily_hours` | `numeric` | NULL | - | Stores attribute value for daily_hours. |
| `weekly_hours` | `numeric` | NULL | - | Stores attribute value for weekly_hours. |
| `allow_overtime` | `boolean` | NOT NULL | - | Stores attribute value for allow_overtime. |
| `max_overtime_hours` | `numeric` | NULL | - | Stores attribute value for max_overtime_hours. |
| `estimated_end_date` | `date` | NULL | - | Stores attribute value for estimated_end_date. |

---

#### 2.8. Entity: `student_ojt_requirements`

- **Functional Domain:** OJT Internship & DTR Tracking
- **Entity Description:** Checklist packet of mandatory pre-deployment clearance documents (Medical Certificate, Parents Consent, Barangay Clearance, MOA Acknowledgement).
- **Total Attributes:** 16 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `student_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing student trainee in users.id. |
| `supervisor_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing reviewing supervisor in users.id. |
| `interest_id` | `bigint` | NULL | **FK** &rarr; `student_ojt_interests.id` | Foreign key referencing student_ojt_interests.id. |
| `posting_id` | `bigint` | NULL | **FK** &rarr; `ojt_postings.id` | Foreign key referencing ojt_postings.id. |
| `title` | `character varying(255)` | NOT NULL | - | Requirement packet title (e.g. "Pre-Deployment OJT Document Packet"). |
| `items` | `json` | NOT NULL | - | JSON array of required document checklist items and compliance flags. |
| `instructions` | `text` | NULL | - | Supervisor guidelines for document submission. |
| `due_date` | `date` | NULL | - | Submission deadline date. |
| `status` | `character varying(255)` | NOT NULL | - | Verification status: "pending", "submitted", "verified", "needs_revision". |
| `drive_url` | `text` | NULL | - | External Google Drive folder URL containing digital copies of documents. |
| `supervisor_remarks` | `text` | NULL | - | Feedback or corrective instructions from reviewing coordinator. |
| `submitted_at` | `timestamp without time zone` | NULL | - | Timestamp of packet upload. |
| `verified_at` | `timestamp without time zone` | NULL | - | Timestamp of supervisor formal verification and sign-off. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of requirement creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of requirement update. |

---

#### 2.9. Entity: `password_reset_tokens`

- **Functional Domain:** Authentication & Core Security
- **Entity Description:** Time-limited recovery tokens generated during the forgot-password security workflow.
- **Total Attributes:** 3 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `email` | `character varying(255)` | NOT NULL | **PK** (Primary Key) | User account email address requesting password reset. |
| `token` | `character varying(255)` | NOT NULL | - | One-time secure hashed cryptographic recovery token. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of token creation; used to check expiry (e.g. 60 minutes). |

---

#### 2.10. Entity: `company_profiles`

- **Functional Domain:** User Profiles & Roles
- **Entity Description:** Partner host training establishments (HTE) and employer directory information including MOA accreditation compliance.
- **Total Attributes:** 27 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the associated employer account in users.id. |
| `company_name` | `character varying(255)` | NULL | - | Registered business or corporate legal name. |
| `company_location` | `character varying(255)` | NULL | - | Primary city or region (e.g. "Bacolod City", "Metro Manila"). |
| `company_type` | `character varying(255)` | NULL | - | Industry classification (e.g. "Information Technology", "FinTech"). |
| `website` | `character varying(255)` | NULL | - | Official company website URL. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of company registration. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of latest company profile update. |
| `company_size` | `character varying(255)` | NULL | - | Employee bracket (e.g. "1-10", "11-50", "51-200", "200+"). |
| `contact_email` | `character varying(255)` | NULL | - | Official HR or internship coordinator electronic mail address. |
| `contact_phone` | `character varying(255)` | NULL | - | Official contact phone or hotline. |
| `description` | `text` | NULL | - | Detailed narrative about company missions, services, and work culture. |
| `logo_url` | `character varying(255)` | NULL | - | File storage path or URL to company corporate logo. |
| `profile_completed` | `boolean` | NOT NULL | - | Boolean indicating whether corporate registration profile is complete. |
| `contact_person` | `character varying(255)` | NULL | - | Full name of authorized company representative / HR lead. |
| `moa_file_path` | `character varying(255)` | NULL | - | Secure storage path of signed Memorandum of Agreement (MOA) PDF. |
| `moa_start_date` | `date` | NULL | - | Effective validity commencement date of the MOA agreement. |
| `moa_end_date` | `date` | NULL | - | Expiry date of institutional MOA partnership. |
| `moa_status` | `character varying(255)` | NOT NULL | - | Accreditation status: "Pending", "Active", "Expired", "Renewing". |
| `status` | `character varying(255)` | NOT NULL | - | Platform approval status: "Pending", "Approved", "Rejected". |
| `ownership_type` | `character varying(255)` | NULL | - | Corporate structure (e.g. "Private", "Public", "Government"). |
| `year_founded` | `character varying(255)` | NULL | - | Calendar year of establishment. |
| `full_address` | `character varying(255)` | NULL | - | Complete street address, building, and postal code. |
| `contact_title` | `character varying(255)` | NULL | - | Job title of representative (e.g. "HR Director", "Talent Acquisition"). |
| `registration_source` | `character varying(255)` | NOT NULL | - | Origin of profile: "self_registered", "admin_created", "invited". |
| `moa_requested_at` | `timestamp without time zone` | NULL | - | Stores attribute value for moa_requested_at. |
| `moa_request_notes` | `text` | NULL | - | Administrator or supervisor comments regarding MOA documentation. |

---

#### 2.11. Entity: `ojt_postings`

- **Functional Domain:** OJT Internship & DTR Tracking
- **Entity Description:** Internship vacancy notices published by accredited partner companies for student trainees.
- **Total Attributes:** 26 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `company_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the company in users.id. |
| `title` | `character varying(255)` | NOT NULL | - | OJT position title (e.g. "Software QA Intern", "Network Support Trainee"). |
| `company_name` | `character varying(255)` | NOT NULL | - | Denormalized company name for fast listing query. |
| `company_initial` | `character varying(4)` | NULL | - | Single or double letter avatar initial. |
| `company_color` | `character varying(20)` | NOT NULL | - | Hex badge color for UI rendering. |
| `department` | `character varying(255)` | NULL | - | Target department (e.g. "IT Operations", "Engineering"). |
| `industry` | `character varying(255)` | NULL | - | Sector classification (e.g. "Software Services"). |
| `location` | `character varying(255)` | NOT NULL | - | Workplace city or modality. |
| `description` | `text` | NULL | - | Comprehensive job role description and learning duties. |
| `required_skills` | `json` | NULL | - | JSON array of prerequisites and desired technologies. |
| `preferred_courses` | `json` | NULL | - | JSON array of eligible university degree programs (e.g. ["BSIT", "BSIS"]). |
| `slots_total` | `integer` | NOT NULL | - | Total trainee quota authorized for this posting. |
| `slots_remaining` | `integer` | NOT NULL | - | Currently available unfilled trainee slots. |
| `duration` | `character varying(255)` | NULL | - | Estimated duration text (e.g. "486 Hours / 3 Months"). |
| `schedule_type` | `character varying(255)` | NOT NULL | - | Working schedule: "full_day", "half_day", "flexible". |
| `status` | `character varying(255)` | NOT NULL | - | Listing lifecycle status: "open", "filling_up", "closed", "draft". |
| `expires_at` | `timestamp without time zone` | NULL | - | Application deadline timestamp. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of posting creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of posting update. |
| `branch_name` | `character varying(255)` | NULL | - | Specific company facility or branch site. |
| `latitude` | `numeric` | NULL | - | Geographical latitude for GPS attendance geofencing boundary. |
| `longitude` | `numeric` | NULL | - | Geographical longitude for GPS attendance geofencing boundary. |
| `learning_outcomes` | `text` | NULL | - | Specific CHMSU syllabus learning outcomes achieved during internship. |
| `required_documents` | `json` | NULL | - | Stores attribute value for required_documents. |
| `qualifications` | `json` | NULL | - | Minimum academic and technical requirements. |

---

#### 2.12. Entity: `ojt_records`

- **Functional Domain:** OJT Internship & DTR Tracking
- **Entity Description:** Active internship placement contract tracking cumulative hours rendered against the degree requirement.
- **Total Attributes:** 25 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing the student trainee in users.id. |
| `company_name` | `character varying(255)` | NOT NULL | - | Host company name where trainee is stationed. |
| `supervisor_name` | `character varying(255)` | NULL | - | Name of designated industry supervisor/mentor at company. |
| `supervisor_email` | `character varying(255)` | NULL | - | Contact email of company mentor. |
| `location` | `character varying(255)` | NULL | - | Physical training site or branch address. |
| `start_date` | `date` | NULL | - | Formal internship start date. |
| `end_date` | `date` | NULL | - | Projected or actual completion date. |
| `required_hours` | `integer` | NOT NULL | - | Total required training hours mandated by university curriculum (e.g. 486). |
| `completed_hours` | `numeric` | NOT NULL | - | Cumulative approved hours rendered to date (decimal precision). |
| `status` | `character varying(255)` | NOT NULL | - | Placement status: "active", "completed", "withdrawn", "suspended". |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of placement creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of latest update. |
| `company_instructions` | `text` | NULL | - | Standing workplace guidelines and emergency contacts. |
| `schedule_days` | `json` | NULL | - | JSON array of agreed weekly working days (e.g. ["Mon","Tue","Wed","Thu","Fri"]). |
| `shift_start` | `character varying(10)` | NULL | - | Stores attribute value for shift_start. |
| `shift_end` | `character varying(10)` | NULL | - | Stores attribute value for shift_end. |
| `lunch_start` | `character varying(10)` | NULL | - | Stores attribute value for lunch_start. |
| `lunch_end` | `character varying(10)` | NULL | - | Stores attribute value for lunch_end. |
| `has_lunch_break` | `boolean` | NOT NULL | - | Stores attribute value for has_lunch_break. |
| `daily_hours` | `numeric` | NULL | - | Stores attribute value for daily_hours. |
| `weekly_hours` | `numeric` | NULL | - | Stores attribute value for weekly_hours. |
| `allow_overtime` | `boolean` | NOT NULL | - | Stores attribute value for allow_overtime. |
| `max_overtime_hours` | `numeric` | NULL | - | Stores attribute value for max_overtime_hours. |
| `estimated_end_date` | `date` | NULL | - | Stores attribute value for estimated_end_date. |

---

#### 2.13. Entity: `users`

- **Functional Domain:** Authentication & Core Security
- **Entity Description:** Primary authentication identity table storing all authenticated platform actors (Students, Company HR, OJT Supervisors, Jobseekers, and System Administrators).
- **Total Attributes:** 11 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Auto-incrementing unique user surrogate identifier. |
| `name` | `character varying(255)` | NOT NULL | - | Full legal name or authorized contact name of the user. |
| `email` | `character varying(255)` | NOT NULL | - | Primary unique electronic mail address used for authentication and communications. |
| `email_verified_at` | `timestamp without time zone` | NULL | - | Timestamp indicating when the email was confirmed via verification token. |
| `password` | `character varying(255)` | NOT NULL | - | Bcrypt salted and hashed credential string. |
| `remember_token` | `character varying(100)` | NULL | - | Laravel Sanctum / Session persistent cookie token. |
| `created_at` | `timestamp without time zone` | NULL | - | Record insertion timestamp. |
| `updated_at` | `timestamp without time zone` | NULL | - | Record modification timestamp. |
| `role` | `character varying(255)` | NOT NULL | - | System access control role: "student", "company", "supervisor", "jobseeker", "admin". |
| `onboarding_completed` | `boolean` | NOT NULL | - | Boolean flag indicating whether initial profile setup wizard was finished. |
| `avatar_url` | `character varying(255)` | NULL | - | Relative path or CDN URL pointing to the user profile avatar photo. |

---

#### 2.14. Entity: `personal_access_tokens`

- **Functional Domain:** Authentication & Core Security
- **Entity Description:** Laravel Sanctum API tokens utilized for stateless Bearer token authentication in API calls.
- **Total Attributes:** 10 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate key for the access token record. |
| `tokenable_type` | `character varying(255)` | NOT NULL | - | Polymorphic model type (typically "App\Models\User"). |
| `tokenable_id` | `bigint` | NOT NULL | - | Foreign ID of the associated entity in the tokenable model. |
| `name` | `text` | NOT NULL | - | Descriptor for the token (e.g. "auth-token", "mobile-app"). |
| `token` | `character varying(64)` | NOT NULL | - | SHA-256 hashed 64-character token string. |
| `abilities` | `text` | NULL | - | JSON array defining specific authorization permissions or scopes. |
| `last_used_at` | `timestamp without time zone` | NULL | - | Timestamp indicating the most recent API request executed with this token. |
| `expires_at` | `timestamp without time zone` | NULL | - | Expiration timestamp after which token is invalid. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp when token was issued. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp when token attributes were updated. |

---

#### 2.15. Entity: `supervisor_profiles`

- **Functional Domain:** User Profiles & Roles
- **Entity Description:** Faculty coordinators and university supervisors assigned to monitor student intern batches.
- **Total Attributes:** 7 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing university supervisor account in users.id. |
| `company_name` | `character varying(255)` | NULL | - | Department, College, or assigned industry linkage unit. |
| `position` | `character varying(255)` | NULL | - | Academic faculty title (e.g. "OJT Coordinator", "Department Chair"). |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of latest update. |
| `course` | `character varying(255)` | NULL | - | Assigned degree program monitored by supervisor (e.g. "BSIT", "BSCS"). |

---

#### 2.16. Entity: `time_logs`

- **Functional Domain:** OJT Internship & DTR Tracking
- **Entity Description:** Daily Time Record (DTR) entries with morning/afternoon split sessions and GPS location geofencing validation.
- **Total Attributes:** 36 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing student intern in users.id. |
| `ojt_record_id` | `bigint` | NULL | **FK** &rarr; `ojt_records.id` | Foreign key referencing parent placement contract in ojt_records.id. |
| `log_date` | `date` | NOT NULL | - | Calendar date of duty rendered. |
| `time_in` | `time without time zone` | NULL | - | Morning session clock-in timestamp. |
| `time_out` | `time without time zone` | NULL | - | Morning session clock-out timestamp. |
| `hours_rendered` | `numeric` | NOT NULL | - | Calculated net hours rendered for the day (excluding unpaid meal breaks). |
| `description` | `text` | NULL | - | Daily narrative summary of tasks performed and accomplishments. |
| `latitude` | `numeric` | NULL | - | Captured device latitude at clock event. |
| `longitude` | `numeric` | NULL | - | Captured device longitude at clock event. |
| `status` | `character varying(255)` | NOT NULL | - | Log approval status: "pending", "approved", "rejected". |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of log submission. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of log modification. |
| `time_in_lat` | `numeric` | NULL | - | Latitude recorded during check-in event. |
| `time_in_lon` | `numeric` | NULL | - | Longitude recorded during check-in event. |
| `time_out_lat` | `numeric` | NULL | - | Latitude recorded during check-out event. |
| `time_out_lon` | `numeric` | NULL | - | Longitude recorded during check-out event. |
| `location_validity` | `character varying(255)` | NULL | - | Geofencing status: "valid", "outside_geofence", "unverified". |
| `distance_meters` | `integer` | NULL | - | Calculated radial distance in meters from designated company office coordinate. |
| `morning_in` | `time without time zone` | NULL | - | Timestamp of morning session start. |
| `morning_out` | `time without time zone` | NULL | - | Timestamp of morning session end. |
| `afternoon_in` | `time without time zone` | NULL | - | Timestamp of afternoon session start. |
| `afternoon_out` | `time without time zone` | NULL | - | Timestamp of afternoon session end. |
| `morning_hours` | `numeric` | NOT NULL | - | Stores attribute value for morning_hours. |
| `afternoon_hours` | `numeric` | NOT NULL | - | Stores attribute value for afternoon_hours. |
| `morning_in_lat` | `numeric` | NULL | - | Stores attribute value for morning_in_lat. |
| `morning_in_lon` | `numeric` | NULL | - | Stores attribute value for morning_in_lon. |
| `morning_out_lat` | `numeric` | NULL | - | Stores attribute value for morning_out_lat. |
| `morning_out_lon` | `numeric` | NULL | - | Stores attribute value for morning_out_lon. |
| `afternoon_in_lat` | `numeric` | NULL | - | Stores attribute value for afternoon_in_lat. |
| `afternoon_in_lon` | `numeric` | NULL | - | Stores attribute value for afternoon_in_lon. |
| `afternoon_out_lat` | `numeric` | NULL | - | Stores attribute value for afternoon_out_lat. |
| `afternoon_out_lon` | `numeric` | NULL | - | Stores attribute value for afternoon_out_lon. |
| `morning_validity` | `character varying(255)` | NULL | - | Stores attribute value for morning_validity. |
| `afternoon_validity` | `character varying(255)` | NULL | - | Stores attribute value for afternoon_validity. |
| `auto_morning_timeout` | `boolean` | NOT NULL | - | Stores attribute value for auto_morning_timeout. |

---

#### 2.17. Entity: `app_notifications`

- **Functional Domain:** Communication & Alerts
- **Entity Description:** In-app event notifications for endorsements, approvals, evaluation dispatches, and job offers.
- **Total Attributes:** 9 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing recipient in users.id. |
| `type` | `character varying(255)` | NOT NULL | - | Event classification (e.g. "endorsement_granted", "evaluation_received"). |
| `title` | `character varying(255)` | NOT NULL | - | Concise notification alert heading. |
| `message` | `text` | NOT NULL | - | Descriptive notification body text. |
| `data` | `json` | NULL | - | JSON payload containing contextual identifiers for deep-linking. |
| `read_at` | `timestamp without time zone` | NULL | - | Timestamp when user dismissed or read the notification. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of notification generation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of notification update. |

---

#### 2.18. Entity: `chat_messages`

- **Functional Domain:** Communication & Alerts
- **Entity Description:** Real-time conversational messaging between students, supervisors, and corporate recruiters.
- **Total Attributes:** 8 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `conversation_key` | `character varying(255)` | NOT NULL | - | Compound contextual key grouping thread (e.g. "ojt_interest_15", "job_app_4"). |
| `sender_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing sender account in users.id. |
| `receiver_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing recipient account in users.id. |
| `message` | `text` | NOT NULL | - | Text message payload content. |
| `read_at` | `timestamp without time zone` | NULL | - | Timestamp when recipient viewed message (null if unread). |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp when message was dispatched. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of message record modification. |

---

#### 2.19. Entity: `evaluation_templates`

- **Functional Domain:** Trainee Evaluation Rubrics
- **Entity Description:** Standardized evaluation rubrics established by the university or customized per degree program.
- **Total Attributes:** 8 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `supervisor_id` | `bigint` | NULL | **FK** &rarr; `users.id` | Foreign key referencing authoring faculty coordinator in users.id (null for global). |
| `program` | `character varying(50)` | NULL | - | Specific academic program code ("BSIT", "BSCS", "BSIS") or null for all. |
| `title` | `character varying(255)` | NOT NULL | - | Evaluation instrument title (e.g. "CHMSU CIER OJT Performance Evaluation"). |
| `description` | `text` | NULL | - | Instructions and scoring guidance for host company evaluators. |
| `is_active` | `boolean` | NOT NULL | - | Boolean flag indicating whether rubric is available for active dispatch. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of template creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of template update. |

---

#### 2.20. Entity: `evaluation_questions`

- **Functional Domain:** Trainee Evaluation Rubrics
- **Entity Description:** Individual rubric criteria items grouped by competence category with rating scales or qualitative answers.
- **Total Attributes:** 12 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `template_id` | `bigint` | NOT NULL | **FK** &rarr; `evaluation_templates.id` | Foreign key referencing parent evaluation_templates.id. |
| `category` | `character varying(100)` | NOT NULL | - | Evaluation dimension: "Technical Competence", "Professionalism & Work Ethic", "Communication & Teamwork", "Overall Recommendation". |
| `question_text` | `text` | NOT NULL | - | The prompt or assessment statement evaluated by the rater. |
| `question_type` | `character varying(30)` | NOT NULL | - | Response format: "rating" (1-5 likert), "multiple_choice", "text". |
| `options` | `json` | NULL | - | JSON array of multiple choice options for qualitative recommendation items. |
| `scale_min` | `integer` | NOT NULL | - | Minimum numerical score on rating scale (typically 1). |
| `scale_max` | `integer` | NOT NULL | - | Maximum numerical score on rating scale (typically 5). |
| `is_required` | `boolean` | NOT NULL | - | Boolean flag requiring response before form submission. |
| `sort_order` | `integer` | NOT NULL | - | Display sequence index in rubric form. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of criterion creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of criterion update. |

---

#### 2.21. Entity: `student_evaluation_answers`

- **Functional Domain:** Trainee Evaluation Rubrics
- **Entity Description:** Itemized question-level responses and score values recorded for an evaluation.
- **Total Attributes:** 7 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `student_evaluation_id` | `bigint` | NOT NULL | **FK** &rarr; `student_evaluations.id` | Foreign key referencing parent student_evaluations.id. |
| `evaluation_question_id` | `bigint` | NOT NULL | **FK** &rarr; `evaluation_questions.id` | Foreign key referencing specific criterion in evaluation_questions.id. |
| `rating_value` | `integer` | NULL | - | Integer score assigned (1 to 5) for rating questions. |
| `text_value` | `text` | NULL | - | Written textual feedback or selected multiple-choice answer. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of response insertion. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of response modification. |

---

#### 2.22. Entity: `jobseeker_profiles`

- **Functional Domain:** User Profiles & Roles
- **Entity Description:** Employment seeking profile for CHMSU alumni and graduated trainees seeking full-time or contract roles.
- **Total Attributes:** 15 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing jobseeker account in users.id. |
| `desired_job_title` | `character varying(255)` | NULL | - | Target profession or role (e.g. "Full Stack Developer", "Data Analyst"). |
| `work_preference` | `character varying(255)` | NULL | - | Work environment choice: "remote", "hybrid", "onsite". |
| `years_of_experience` | `character varying(255)` | NULL | - | Estimated professional experience in years. |
| `headline` | `character varying(255)` | NULL | - | Professional tagline summary for hiring managers. |
| `bio` | `text` | NULL | - | Expanded career bio, capabilities, and objectives. |
| `location` | `character varying(255)` | NULL | - | Current residential city or province. |
| `portfolio_url` | `character varying(255)` | NULL | - | External portfolio website link. |
| `linkedin_url` | `character varying(255)` | NULL | - | LinkedIn profile URL. |
| `phone` | `character varying(255)` | NULL | - | Contact telephone number. |
| `avatar_url` | `character varying(255)` | NULL | - | Specific avatar image override for jobseeker profile. |
| `profile_completed` | `boolean` | NOT NULL | - | Boolean flag confirming complete jobseeker profile. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of registration. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of latest update. |

---

#### 2.23. Entity: `graduate_profiles`

- **Functional Domain:** User Profiles & Roles
- **Entity Description:** Institutional alumni tracer records linking graduates to employment outcomes and university batches.
- **Total Attributes:** 9 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing graduate account in users.id. |
| `year_graduated` | `character varying(255)` | NULL | - | Calendar year of graduation from the university. |
| `campus` | `character varying(255)` | NULL | - | CHMSU campus graduated from (e.g. "Alijis Campus"). |
| `course` | `character varying(255)` | NULL | - | Degree program completed (e.g. "BS Information Technology"). |
| `section` | `character varying(255)` | NULL | - | Final academic class section graduated from. |
| `employment_status` | `character varying(255)` | NULL | - | Current status: "employed", "looking", "freelance", "studying". |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of graduate record insertion. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of record update. |

---

#### 2.24. Entity: `student_evaluations`

- **Functional Domain:** Trainee Evaluation Rubrics
- **Entity Description:** Evaluation dispatches issued to host company mentors and final submitted appraisal summaries.
- **Total Attributes:** 17 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `template_id` | `bigint` | NOT NULL | **FK** &rarr; `evaluation_templates.id` | Foreign key referencing evaluation_templates.id. |
| `student_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing student trainee in users.id. |
| `company_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing host employer in users.id. |
| `supervisor_user_id` | `bigint` | NULL | **FK** &rarr; `users.id` | Foreign key referencing observing university coordinator in users.id. |
| `ojt_record_id` | `bigint` | NULL | **FK** &rarr; `ojt_records.id` | Foreign key referencing associated ojt_records.id. |
| `ojt_posting_id` | `bigint` | NULL | **FK** &rarr; `ojt_postings.id` | Foreign key referencing associated ojt_postings.id. |
| `status` | `character varying(30)` | NOT NULL | - | Evaluation status: "pending", "submitted", "reviewed". |
| `overall_score` | `numeric` | NULL | - | Calculated mean numerical score across all rating criteria (out of 5.00). |
| `general_feedback` | `text` | NULL | - | Qualitative appraisal of student strengths and growth areas. |
| `recommendation` | `character varying(100)` | NULL | - | Employment readiness recommendation choice. |
| `evaluator_name` | `character varying(255)` | NULL | - | Full name of company supervisor executing the evaluation. |
| `evaluator_position` | `character varying(255)` | NULL | - | Designation/title of company evaluator. |
| `sent_at` | `timestamp without time zone` | NULL | - | Timestamp when evaluation request was dispatched to company. |
| `submitted_at` | `timestamp without time zone` | NULL | - | Timestamp when company completed and signed the evaluation. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of evaluation record creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of update. |

---

#### 2.25. Entity: `job_listings`

- **Functional Domain:** Recruitment & Job Pipeline
- **Entity Description:** Employment vacancy notices for graduates and alumni posted by accredited corporate partners.
- **Total Attributes:** 17 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `company_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing posting employer in users.id. |
| `title` | `character varying(255)` | NOT NULL | - | Job title (e.g. "Junior Backend Developer", "Systems Administrator"). |
| `department` | `character varying(255)` | NULL | - | Corporate division or department. |
| `location` | `character varying(255)` | NOT NULL | - | Workplace city or remote status. |
| `employment_type` | `character varying(255)` | NOT NULL | - | Contract type: "full_time", "part_time", "contract", "internship". |
| `salary_range` | `character varying(255)` | NULL | - | Expected remuneration compensation bracket. |
| `description` | `text` | NULL | - | Full narrative job overview and organization profile. |
| `responsibilities` | `json` | NULL | - | JSON array of primary operational duties. |
| `requirements` | `json` | NULL | - | JSON array of mandatory qualifications and degree prerequisites. |
| `benefits` | `json` | NULL | - | JSON array of corporate perks, health plans, and allowances. |
| `required_skills` | `json` | NULL | - | JSON array of necessary technical skills. |
| `status` | `character varying(255)` | NOT NULL | - | Listing status: "open", "closed", "draft", "filled". |
| `expires_at` | `timestamp without time zone` | NULL | - | Vacancy closing date. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of job creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of job update. |
| `experience_level` | `character varying(60)` | NULL | - | Seniority category: "Entry Level", "Mid Level", "Senior". |

---

#### 2.26. Entity: `job_applications`

- **Functional Domain:** Recruitment & Job Pipeline
- **Entity Description:** Candidate application submissions, automated skill-match scores, and formal employment offers.
- **Total Attributes:** 12 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `job_listing_id` | `bigint` | NOT NULL | **FK** &rarr; `job_listings.id` | Foreign key referencing job_listings.id. |
| `applicant_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing applicant in users.id. |
| `status` | `character varying(255)` | NOT NULL | - | Application stage: "applied", "screened", "interviewed", "offered", "hired", "rejected". |
| `match_score` | `integer` | NULL | - | Calculated algorithm skill match percentage (0 to 100%). |
| `cover_letter` | `text` | NULL | - | Candidate letter of intent text. |
| `notes` | `text` | NULL | - | Internal HR notes regarding applicant qualifications. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of application submission. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of status change. |
| `offer_details` | `json` | NULL | - | JSON structure specifying salary, start date, benefits, and position terms. |
| `offer_decision` | `character varying(20)` | NULL | - | Applicant response to job offer: "accepted", "rejected". |
| `offer_decided_at` | `timestamp without time zone` | NULL | - | Timestamp of candidate offer acceptance or rejection. |

---

#### 2.27. Entity: `interviews`

- **Functional Domain:** Recruitment & Job Pipeline
- **Entity Description:** Recruitment interview schedules, virtual meeting links, and interviewer evaluations.
- **Total Attributes:** 14 columns

| Column Name | Data Type | Nullable | Key / Constraint | Description & Business Rules |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | NOT NULL | **PK** (Primary Key) | Unique surrogate primary key. |
| `job_application_id` | `bigint` | NOT NULL | **FK** &rarr; `job_applications.id` | Foreign key referencing job_applications.id. |
| `company_user_id` | `bigint` | NOT NULL | **FK** &rarr; `users.id` | Foreign key referencing scheduling employer in users.id. |
| `type` | `character varying(255)` | NOT NULL | - | Interview round: "Technical", "HR Screening", "Final Panel". |
| `scheduled_date` | `date` | NOT NULL | - | Date of scheduled interview. |
| `scheduled_time` | `time without time zone` | NOT NULL | - | Time of scheduled interview. |
| `platform` | `character varying(255)` | NULL | - | Medium: "Google Meet", "Zoom", "On-site", "Phone". |
| `status` | `character varying(255)` | NOT NULL | - | Session status: "upcoming", "pending", "done", "cancelled". |
| `notes` | `text` | NULL | - | Preparation notes or meeting instructions for candidate. |
| `created_at` | `timestamp without time zone` | NULL | - | Timestamp of schedule creation. |
| `updated_at` | `timestamp without time zone` | NULL | - | Timestamp of schedule update. |
| `interviewer_name` | `character varying(255)` | NULL | - | Name of lead interviewer. |
| `duration` | `character varying(255)` | NULL | - | Scheduled duration (e.g. "45 minutes"). |
| `meeting_link` | `character varying(255)` | NULL | - | Virtual conferencing video URL. |

---

