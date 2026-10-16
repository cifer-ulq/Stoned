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