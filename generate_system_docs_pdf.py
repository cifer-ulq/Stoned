import sys
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Don't draw header/footer on cover page if page 1
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#1E3A8A"))
            self.drawString(36, letter[1] - 28, "CHMSU HIREME — INTEGRATED OJT & CAREER PLACEMENT PLATFORM")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(letter[0] - 36, letter[1] - 28, "SYSTEM PROCESSES & ARCHITECTURAL FLOW SPECIFICATION")
            
            # Header Line
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, letter[1] - 32, letter[0] - 36, letter[1] - 32)
            
            # Footer Line
            self.line(36, 32, letter[0] - 36, 32)
            
            # Footer
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(36, 22, "Carlos Hilado Memorial State University (CHMSU) — Confidential Technical Reference")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 36, 22, page_text)
        else:
            # Footer on page 1
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 32, letter[0] - 36, 32)
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(36, 22, "Carlos Hilado Memorial State University — Research & Technical Specification")
            self.drawRightString(letter[0] - 36, 22, f"Page 1 of {page_count}")
            
        self.restoreState()

def build_pdf(filename="CHMSU_HireMe_System_Process_and_Flow.pdf"):
    # Page width: 612 pt, margins 36 pt -> printable width = 540 pt
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=38,
        bottomMargin=38
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#1E3A8A")    # Deep Navy
    c_secondary = colors.HexColor("#0D9488")  # Teal
    c_accent = colors.HexColor("#4F46E5")     # Indigo
    c_dark = colors.HexColor("#0F172A")       # Slate 900
    c_muted = colors.HexColor("#475569")      # Slate 600
    c_border = colors.HexColor("#CBD5E1")     # Slate 300
    c_bg_light = colors.HexColor("#F8FAFC")   # Slate 50
    c_bg_alt = colors.HexColor("#F1F5F9")     # Slate 100
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=c_muted,
        spaceAfter=10
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_dark,
        spaceAfter=4
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=c_dark
    )
    
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=c_primary
    )
    
    table_cell_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    step_title = ParagraphStyle(
        'StepTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=c_primary
    )

    step_desc = ParagraphStyle(
        'StepDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=c_muted
    )

    story = []
    
    # ══════════════════════════════════════════════════════
    # PAGE 1: TITLE, EXECUTIVE OVERVIEW, ARCHITECTURE & ROLES
    # ══════════════════════════════════════════════════════
    story.append(Paragraph("CARLOS HILADO MEMORIAL STATE UNIVERSITY", ParagraphStyle('UniTag', fontName='Helvetica-Bold', fontSize=8.5, leading=10, textColor=c_secondary, spaceAfter=2)))
    story.append(Paragraph("COLLEGE OF COMPUTER STUDIES · CENTER FOR INDUSTRY & EXTERNAL RELATIONS", ParagraphStyle('UniSub', fontName='Helvetica-Bold', fontSize=7.5, leading=9, textColor=c_muted, spaceAfter=8)))
    
    story.append(Paragraph("CHMSU HireMe: Integrated OJT &amp; Career Placement Platform", title_style))
    story.append(Paragraph("System Architecture Specification, End-to-End Operational Processes for All User Roles, and Data Flows", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=8))
    
    # Metadata Box (540 pt)
    meta_data = [
        [
            Paragraph("<b>Target Platform:</b> CHMSU HireMe System", body_style),
            Paragraph("<b>Backend API:</b> Laravel 12 (Sanctum Auth)", body_style),
            Paragraph("<b>Database:</b> PostgreSQL 16 (27 Core Tables)", body_style)
        ],
        [
            Paragraph("<b>Frontend:</b> Decoupled Vite SPAs (Vanilla JS)", body_style),
            Paragraph("<b>Security:</b> Role Middleware & Sanctum Tokens", body_style),
            Paragraph("<b>Document Scope:</b> Full System Process & Flow", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[180, 180, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 0.75, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("1. System Architectural Overview", h1_style))
    story.append(Paragraph(
        "<b>CHMSU HireMe</b> is an enterprise academic internship (OJT) monitoring and career placement platform engineered for "
        "Carlos Hilado Memorial State University. It unifies undergraduate OJT curriculum tracking, Host Training Establishment (HTE) "
        "industry partnerships, faculty supervision, and post-graduation career hiring into an automated, geofenced ecosystem.", body_style
    ))

    arch_data = [
        [Paragraph("Architecture Tier", table_cell_header), Paragraph("Technology Stack", table_cell_header), Paragraph("Functional Responsibilities & Sub-Modules", table_cell_header)],
        [
            Paragraph("<b>Client Tier</b><br/>(Frontends)", table_cell_bold),
            Paragraph("Vite, Vanilla ES6+ JS, Modular CSS, SVG", table_cell),
            Paragraph("Dedicated SPAs: <code>/landing</code> (Public), <code>/login</code> (Auth & Onboarding), <code>/main</code> (Student), <code>/company</code> (HTE), <code>/supervisors</code> (Coordinators), <code>/jobseeker</code> (Alumni), and <code>/admin</code> (Placement & CIER).", table_cell)
        ],
        [
            Paragraph("<b>Application Tier</b><br/>(REST API)", table_cell_bold),
            Paragraph("Laravel 12 API, Sanctum Token Auth, PHP 8.3+", table_cell),
            Paragraph("Centralized business controllers: Student, Company, Supervisor, Jobseeker, Admin, OJT, Evaluation, Chat, and Notification. Enforces role security, geofencing, and automated triggers.", table_cell)
        ],
        [
            Paragraph("<b>Persistence Tier</b><br/>(Database)", table_cell_bold),
            Paragraph("PostgreSQL 16 / Eloquent ORM Architecture", table_cell),
            Paragraph("27 Core tables partitioned across 7 functional domains: Authentication, Profiles, Verified Portfolio, OJT Lifecycle, Evaluations, Career Jobs, and System Communications.", table_cell)
        ],
        [
            Paragraph("<b>External Integrations</b>", table_cell_bold),
            Paragraph("HTML5 Geolocation API, Cloud Storage, SMTP", table_cell),
            Paragraph("Captures latitude/longitude for attendance check-ins; archives bilateral MOA PDF contracts; dispatches real-time appraisal notifications and email alerts.", table_cell)
        ]
    ]
    arch_table = Table(arch_data, colWidths=[90, 140, 310])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. System Actors & Operational Roles", h1_style))
    roles_data = [
        [Paragraph("User Actor", table_cell_header), Paragraph("Portal Path", table_cell_header), Paragraph("Primary Core Responsibilities in the System", table_cell_header)],
        [
            Paragraph("<b>Student / Trainee</b>", table_cell_bold),
            Paragraph("<code>/main/</code>", table_cell),
            Paragraph("Curates verified portfolio; submits pre-deployment clearance drive link; discovers OJT slots; clocks geofenced DTR attendance; tracks required hours (300/486/600 hrs); reviews appraisals; answers exit PEO survey.", table_cell)
        ],
        [
            Paragraph("<b>Company (HTE)</b>", table_cell_bold),
            Paragraph("<code>/company/</code>", table_cell),
            Paragraph("Uploads/tracks bilateral MOA with CHMSU CIER; publishes OJT slots & job openings; screens applicants; requests endorsements; schedules interviews; evaluates interns via standardized Likert rubrics.", table_cell)
        ],
        [
            Paragraph("<b>Supervisor</b><br/>(Coordinator)", table_cell_bold),
            Paragraph("<code>/supervisors/</code>", table_cell),
            Paragraph("Manages trainee rosters (CSV import); reviews pre-deployment clearance folders; issues formal academic endorsement slips; tracks students on interactive map; audits daily time logs; authors & sends rubrics.", table_cell)
        ],
        [
            Paragraph("<b>Graduate / Alumni</b><br/>(Jobseeker)", table_cell_bold),
            Paragraph("<code>/jobseeker/</code>", table_cell),
            Paragraph("Maintains professional career portfolio; updates employment state (Employed/Unemployed/Continuing Studies); applies to industry partner jobs; chats with HR; accepts job offers; participates in tracer surveys.", table_cell)
        ],
        [
            Paragraph("<b>System Admin</b><br/>(CIER & Placement)", table_cell_bold),
            Paragraph("<code>/admin/</code>", table_cell),
            Paragraph("System-wide governance; validates company accreditations and active MOA contract files; provisions faculty supervisor accounts; runs skills matching engine; promotes graduates; generates CHED accreditation reports.", table_cell)
        ]
    ]
    roles_table = Table(roles_data, colWidths=[95, 75, 370])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(roles_table)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 2: DETAILED PROCESSES (STUDENT & COMPANY)
    # ══════════════════════════════════════════════════════
    story.append(Paragraph("3. Detailed System Process for All Users", h1_style))
    story.append(Paragraph("Each user role undergoes a structured, verifiable lifecycle with explicit validation checkpoints:", body_style))

    # 3.1 Student Lifecycle
    story.append(Paragraph("3.1. Student / OJT Trainee Process Lifecycle", h2_style))
    student_steps = [
        ("Step 1: Sign-Up & Academic Onboarding", "Initiates registration at <code>/login/</code>. In onboarding wizard, inputs campus (Talisay, Fortune Towne, Alijis, Binalbagan), program (e.g. BSIT), section, batch, and official Student ID Number."),
        ("Step 2: Portfolio & Verified Credentials Builder", "Under <code>/main/#portfolio</code>, builds digital resume: educational history, technical skills (0-100 rating), work/volunteer experience, verified certificates/awards with attachments, and projects."),
        ("Step 3: Pre-Deployment Clearance Submission", "Reviews coordinator's clearance checklist (Medical, Insurance, Parent Consent, Barangay Clearance). Submits verified Google Drive folder via <code>PUT /api/student/requirements-drive</code>."),
        ("Step 4: OJT Discovery & Expression of Interest", "Explores accredited company openings in <code>/main/#ojt</code>. Submits interest via <code>POST /api/ojt/interest/{id}</code>, automatically alerting the supervisor for endorsement review."),
        ("Step 5: Supervisor Endorsement & Screening", "Supervisor validates standing & MOA, issuing an Endorsement Slip. Company reviews verified portfolio, schedules an interview, and marks student Accepted."),
        ("Step 6: Geofenced Daily Attendance Logging (DTR)", "Under <code>/main/#ojt-tracker</code>, trainee punches 'Time In' and 'Time Out'. Device GPS is validated against host company geofence coordinates; accumulates hours toward target."),
        ("Step 7: Trainee Appraisal & Exit Survey", "Upon completing required hours, employer submits student's digital evaluation rubric. Student views appraisal scores and completes exit Program Educational Objectives (PEO) Survey."),
        ("Step 8: Transition to Graduate / Jobseeker", "Upon completion of degree, the account is promoted to Graduate status, activating the career placement features.")
    ]
    for title, desc in student_steps:
        t = Table([[Paragraph(f"<b>{title}</b>", step_title)], [Paragraph(desc, step_desc)]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (0,0), 2.5, c_primary),
            ('TOPPADDING', (0,0), (-1,-1), 1.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 1.5))

    story.append(Spacer(1, 2))

    # 3.2 Company Lifecycle
    story.append(Paragraph("3.2. Host Training Establishment (HTE) / Company Process Lifecycle", h2_style))
    comp_steps = [
        ("Step 1: Self-Registration or Admin Invite", "Registers at <code>/login/</code> or accepts admin invite email. Completes company profile: industry sector, company size, physical headquarters coordinates, and HR coordinator."),
        ("Step 2: MOA Partnership Verification", "Submits Memorandum of Agreement (MOA) partnership request (<code>POST /api/company/request-moa</code>) or coordinates with CHMSU CIER to upload bilateral notarized MOA documents."),
        ("Step 3: Vacancy Management (OJT & Career Jobs)", "Publishes OJT postings (slots, course requirements, allowances, work setup) and full-time career job openings for graduating students and alumni jobseekers."),
        ("Step 4: Candidate Screening & Endorsement Check", "Reviews student portfolios; confirms supervisor endorsement; schedules screening interviews (Google Meet or On-Site) via <code>POST .../schedule-interview/{interestId}</code>."),
        ("Step 5: Trainee Deployment & Instructions", "Accepts trainee and provides onboarding guidelines: start date, reporting department, and designated mentor (<code>POST .../set-ojt-start/{interestId}</code>)."),
        ("Step 6: Digital Evaluation Rubric Submission", "Completes standardized 5-point Likert appraisal form dispatched by supervisor (<code>POST /api/company/evaluations/{id}/submit</code>) with narrative recommendations."),
        ("Step 7: Career Recruitment Pipeline", "Processes alumni job applicants across hiring stages (Reviewing, Shortlisted, Interview, Offered, Hired), extending official digital job offers.")
    ]
    for title, desc in comp_steps:
        t = Table([[Paragraph(f"<b>{title}</b>", step_title)], [Paragraph(desc, step_desc)]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (0,0), 2.5, c_secondary),
            ('TOPPADDING', (0,0), (-1,-1), 1.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 1.5))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 3: DETAILED PROCESSES (SUPERVISOR, GRADUATE, ADMIN)
    # ══════════════════════════════════════════════════════
    story.append(Paragraph("3.3. Faculty Supervisor / Academic Coordinator Process Lifecycle", h2_style))
    sup_steps = [
        ("Step 1: Portal Access & Department Scope", "Supervisor logs in at <code>/supervisors/</code>. Portal auto-filters students, companies, and postings matching their supervised academic program (e.g. BSIT)."),
        ("Step 2: Trainee Roster Management & Batch CSV Import", "Manages enrolled student lists. Can bulk-import class rosters via CSV (<code>POST /api/supervisor/students/import</code>), automatically provisioning student accounts."),
        ("Step 3: Clearance Checklist Review & Approval", "Assigns pre-deployment requirements. Audits student Google Drive submissions and marks documents Approved, Pending, or Returned for Revision."),
        ("Step 4: Academic Endorsement Issuance", "Reviews student company applications. Validates company MOA status, then generates and issues official university Endorsement Slips (<code>POST /api/supervisor/recommend/{id}</code>)."),
        ("Step 5: Geofenced Attendance Monitoring & Live Map", "In <code>/supervisors/#monitoring-map</code>, monitors active trainees across company locations. Inspects punch times, GPS coordinates, and flags abnormal logs."),
        ("Step 6: Evaluation Rubric Authoring & Dispatch", "Builds standardized 5-point Likert appraisal rubrics (<code>evaluation_templates</code>). Dispatches evaluation links individually or in batch to company mentors with reminder alerts."),
        ("Step 7: OJT Grade Calculation & Academic Clearance", "Reviews completed evaluations, verifies total rendered hours against academic requirements, and submits completed grades to university registrar.")
    ]
    for title, desc in sup_steps:
        t = Table([[Paragraph(f"<b>{title}</b>", step_title)], [Paragraph(desc, step_desc)]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (0,0), 2.5, colors.HexColor("#D97706")), # Amber
            ('TOPPADDING', (0,0), (-1,-1), 1.2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 1.2))

    story.append(Spacer(1, 2))

    # 3.4 Graduate Lifecycle
    story.append(Paragraph("3.4. Graduate / Alumni / Jobseeker Process Lifecycle", h2_style))
    grad_steps = [
        ("Step 1: Alumni Profile & Employment Status", "Logs into <code>/jobseeker/</code>. Sets graduation year, degree program, and current employment state (Employed, Unemployed, Self-Employed, Continuing Studies)."),
        ("Step 2: Career Resume & Portfolio Curation", "Maintains career resume with verified credentials, GitHub/portfolio links, certifications, and downloadable PDF resume."),
        ("Step 3: Job Discovery & Skills Matching", "Searches verified employer vacancies and external career postings. Algorithmic matching displays percentage fit with candidate competencies."),
        ("Step 4: One-Click Application & Real-Time Chat", "Applies to vacancies with one click (<code>POST /api/jobseeker/apply/{id}</code>). Engages in direct message chat with hiring HR officers."),
        ("Step 5: Interview Participation & Offer Decision", "Monitors interview appointments, attends selection rounds, and officially Accepts or Rejects offers (<code>POST /api/jobseeker/applications/{id}/accept-offer</code>)."),
        ("Step 6: Longitudinal Alumni Tracer Surveys", "Ongoing employment status updates continuously feed into institutional tracer reports for CHED and SUC Leveling.")
    ]
    for title, desc in grad_steps:
        t = Table([[Paragraph(f"<b>{title}</b>", step_title)], [Paragraph(desc, step_desc)]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (0,0), 2.5, colors.HexColor("#059669")), # Green
            ('TOPPADDING', (0,0), (-1,-1), 1.2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 1.2))

    story.append(Spacer(1, 2))

    # 3.5 Admin Lifecycle
    story.append(Paragraph("3.5. System Administrator (Placement & CIER) Process Lifecycle", h2_style))
    admin_steps = [
        ("Step 1: Institutional Governance & KPI Dashboard", "Monitors university-wide placement statistics at <code>/admin/</code>: total active OJT placements, MOA compliance rates, active job listings, and alumni employment percentages."),
        ("Step 2: HTE Partner Accreditation & MOA Contract Tracking", "Evaluates company registration applications, uploads notarized MOA PDF contracts, monitors expiration dates, and issues renewal notifications."),
        ("Step 3: Academic Master Data & Supervisor Provisioning", "Creates faculty supervisor accounts, assigns academic programs and departments, and executes bulk CSV student/alumni imports."),
        ("Step 4: Algorithmic Skills Matching Engine", "Runs the skills matching engine (<code>GET /api/admin/skills-matching</code>) comparing student skill vectors with employer job listings to identify regional curriculum gaps."),
        ("Step 5: Annual Graduate Batch Promotion", "Executes automated graduation promotion (<code>POST /api/admin/students/promote-graduates</code>) to convert graduating students to alumni jobseekers."),
        ("Step 6: Institutional Accreditation & Broadcasts", "Generates CHED accreditation reports and PEO compliance summaries; broadcasts campus-wide alerts to students and faculty.")
    ]
    for title, desc in admin_steps:
        t = Table([[Paragraph(f"<b>{title}</b>", step_title)], [Paragraph(desc, step_desc)]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (0,0), 2.5, colors.HexColor("#DC2626")), # Red
            ('TOPPADDING', (0,0), (-1,-1), 1.2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 1.2))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 4: CORE FLOWS 1 & 2 (OJT LIFECYCLE & GEOFENCED DTR)
    # ══════════════════════════════════════════════════════
    story.append(Paragraph("4. End-to-End System Flows & Operational Interactions", h1_style))
    story.append(Paragraph("The platform coordinates five core multi-party operational workflows across actors:", body_style))

    # Flow 1
    story.append(Paragraph("4.1. Core Flow 1: OJT Internship Deployment & Lifecycle Flow", h2_style))
    story.append(Paragraph("Sequential lifecycle from company accreditation to clearance, endorsement, screening, and deployment:", body_style))

    flow1_data = [
        [Paragraph("Seq", table_cell_header), Paragraph("Source", table_cell_header), Paragraph("Target", table_cell_header), Paragraph("Operation & API Endpoint", table_cell_header), Paragraph("Data State Transformation", table_cell_header)],
        [
            Paragraph("1", table_cell_bold), Paragraph("Company", table_cell), Paragraph("Admin (CIER)", table_cell),
            Paragraph("Submits company profile & requests MOA partnership.<br/><code>POST /api/company/request-moa</code>", table_cell),
            Paragraph("<code>moa_status = 'pending'</code>", table_cell)
        ],
        [
            Paragraph("2", table_cell_bold), Paragraph("Admin (CIER)", table_cell), Paragraph("Company", table_cell),
            Paragraph("Approves accreditation & uploads bilateral MOA PDF.<br/><code>POST /api/admin/companies/{id}/moa</code>", table_cell),
            Paragraph("<code>moa_status = 'active'</code>", table_cell)
        ],
        [
            Paragraph("3", table_cell_bold), Paragraph("Company", table_cell), Paragraph("Student", table_cell),
            Paragraph("Publishes OJT slot posting with target skills.<br/><code>POST /api/company/ojt-postings</code>", table_cell),
            Paragraph("New <code>ojt_postings</code> record created.", table_cell)
        ],
        [
            Paragraph("4", table_cell_bold), Paragraph("Supervisor", table_cell), Paragraph("Student", table_cell),
            Paragraph("Assigns pre-deployment clearance checklist.<br/><code>POST /api/supervisor/requirements/assign</code>", table_cell),
            Paragraph("<code>student_ojt_requirements</code> initialized.", table_cell)
        ],
        [
            Paragraph("5", table_cell_bold), Paragraph("Student", table_cell), Paragraph("Supervisor", table_cell),
            Paragraph("Submits cloud folder link for clearance verification.<br/><code>PUT /api/student/requirements-drive</code>", table_cell),
            Paragraph("Clearance status set to 'submitted'.", table_cell)
        ],
        [
            Paragraph("6", table_cell_bold), Paragraph("Supervisor", table_cell), Paragraph("Student", table_cell),
            Paragraph("Reviews documents and clears student for deployment.<br/><code>PUT /api/supervisor/requirements/{id}/review</code>", table_cell),
            Paragraph("Clearance status set to 'approved'.", table_cell)
        ],
        [
            Paragraph("7", table_cell_bold), Paragraph("Student", table_cell), Paragraph("Company", table_cell),
            Paragraph("Expresses interest in accredited OJT slot.<br/><code>POST /api/ojt/interest/{id}</code>", table_cell),
            Paragraph("<code>student_ojt_interests</code> state = 'interested'.", table_cell)
        ],
        [
            Paragraph("8", table_cell_bold), Paragraph("Company", table_cell), Paragraph("Supervisor", table_cell),
            Paragraph("Reviews student portfolio; requests official endorsement.<br/><code>POST .../request-endorsement/{interestId}</code>", table_cell),
            Paragraph("Interest status = 'endorsement_requested'.", table_cell)
        ],
        [
            Paragraph("9", table_cell_bold), Paragraph("Supervisor", table_cell), Paragraph("Company", table_cell),
            Paragraph("Issues formal academic endorsement slip.<br/><code>POST /api/supervisor/recommend/{id}</code>", table_cell),
            Paragraph("Interest status = 'endorsed'.", table_cell)
        ],
        [
            Paragraph("10", table_cell_bold), Paragraph("Company", table_cell), Paragraph("Student", table_cell),
            Paragraph("Schedules interview & marks student accepted.<br/><code>POST .../accept-after-interview/{interestId}</code>", table_cell),
            Paragraph("Interest status = 'accepted'.", table_cell)
        ],
        [
            Paragraph("11", table_cell_bold), Paragraph("Company", table_cell), Paragraph("System", table_cell),
            Paragraph("Establishes official internship commencement.<br/><code>POST .../set-ojt-start/{interestId}</code>", table_cell),
            Paragraph("Active <code>ojt_records</code> record created.", table_cell)
        ]
    ]
    f1_table = Table(flow1_data, colWidths=[20, 65, 65, 230, 160])
    f1_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(f1_table)
    story.append(Spacer(1, 8))

    # Flow 2
    story.append(Paragraph("4.2. Core Flow 2: Daily Time Record (DTR) & Geofenced Attendance Flow", h2_style))
    flow2_data = [
        [Paragraph("Step", table_cell_header), Paragraph("Actor Action", table_cell_header), Paragraph("System Process & Geofence Verification", table_cell_header), Paragraph("Resultant State", table_cell_header)],
        [
            Paragraph("1", table_cell_bold), Paragraph("Student: Clock In", table_cell),
            Paragraph("Student taps 'Time In' on mobile/web portal. HTML5 Geolocation captures latitude/longitude. Calls <code>POST /api/student/ojt-tracker/log-in</code>.", table_cell),
            Paragraph("System verifies GPS proximity to host company geofence coordinates.", table_cell)
        ],
        [
            Paragraph("2", table_cell_bold), Paragraph("API: Punch Record", table_cell),
            Paragraph("Server validates no open log exists today. Records <code>in_time</code>, <code>in_latitude</code>, <code>in_longitude</code> into <code>time_logs</code> table.", table_cell),
            Paragraph("New <code>time_logs</code> record created in active shift state.", table_cell)
        ],
        [
            Paragraph("3", table_cell_bold), Paragraph("Student: Clock Out", table_cell),
            Paragraph("At shift end, student taps 'Time Out'. Captures exit coordinates. Calls <code>POST /api/student/ojt-tracker/log-out</code>.", table_cell),
            Paragraph("Records <code>out_time</code>; computes total decimal hours rendered.", table_cell)
        ],
        [
            Paragraph("4", table_cell_bold), Paragraph("API: Hours Sync", table_cell),
            Paragraph("Calculates shift duration minus standard break. Increments <code>rendered_hours</code> in parent <code>ojt_records</code> table.", table_cell),
            Paragraph("Progress bar increments toward curriculum target (e.g. 486 hrs).", table_cell)
        ],
        [
            Paragraph("5", table_cell_bold), Paragraph("Supervisor: Audit", table_cell),
            Paragraph("Supervisor inspects live monitoring map and audits daily time logs at <code>/supervisors/#monitoring-map</code>.", table_cell),
            Paragraph("Supervisor verifies authentic attendance or flags anomalies.", table_cell)
        ]
    ]
    f2_table = Table(flow2_data, colWidths=[20, 100, 260, 160])
    f2_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(f2_table)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 5: CORE FLOWS 3, 4, 5 (EVALUATION, JOBS, ACCREDITATION)
    # ══════════════════════════════════════════════════════
    # Flow 3
    story.append(Paragraph("4.3. Core Flow 3: Trainee Performance Evaluation & Appraisal Flow", h2_style))
    flow3_data = [
        [Paragraph("Phase", table_cell_header), Paragraph("Acting Entity", table_cell_header), Paragraph("Procedure Details", table_cell_header), Paragraph("Artifact / Output", table_cell_header)],
        [
            Paragraph("1. Rubric Authoring", table_cell_bold), Paragraph("Faculty Supervisor", table_cell),
            Paragraph("Creates university evaluation templates (<code>evaluation_templates</code>) with criteria across categories (Technical Competence, Punctuality, Attitude, Teamwork) using 5-point Likert scales.", table_cell),
            Paragraph("Standardized institutional evaluation template.", table_cell)
        ],
        [
            Paragraph("2. Dispatch Appraisal", table_cell_bold), Paragraph("Faculty Supervisor", table_cell),
            Paragraph("Dispatches evaluation requests to company mentors (<code>POST /api/supervisor/evaluations/send/{student_id}</code> or batch). Triggers automated notification to employer HR.", table_cell),
            Paragraph("<code>student_evaluations</code> record initialized (<code>status = 'pending'</code>).", table_cell)
        ],
        [
            Paragraph("3. Appraisal Submission", table_cell_bold), Paragraph("Company Mentor", table_cell),
            Paragraph("Mentor opens digital form (<code>/company/#evaluations</code>), assigns 1–5 ratings to criteria, and inputs narrative feedback and strengths/recommendations.", table_cell),
            Paragraph("<code>student_evaluation_answers</code> populated; evaluation marked <code>'completed'</code>.", table_cell)
        ],
        [
            Paragraph("4. Grade Computation", table_cell_bold), Paragraph("Faculty Supervisor", table_cell),
            Paragraph("Coordinator reviews aggregated overall rating score (e.g. 4.85/5.00), factors in attendance percentage, and generates final academic grade.", table_cell),
            Paragraph("Final numerical OJT grade recorded in academic ledger.", table_cell)
        ],
        [
            Paragraph("5. Feedback & PEO Survey", table_cell_bold), Paragraph("Student Trainee", table_cell),
            Paragraph("Trainee views completed appraisal report and completes the institutional Program Educational Objectives (PEO) Survey.", table_cell),
            Paragraph("Closed OJT record; student cleared for graduation.", table_cell)
        ]
    ]
    f3_table = Table(flow3_data, colWidths=[90, 85, 230, 135])
    f3_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_accent),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(f3_table)
    story.append(Spacer(1, 8))

    # Flow 4
    story.append(Paragraph("4.4. Core Flow 4: Graduate Career Recruitment & Hiring Pipeline", h2_style))
    flow4_data = [
        [Paragraph("Stage", table_cell_header), Paragraph("Actor Action", table_cell_header), Paragraph("Platform Mechanism & API Endpoint", table_cell_header), Paragraph("Pipeline State", table_cell_header)],
        [
            Paragraph("1. Vacancy Posting", table_cell_bold), Paragraph("Company", table_cell),
            Paragraph("Publishes job listing specifying required competencies, salary range, and job level.<br/><code>POST /api/company/jobs</code>", table_cell),
            Paragraph("Active <code>job_listings</code> opening published.", table_cell)
        ],
        [
            Paragraph("2. Candidate Application", table_cell_bold), Paragraph("Jobseeker / Alumni", table_cell),
            Paragraph("Applies using verified digital profile and portfolio link.<br/><code>POST /api/jobseeker/apply/{jobId}</code>", table_cell),
            Paragraph("<code>job_applications</code> status = <code>'applied'</code>.", table_cell)
        ],
        [
            Paragraph("3. Screening & Chat", table_cell_bold), Paragraph("Company & Candidate", table_cell),
            Paragraph("HR reviews application and begins direct message thread.<br/><code>POST /api/chat/{key}/messages</code>", table_cell),
            Paragraph("<code>job_applications</code> status = <code>'reviewing'</code>.", table_cell)
        ],
        [
            Paragraph("4. Interview Scheduling", table_cell_bold), Paragraph("Company", table_cell),
            Paragraph("Schedules interview with date, time, and meeting link.<br/><code>POST /api/company/applications/{id}/interview</code>", table_cell),
            Paragraph("New <code>interviews</code> appointment record created.", table_cell)
        ],
        [
            Paragraph("5. Offer & Placement", table_cell_bold), Paragraph("Company & Candidate", table_cell),
            Paragraph("Company issues official offer. Candidate accepts or rejects.<br/><code>POST /api/jobseeker/applications/{id}/accept-offer</code>", table_cell),
            Paragraph("Status updated to <code>'hired'</code>; alumni employment record updated.", table_cell)
        ]
    ]
    f4_table = Table(flow4_data, colWidths=[90, 85, 230, 135])
    f4_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0D9488")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(f4_table)
    story.append(Spacer(1, 8))

    # Flow 5
    story.append(Paragraph("4.5. Core Flow 5: Institutional Accreditation, MOA & Alumni Tracer Flow", h2_style))
    flow5_data = [
        [Paragraph("Accreditation Area", table_cell_header), Paragraph("System Function & Execution", table_cell_header), Paragraph("Regulatory / Academic Output", table_cell_header)],
        [
            Paragraph("<b>MOA Legality & Safety</b>", table_cell_bold),
            Paragraph("CIER Admin validates company legal standing, uploads notarized MOA PDF contracts, and tracks validity expiration dates to ensure all active trainee placements comply with CHED Memorandum Order No. 104.", table_cell),
            Paragraph("CHED MOA Compliance Audit Ledger & Active Industry Partners Directory.", table_cell)
        ],
        [
            Paragraph("<b>Skills Gap Analytics</b>", table_cell_bold),
            Paragraph("Admin skills matching algorithms analyze student competency vectors against industry job requirements to detect curriculum deficiencies.", table_cell),
            Paragraph("Curriculum Enhancement Recommendations for College Academic Council.", table_cell)
        ],
        [
            Paragraph("<b>Longitudinal Tracer</b>", table_cell_bold),
            Paragraph("Platform tracks employment trajectories of graduates across graduation batches, capturing employment status, industry alignment, and job acquisition timelines.", table_cell),
            Paragraph("Annual SUC Leveling, CHED Institutional Sustainability Assessment (ISA) Tracer Report.", table_cell)
        ],
        [
            Paragraph("<b>PEO Survey Analysis</b>", table_cell_bold),
            Paragraph("Aggregates exit and alumni surveys assessing Program Educational Objectives and Student Outcomes.", table_cell),
            Paragraph("Accreditation Commission (AACCUP) Compliance Exhibits.", table_cell)
        ]
    ]
    f5_table = Table(flow5_data, colWidths=[105, 275, 160])
    f5_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(f5_table)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 6: DATABASE ARCHITECTURE & ENTITY MAPPING
    # ══════════════════════════════════════════════════════
    story.append(Paragraph("5. Database Architecture & Entity Relational Mapping", h1_style))
    story.append(Paragraph("The relational database schema is structured into 27 core application tables across seven operational domains:", body_style))

    db_data = [
        [Paragraph("Domain", table_cell_header), Paragraph("Entity Table Name", table_cell_header), Paragraph("Architectural Purpose, Foreign Keys & Business Rules", table_cell_header)],
        [
            Paragraph("<b>Authentication</b><br/>(<code>auth</code>)", table_cell_bold),
            Paragraph("<code>users</code><br/><code>personal_access_tokens</code>", table_cell),
            Paragraph("Central identity table containing user login credentials, Bcrypt-hashed password, primary role flag (student, company, supervisor, graduate, jobseeker, admin), and onboarding status.", table_cell)
        ],
        [
            Paragraph("<b>Actor Profiles</b><br/>(<code>profile</code>)", table_cell_bold),
            Paragraph("<code>student_profiles</code><br/><code>company_profiles</code><br/><code>supervisor_profiles</code><br/><code>graduate_profiles</code>", table_cell),
            Paragraph("Role-specific metadata tables linked 1:1 to <code>users.id</code>. Houses university student IDs, campus branches, degrees, company MOA validity states/dates, department allocations, and alumni employment statuses.", table_cell)
        ],
        [
            Paragraph("<b>Portfolio</b><br/>(<code>portfolio</code>)", table_cell_bold),
            Paragraph("<code>student_education</code><br/><code>student_skills</code><br/><code>student_experiences</code><br/><code>student_achievements</code><br/><code>portfolio_projects</code>", table_cell),
            Paragraph("Verified digital resume entities: academic history, competency skill ratings (0-100), prior work/internship experiences, certificates/awards with attachments, and showcase portfolio projects.", table_cell)
        ],
        [
            Paragraph("<b>OJT Lifecycle</b><br/>(<code>ojt</code>)", table_cell_bold),
            Paragraph("<code>ojt_postings</code><br/><code>student_ojt_interests</code><br/><code>student_ojt_requirements</code><br/><code>ojt_records</code><br/><code>time_logs</code>", table_cell),
            Paragraph("Internship management: openings posted by HTEs, application interest records, pre-deployment clearance checklists, active training contracts, and geofenced daily attendance punch logs.", table_cell)
        ],
        [
            Paragraph("<b>Evaluation</b><br/>(<code>eval</code>)", table_cell_bold),
            Paragraph("<code>evaluation_templates</code><br/><code>evaluation_questions</code><br/><code>student_evaluations</code><br/><code>student_evaluation_answers</code>", table_cell),
            Paragraph("Performance evaluation rubrics: standardized templates created by faculty, question criteria, employer appraisal instances, and itemized 5-point Likert question scores.", table_cell)
        ],
        [
            Paragraph("<b>Career Jobs</b><br/>(<code>job</code>)", table_cell_bold),
            Paragraph("<code>job_listings</code><br/><code>job_applications</code><br/><code>interviews</code>", table_cell),
            Paragraph("Graduate career recruitment: company job openings, alumni applications, interview appointments, and formal job offers.", table_cell)
        ],
        [
            Paragraph("<b>Communication</b><br/>(<code>comm</code>)", table_cell_bold),
            Paragraph("<code>chat_messages</code><br/><code>app_notifications</code>", table_cell),
            Paragraph("Direct bidirectional chat threads between candidates and employers; automated event notifications and campus-wide broadcast announcements.", table_cell)
        ]
    ]
    db_table = Table(db_data, colWidths=[85, 135, 320])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(db_table)
    story.append(Spacer(1, 12))

    # Institutional Signoff Box
    signoff_data = [
        [
            Paragraph("<b>Document Author:</b> CHMSU Technical Development & Architecture Team", table_cell),
            Paragraph("<b>Classification:</b> Academic Technical Documentation & Research Specification", table_cell)
        ],
        [
            Paragraph("<b>Institution:</b> Carlos Hilado Memorial State University (CHMSU)", table_cell),
            Paragraph("<b>Platform Status:</b> Active Architecture Verified · Production Ready", table_cell)
        ]
    ]
    signoff_table = Table(signoff_data, colWidths=[270, 270])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 1, c_secondary),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(signoff_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == '__main__':
    target = os.path.join(os.getcwd(), "CHMSU_HireMe_System_Process_and_Flow.pdf")
    build_pdf(target)
