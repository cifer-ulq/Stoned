# CHMSU HireMe — Minimal Data Dictionary (12 Core Entities)

> **Purpose:** Concise Data Dictionary for Research Paper & Thesis Documentation  
> **System:** CHMSU HireMe Integrated OJT & Placement Platform  
> **Scope:** Exactly 12 Core Entities, Essential Attributes, Crow's Foot ERD Matching  

---

### 1. Entity: `User`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for User. |
| `name` | `var` | - | Name attribute for User. |
| `email` | `var` | - | Email attribute for User. |
| `password` | `var` | - | Password attribute for User. |
| `role` | `var` | - | Role attribute for User. |
| `onboarding_completed` | `bool` | - | Onboarding completed attribute for User. |
| `avatar_url` | `var` | - | Avatar url attribute for User. |

---

### 2. Entity: `CompanyProfile`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for CompanyProfile. |
| `user_id` | `int` | **FK** | User id attribute for CompanyProfile. |
| `company_name` | `var` | - | Company name attribute for CompanyProfile. |
| `company_type` | `var` | - | Company type attribute for CompanyProfile. |
| `company_size` | `var` | - | Company size attribute for CompanyProfile. |
| `contact_email` | `var` | - | Contact email attribute for CompanyProfile. |
| `moa_status` | `var` | - | Moa status attribute for CompanyProfile. |
| `moa_file_path` | `var` | - | Moa file path attribute for CompanyProfile. |
| `moa_start_date` | `date` | - | Moa start date attribute for CompanyProfile. |
| `moa_end_date` | `date` | - | Moa end date attribute for CompanyProfile. |

---

### 3. Entity: `GraduateProfile`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for GraduateProfile. |
| `user_id` | `int` | **FK** | User id attribute for GraduateProfile. |
| `year_graduated` | `int` | - | Year graduated attribute for GraduateProfile. |
| `campus` | `var` | - | Campus attribute for GraduateProfile. |
| `course` | `var` | - | Course attribute for GraduateProfile. |
| `section` | `var` | - | Section attribute for GraduateProfile. |
| `employment_status` | `var` | - | Employment status attribute for GraduateProfile. |

---

### 4. Entity: `SupervisorProfile`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for SupervisorProfile. |
| `user_id` | `int` | **FK** | User id attribute for SupervisorProfile. |
| `company_name` | `var` | - | Company name attribute for SupervisorProfile. |
| `position` | `var` | - | Position attribute for SupervisorProfile. |
| `course` | `var` | - | Course attribute for SupervisorProfile. |

---

### 5. Entity: `StudentProfile`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for StudentProfile. |
| `user_id` | `int` | **FK** | User id attribute for StudentProfile. |
| `student_id` | `var` | - | Student id attribute for StudentProfile. |
| `school` | `var` | - | School attribute for StudentProfile. |
| `campus` | `var` | - | Campus attribute for StudentProfile. |
| `program` | `var` | - | Program attribute for StudentProfile. |
| `year_level` | `var` | - | Year level attribute for StudentProfile. |
| `headline` | `var` | - | Headline attribute for StudentProfile. |
| `bio` | `text` | - | Bio attribute for StudentProfile. |
| `status` | `var` | - | Status attribute for StudentProfile. |

---

### 6. Entity: `OjtPosting`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for OjtPosting. |
| `company_user_id` | `int` | **FK** | Company user id attribute for OjtPosting. |
| `title` | `var` | - | Title attribute for OjtPosting. |
| `department` | `var` | - | Department attribute for OjtPosting. |
| `location` | `var` | - | Location attribute for OjtPosting. |
| `slots_total` | `int` | - | Slots total attribute for OjtPosting. |
| `slots_remaining` | `int` | - | Slots remaining attribute for OjtPosting. |
| `status` | `var` | - | Status attribute for OjtPosting. |

---

### 7. Entity: `StudentOjtInterest`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for StudentOjtInterest. |
| `student_user_id` | `int` | **FK** | Student user id attribute for StudentOjtInterest. |
| `ojt_posting_id` | `int` | **FK** | Ojt posting id attribute for StudentOjtInterest. |
| `status` | `var` | - | Status attribute for StudentOjtInterest. |
| `endorsed_by` | `int` | **FK** | Endorsed by attribute for StudentOjtInterest. |

---

### 8. Entity: `JobListing`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for JobListing. |
| `company_user_id` | `int` | **FK** | Company user id attribute for JobListing. |
| `title` | `var` | - | Title attribute for JobListing. |
| `department` | `var` | - | Department attribute for JobListing. |
| `location` | `var` | - | Location attribute for JobListing. |
| `employment_type` | `var` | - | Employment type attribute for JobListing. |
| `salary_range` | `var` | - | Salary range attribute for JobListing. |
| `status` | `var` | - | Status attribute for JobListing. |

---

### 9. Entity: `JobApplication`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for JobApplication. |
| `job_listing_id` | `int` | **FK** | Job listing id attribute for JobApplication. |
| `applicant_user_id` | `int` | **FK** | Applicant user id attribute for JobApplication. |
| `status` | `var` | - | Status attribute for JobApplication. |
| `match_score` | `flo` | - | Match score attribute for JobApplication. |
| `cover_letter` | `text` | - | Cover letter attribute for JobApplication. |
| `offer_decision` | `var` | - | Offer decision attribute for JobApplication. |

---

### 10. Entity: `Interview`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for Interview. |
| `job_application_id` | `int` | **FK** | Job application id attribute for Interview. |
| `company_user_id` | `int` | **FK** | Company user id attribute for Interview. |
| `type` | `var` | - | Type attribute for Interview. |
| `scheduled_date` | `date` | - | Scheduled date attribute for Interview. |
| `platform` | `var` | - | Platform attribute for Interview. |
| `status` | `var` | - | Status attribute for Interview. |

---

### 11. Entity: `OjtRecord`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for OjtRecord. |
| `user_id` | `int` | **FK** | User id attribute for OjtRecord. |
| `company_name` | `var` | - | Company name attribute for OjtRecord. |
| `required_hours` | `int` | - | Required hours attribute for OjtRecord. |
| `completed_hours` | `flo` | - | Completed hours attribute for OjtRecord. |
| `status` | `var` | - | Status attribute for OjtRecord. |

---

### 12. Entity: `TimeLog`

| Attribute | Type | Key | Description |
| :--- | :---: | :---: | :--- |
| `id` | `int` | **PK** | Id attribute for TimeLog. |
| `user_id` | `int` | **FK** | User id attribute for TimeLog. |
| `ojt_record_id` | `int` | **FK** | Ojt record id attribute for TimeLog. |
| `log_date` | `date` | - | Log date attribute for TimeLog. |
| `time_in` | `tin` | - | Time in attribute for TimeLog. |
| `time_out` | `tin` | - | Time out attribute for TimeLog. |
| `hours_rendered` | `flo` | - | Hours rendered attribute for TimeLog. |

---

