import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

IMG_DIR = os.path.join(os.getcwd(), 'screenshots_live_v2')
OUTPUT_FILES = [
    os.path.join(os.getcwd(), 'CHMSU_HireMe_Comprehensive_User_Manual.docx'),
    os.path.join(os.getcwd(), 'CHMSU_HireMe_User_Manual.docx')
]

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_bg(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_callout(doc, title, text, callout_type="NOTE"):
    colors = {
        "NOTE": {"bg": "F0FDF4", "border": "005930", "title": "005930", "icon": "i"},
        "IMPORTANT": {"bg": "EFF6FF", "border": "1D4ED8", "title": "1D4ED8", "icon": "!"},
        "WARNING": {"bg": "FFFBEB", "border": "B45309", "title": "B45309", "icon": "!"},
    }
    cfg = colors.get(callout_type, colors["NOTE"])
    
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    
    set_cell_bg(cell, cfg["bg"])
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{cfg['border']}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    run_t = p.add_run(f"[{cfg['icon']}]  {title.upper()}")
    run_t.bold = True
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(9.5)
    run_t.font.color.rgb = RGBColor.from_string(cfg["title"])
    
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.15
    run_b = p2.add_run(text)
    run_b.font.name = "Calibri"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(6)

def add_figure(doc, img_name, fig_num, caption_text):
    img_path = os.path.join(IMG_DIR, img_name)
    if not os.path.exists(img_path):
        print(f"WARNING: Image not found: {img_path}")
        return

    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(4)
    p_img.paragraph_format.keep_with_next = True
    
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=Inches(6.2))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(14)
    
    run_lbl = p_cap.add_run(f"Figure {fig_num}: ")
    run_lbl.bold = True
    run_lbl.font.name = "Calibri"
    run_lbl.font.size = Pt(10)
    run_lbl.font.color.rgb = RGBColor(0x00, 0x59, 0x30)
    
    run_txt = p_cap.add_run(caption_text)
    run_txt.italic = True
    run_txt.font.name = "Calibri"
    run_txt.font.size = Pt(10)
    run_txt.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

def build_document():
    doc = Document()
    
    # Page setup (Letter, 1-inch margins)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(6)

    # =========================================================================
    # 1. COVER PAGE
    # =========================================================================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(36)
    p_inst.paragraph_format.space_after = Pt(4)
    run = p_inst.add_run("CARLOS HILADO MEMORIAL STATE UNIVERSITY")
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(0x00, 0x59, 0x30)
    
    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(0)
    p_dept.paragraph_format.space_after = Pt(40)
    run = p_dept.add_run("Center for Internationalization and External Relations (CIER)\nCollege of Computer Studies")
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(40)
    p_title.paragraph_format.space_after = Pt(10)
    run = p_title.add_run("CHMSU HireMe")
    run.bold = True
    run.font.size = Pt(32)
    run.font.color.rgb = RGBColor(0x00, 0x59, 0x30)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(20)
    run = p_sub.add_run("Comprehensive User Manual & System Guide")
    run.font.size = Pt(16)
    run.bold = True
    run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_before = Pt(0)
    p_desc.paragraph_format.space_after = Pt(60)
    run = p_desc.add_run("Standard Operating Manual for Students, Corporate Partners, Faculty Coordinators, Alumni Jobseekers, and CIER Administrators")
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_before = Pt(80)
    p_meta.paragraph_format.space_after = Pt(0)
    run = p_meta.add_run("Production Live System: https://chmsu-hireme.vercel.app\nAcademic Year 2025–2026 | Document Release: November 2026")
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x9C, 0xA3, 0xAF)

    doc.add_page_break()

    # =========================================================================
    # 2. TABLE OF CONTENTS
    # =========================================================================
    h_toc = doc.add_heading("Table of Contents", level=1)
    h_toc.paragraph_format.space_after = Pt(12)
    
    toc_items = [
        ("Introduction", "3"),
        ("Section 0: Public Access, Registration & Account Setup", "4"),
        ("  0.1 Navigating the Public Landing Page", "4"),
        ("  0.2 Student & Graduate Self-Registration", "5"),
        ("  0.3 Academic Role Onboarding", "5"),
        ("  0.4 Corporate Partner Registration & Admin Gateway", "6"),
        ("Section 1: Student / OJT Trainee Portal Operations", "7"),
        ("  1.1 Authentication & Compliance Gate", "7"),
        ("  1.2 Student Dashboard & Practicum Hours Progress", "8"),
        ("  1.3 Portfolio & Profile Builder", "9"),
        ("  1.4 Exploring Verified OJT Opportunities", "10"),
        ("  1.5 Accredited Partner Directory", "11"),
        ("  1.6 Application Pipeline Tracking", "12"),
        ("  1.7 OJT Placement Hub", "13"),
        ("  1.8 Daily Time Record (DTR) & Attendance Tracker", "14"),
        ("  1.9 Interview Hub & Meeting Access", "15"),
        ("  1.10 Secure Student Sign Out", "16"),
        ("Section 2: Employer / Company Partner Portal Operations", "17"),
        ("  2.1 Corporate Authentication & Dashboard Telemetry", "17"),
        ("  2.2 Company Branding & Geofence Coordinates", "18"),
        ("  2.3 OJT Practicum Slot Allocation", "19"),
        ("  2.4 Career Job Listings Manager", "20"),
        ("  2.5 3-Step Job Creation Studio", "21"),
        ("  2.6 Candidate Screening & Pipeline Kanban", "22"),
        ("  2.7 Candidate Interview Management", "23"),
        ("  2.8 Trainee Roster & Practicum Oversight", "24"),
        ("  2.9 Alumni Employee Roster", "25"),
        ("  2.10 Recruitment Velocity & Analytics", "26"),
        ("  2.11 Secure Corporate Sign Out", "27"),
        ("Section 3: Faculty OJT Supervisor Portal Operations", "28"),
        ("  3.1 Faculty Authentication & Portal Entry", "28"),
        ("  3.2 Cohort Oversight Metrics Dashboard", "29"),
        ("  3.3 Trainees Cohort Directory & Batch Import", "30"),
        ("  3.4 Placement Endorsement Queue", "31"),
        ("  3.5 GIS Workplace Deployment Monitoring Map", "32"),
        ("  3.6 Competency Rubrics & Evaluations Studio", "33"),
        ("  3.7 Cohort Analytics & Attendance Ledger", "34"),
        ("  3.8 Secure Supervisor Sign Out", "35"),
        ("Section 4: Graduate / Alumni (Jobseeker) Portal Operations", "36"),
        ("  4.1 Alumni Authentication & Career Dashboard", "36"),
        ("  4.2 Career Portfolio & ATS Resume Showcase", "37"),
        ("  4.3 Algorithmic Job Matches & Search", "38"),
        ("  4.4 Multi-Stage Job Application Tracker", "39"),
        ("  4.5 Corporate Interview Calendar", "40"),
        ("  4.6 Employer Partner Network", "41"),
        ("  4.7 Secure Alumni Sign Out", "42"),
        ("Section 5: System Administrator / CIER Placement Office", "43"),
        ("  5.1 Dedicated Administrator Gateway", "43"),
        ("  5.2 Institutional Master Dashboard", "44"),
        ("  5.3 Student Cohort Management & Dual-Gate Promotion", "45"),
        ("  5.4 Industry Partner Accreditation & MOA Approval", "46"),
        ("  5.5 OJT Program Governance & Supervisor Allocation", "47"),
        ("  5.6 Institutional Vacancy Moderation", "48"),
        ("  5.7 Skill Matching Engine Matrix", "49"),
        ("  5.8 Alumni Tracer & 3-Pillar PEO Reports", "50"),
        ("  5.9 System Parameters & Configuration", "51"),
        ("  5.10 Secure Administrator Sign Out", "52"),
        ("Section 6: Issues Found & QA Technical Observations", "53"),
    ]
    
    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_toc, color="E5E7EB", sz="4", val="single")
    for idx, (title, page) in enumerate(toc_items):
        r = t_toc.rows[idx]
        c0, c1 = r.cells[0], r.cells[1]
        c0.width = Inches(5.8)
        c1.width = Inches(0.7)
        set_cell_margins(c0, top=40, bottom=40, left=60, right=60)
        set_cell_margins(c1, top=40, bottom=40, left=60, right=60)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(title)
        if not title.startswith("  "):
            r0.bold = True
            r0.font.color.rgb = RGBColor(0x00, 0x59, 0x30)
        else:
            r0.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        r0.font.size = Pt(9.5)
        
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(page)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

    doc.add_page_break()

    # =========================================================================
    # 3. INTRODUCTION
    # =========================================================================
    doc.add_heading("Introduction", level=1)
    doc.add_paragraph(
        "CHMSU HireMe is an integrated, web-based career placement and On-the-Job Training (OJT) practicum governance platform built specifically for Carlos Hilado Memorial State University (CHMSU). "
        "The system standardizes practicum compliance pursuant to Republic Act 10173 (Data Privacy Act of 2012) and CHED CMO No. 104, Series of 2017, seamlessly bridging academia with corporate industry partners across Negros Occidental. "
        "The platform natively accommodates five user roles: Trainee Students, Corporate Employers, Faculty Coordinators, Alumni Jobseekers, and CIER Placement Administrators."
    )

    add_callout(
        doc,
        "Operational Standard Notice",
        "This user manual documents live operating procedures on the production system (https://chmsu-hireme.vercel.app). All procedures are illustrated with authentic live screenshots captured in pure light mode with institutional focus highlights.",
        "NOTE"
    )

    doc.add_page_break()

    # =========================================================================
    # SECTION 0: PUBLIC ACCESS & AUTHENTICATION
    # =========================================================================
    doc.add_heading("Section 0: Public Access, Registration & Account Setup", level=1)
    
    doc.add_heading("0.1 Navigating the Public Landing Page", level=2)
    doc.add_paragraph(
        "Visitors arriving at the root URL (https://chmsu-hireme.vercel.app/) are automatically routed to the public landing page (/landing/). "
        "The landing page provides an overview of platform capabilities, institutional stakeholder benefits, and one-click entry buttons into registration and authentication gateways."
    )
    add_figure(doc, "Public_01_LandingPage.png", "0.1", "CHMSU HireMe public landing page")
    doc.add_paragraph(
        "Scrolling down the landing page reveals dedicated stakeholder portals tailored for enrolled students, corporate employers, and academic supervisors."
    )
    add_figure(doc, "Public_02_LandingRoles.png", "0.2", "Explore platform user roles and pathways")

    doc.add_heading("0.2 Student & Graduate Self-Registration", level=2)
    doc.add_paragraph(
        "Prospective student trainees and university alumni initiate account creation by clicking 'Get Started Free' or navigating to /login/?view=signup. "
        "The registration form collects full name, institutional email address, secure password, and mandatory agreement to the institutional Terms of Service and Data Privacy Policy."
    )
    add_figure(doc, "Public_03_RegisterForm.png", "0.3", "Student self-registration entry form")

    doc.add_heading("0.3 Academic Role Onboarding", level=2)
    doc.add_paragraph(
        "Upon submitting initial credentials, the user is directed to the Onboarding Studio (/login/onboarding.html). "
        "The user selects between 'Student' (seeking practicum OJT placement) and 'CHMSU Graduate / Alumni' (seeking professional employment), followed by academic program and campus enrollment verification."
    )
    add_figure(doc, "Public_04_OnboardingRole.png", "0.4", "Select academic role onboarding")

    doc.add_heading("0.4 Corporate Partner Registration & Admin Gateway", level=2)
    doc.add_paragraph(
        "Host training establishments register via /login/?view=company-signup. "
        "The registration requires company legal name, industry category, official contact person, email, and password. "
        "Submitted accounts enter 'Pending Review' status until the CIER placement office reviews and approves the corporate Memorandum of Agreement (MOA)."
    )
    add_figure(doc, "Public_05_CompanySignup.png", "0.5", "Accredited company partner registration")
    
    doc.add_paragraph(
        "Users experiencing sign-in difficulties can trigger automated password reset links via /login/?view=forgot."
    )
    add_figure(doc, "Public_06_ForgotPassword.png", "0.6", "Account password recovery form")

    doc.add_paragraph(
        "System administrators access the central university governance console through a dedicated security gateway at /login/admin-login."
    )
    add_figure(doc, "Public_07_AdminLogin.png", "0.7", "Dedicated administrator login portal")

    doc.add_page_break()

    # =========================================================================
    # SECTION 1: STUDENT / OJT TRAINEE PORTAL
    # =========================================================================
    doc.add_heading("Section 1: Student / OJT Trainee Portal Operations", level=1)
    
    doc.add_heading("1.1 Authentication & Compliance Gate", level=2)
    doc.add_paragraph(
        "Enrolled student trainees sign in through the unified portal at /login/ using their institutional credentials (e.g. dave.salvador.bsit4b@chmsu.edu.ph). "
        "Upon initial login, students review and accept the institutional Data Privacy & SIPP Compliance Agreement pursuant to Republic Act 10173."
    )
    add_figure(doc, "Student_01_SignIn.png", "1.1", "Enter student credentials to sign in")

    doc.add_heading("1.2 Student Dashboard & Practicum Hours Progress", level=2)
    doc.add_paragraph(
        "Upon successful authentication, students land directly on the Student Dashboard (/main/#/). "
        "The dashboard presents real-time telemetry: cumulative rendered OJT hours toward the institutional requirement (e.g. 0.00 / 600 Hours), active application tallies, upcoming interviews, and recent activity streams."
    )
    add_figure(doc, "Student_02_Dashboard.png", "1.2", "Student portal overview dashboard")

    doc.add_heading("1.3 Portfolio & Profile Builder", level=2)
    doc.add_paragraph(
        "Selecting 'My Portfolio' (/main/#/portfolio) allows trainees to curate their professional identity. "
        "Students can document technical skills, programming languages, academic achievements, project repositories, and update their profile details."
    )
    add_figure(doc, "Student_03_PortfolioOverview.png", "1.3", "View student professional profile")

    doc.add_heading("1.4 Exploring Verified OJT Opportunities", level=2)
    doc.add_paragraph(
        "Under 'Job Match' (/main/#/jobs), an AI matching algorithm evaluates student proficiencies against active partner vacancies. "
        "Compatibility scores highlight openings aligning with the student's curriculum and career interests."
    )
    add_figure(doc, "Student_04_JobMatches.png", "1.4", "Browse verified internship opportunities")

    doc.add_heading("1.5 Accredited Partner Directory", level=2)
    doc.add_paragraph(
        "The 'Companies' directory (/main/#/companies) catalogs all verified corporate hosts. "
        "Trainees can inspect active MOA validity, physical workstation locations, and browse all open slots hosted by each company."
    )
    add_figure(doc, "Student_05_CompaniesDirectory.png", "1.5", "Explore corporate partner network")

    doc.add_heading("1.6 Application Pipeline Tracking", level=2)
    doc.add_paragraph(
        "Students monitor submitted applications in real time through 'My Applications' (/main/#/applications). "
        "Stages advance transparently from 'Applied' to 'Under Review / Endorsed', 'Interview', and 'Offered'."
    )
    add_figure(doc, "Student_06_ApplicationsPipeline.png", "1.6", "Track application review progression")

    doc.add_heading("1.7 OJT Placement Hub", level=2)
    doc.add_paragraph(
        "The 'OJT List' tab (/main/#/ojt) showcases vetted practicum slots specifically recommended by academic coordinators, allowing students to initiate placement requests."
    )
    add_figure(doc, "Student_07_OjtList.png", "1.7", "Recommended host placement slots")

    doc.add_heading("1.8 Daily Time Record (DTR) & Attendance Tracker", level=2)
    doc.add_paragraph(
        "Once officially deployed to a host company, the 'OJT Tracker' (/main/#/ojt-tracker) serves as the student's daily attendance console. "
        "Students log attendance via morning and afternoon time entries: Morning Time In, Morning Time Out (12:00 PM), Afternoon Time In (1:00 PM), and Afternoon Time Out. "
        "The system captures GPS coordinates to verify that attendance check-ins occur strictly within the authorized host establishment geofence boundary."
    )
    add_figure(doc, "Student_08_OjtTracker.png", "1.8", "Log daily attendance and hours")

    doc.add_heading("1.9 Interview Hub & Meeting Access", level=2)
    doc.add_paragraph(
        "The 'Interviews' module (/main/#/interview) integrates interview calendars, recruiter instructions, and direct Google Meet join links for remote candidate evaluations."
    )
    add_figure(doc, "Student_09_InterviewsHub.png", "1.9", "Attend scheduled recruiter interviews")

    doc.add_heading("1.10 Secure Student Sign Out", level=2)
    doc.add_paragraph(
        "Students terminate their session securely by clicking their profile avatar in the navigation bar and selecting 'Sign Out', destroying local tokens."
    )
    add_figure(doc, "Student_10_SignOut.png", "1.10", "Secure student sign out action")

    doc.add_page_break()

    # =========================================================================
    # SECTION 2: EMPLOYER / COMPANY PARTNER PORTAL
    # =========================================================================
    doc.add_heading("Section 2: Employer / Company Partner Portal Operations", level=1)
    
    doc.add_heading("2.1 Corporate Authentication & Dashboard Telemetry", level=2)
    doc.add_paragraph(
        "Corporate recruiters log in at /login/ using registered credentials (e.g. hr@naahcompany.com). "
        "The Company Dashboard (/company/#/) presents recruitment velocity KPIs: active job openings, applicant volume, scheduled interviews, and monthly placement counts."
    )
    add_figure(doc, "Company_01_SignIn.png", "2.1", "Corporate partner portal sign in")
    add_figure(doc, "Company_02_Dashboard.png", "2.2", "Executive hiring dashboard telemetry")

    doc.add_heading("2.2 Company Branding & Geofence Coordinates", level=2)
    doc.add_paragraph(
        "Under 'Company Profile' (/company/#/profile), employers verify corporate branding, active MOA accreditation badges, contact details, and establish workplace GPS coordinates to enforce trainee attendance geofences."
    )
    add_figure(doc, "Company_03_ProfileSetup.png", "2.3", "Verify MOA status and geofencing")

    doc.add_heading("2.3 OJT Practicum Slot Allocation", level=2)
    doc.add_paragraph(
        "The 'OJT Slots' page (/company/#/ojt-slots) allows employers to post and manage intern vacancies, specify student major requirements, and allocate trainee quotas."
    )
    add_figure(doc, "Company_04_OjtSlots.png", "2.4", "Manage internship slot allocations")

    doc.add_heading("2.4 Career Job Listings Manager", level=2)
    doc.add_paragraph(
        "Through 'Job Postings' (/company/#/jobs), recruiters oversee full-time career positions targeting university graduates, monitoring status across Active, Draft, and Closed postings."
    )
    add_figure(doc, "Company_05_JobListings.png", "2.5", "Corporate job listings management")

    doc.add_heading("2.5 3-Step Job Creation Studio", level=2)
    doc.add_paragraph(
        "Clicking 'Post New Job' launches a 3-step studio (/company/#/post-job): Step 1 captures basic role data and department; Step 2 configures compensation range and expiration; Step 3 defines required technical competencies."
    )
    add_figure(doc, "Company_06_PostJobStudio.png", "2.6", "Three-step job posting studio")

    doc.add_heading("2.6 Candidate Screening & Pipeline Kanban", level=2)
    doc.add_paragraph(
        "The 'Applicants' pipeline (/company/#/applicants) segments candidates into Applied, Under Review / Endorsed, Interview, Offered, and Hired stages with full dossier inspection."
    )
    add_figure(doc, "Company_07_ApplicantScreening.png", "2.7", "Screen candidates across pipeline stages")

    doc.add_heading("2.7 Candidate Interview Management", level=2)
    doc.add_paragraph(
        "Recruiters schedule and monitor evaluations in 'Interviews' (/company/#/interviews), generating Google Meet conference links dispatched directly to candidate dashboards."
    )
    add_figure(doc, "Company_08_InterviewsList.png", "2.8", "Corporate interview calendar schedule")

    doc.add_heading("2.8 Trainee Roster & Practicum Oversight", level=2)
    doc.add_paragraph(
        "The 'OJT Trainees' directory (/company/#/ojt-trainees) displays deployed interns, real-time rendered hours, attendance DTR logs, and triggers official mid-term and final performance appraisals."
    )
    add_figure(doc, "Company_09_TraineesRoster.png", "2.9", "Active trainee roster and hours")

    doc.add_heading("2.9 Alumni Employee Roster", level=2)
    doc.add_paragraph(
        "The 'Employees' directory (/company/#/employees) tracks hired CHMSU graduates converted to permanent staff, categorizing records by department and employment tenure."
    )
    add_figure(doc, "Company_10_EmployeeRoster.png", "2.10", "Staff roster of hired alumni")

    doc.add_heading("2.10 Recruitment Velocity & Analytics", level=2)
    doc.add_paragraph(
        "The 'Analytics' dashboard (/company/#/analytics) calculates conversion funnel rates, average time-to-hire, and departmental talent demand metrics."
    )
    add_figure(doc, "Company_11_Analytics.png", "2.11", "Recruitment analytics and metrics")

    doc.add_heading("2.11 Secure Corporate Sign Out", level=2)
    doc.add_paragraph(
        "Recruiters sign out securely via the sidebar menu footer, terminating active company sessions."
    )
    add_figure(doc, "Company_12_SignOut.png", "2.12", "Secure employer portal sign out")

    doc.add_page_break()

    # =========================================================================
    # SECTION 3: FACULTY SUPERVISOR PORTAL
    # =========================================================================
    doc.add_heading("Section 3: Faculty OJT Supervisor Portal Operations", level=1)
    
    doc.add_heading("3.1 Faculty Authentication & Portal Entry", level=2)
    doc.add_paragraph(
        "Faculty OJT Coordinators log in at /login/ using institutional faculty accounts (e.g. alan.turing.bsit@chmsu.edu.ph) to access the academic oversight environment."
    )
    add_figure(doc, "Supervisor_01_SignIn.png", "3.1", "Faculty supervisor sign in gateway")

    doc.add_heading("3.2 Cohort Oversight Metrics Dashboard", level=2)
    doc.add_paragraph(
        "The Supervisor Dashboard (/supervisors/#/) summarizes cohort deployment metrics: actively deployed students, pending endorsement reviews, and compliance warnings."
    )
    add_figure(doc, "Supervisor_02_Dashboard.png", "3.2", "Faculty supervisor executive dashboard")

    doc.add_heading("3.3 Trainees Cohort Directory & Batch Import", level=2)
    doc.add_paragraph(
        "Under 'My Trainees' (/supervisors/#/trainees), coordinators inspect student dossiers and execute batch enrollment imports via CSV templates to auto-provision student trainee accounts."
    )
    add_figure(doc, "Supervisor_03_TraineesRoster.png", "3.3", "Assigned trainee cohort directory")

    doc.add_heading("3.4 Placement Endorsement Queue", level=2)
    doc.add_paragraph(
        "The 'OJT Management' queue (/supervisors/#/interests) centralizes student requests to partner companies, enabling supervisors to generate and dispatch official CHMSU Endorsement Letters."
    )
    add_figure(doc, "Supervisor_04_EndorsementsList.png", "3.4", "Student placement endorsement queue")

    doc.add_heading("3.5 GIS Workplace Deployment Monitoring Map", level=2)
    doc.add_paragraph(
        "The interactive 'Monitoring Map' (/supervisors/#/map) plots approved host company sites and trainee GPS punch locations to verify physical workplace presence."
    )
    add_figure(doc, "Supervisor_05_MonitoringMap.png", "3.5", "Geographic trainee deployment map")

    doc.add_heading("3.6 Competency Rubrics & Evaluations Studio", level=2)
    doc.add_paragraph(
        "Under 'Evaluations' (/supervisors/#/evaluations), coordinators configure CHED-aligned competency rubrics and dispatch tokenized evaluation forms directly to corporate mentors at mid-term (243h) and final (486h) milestones."
    )
    add_figure(doc, "Supervisor_06_RubricsEvaluations.png", "3.6", "CHED evaluation rubrics studio")

    doc.add_heading("3.7 Cohort Analytics & Attendance Ledger", level=2)
    doc.add_paragraph(
        "The 'Analysis & Insights' module (/supervisors/#/reports) generates cohort attendance ledgers, hourly completion velocity charts, and exports CSV compliance records for institutional reporting."
    )
    add_figure(doc, "Supervisor_07_ReportsFunnel.png", "3.7", "Cohort progression funnel analytics")

    doc.add_heading("3.8 Secure Supervisor Sign Out", level=2)
    doc.add_paragraph(
        "Faculty coordinators securely end their session via the sidebar logout button."
    )
    add_figure(doc, "Supervisor_08_SignOut.png", "3.8", "Secure supervisor session sign out")

    doc.add_page_break()

    # =========================================================================
    # SECTION 4: GRADUATE / ALUMNI PORTAL
    # =========================================================================
    doc.add_heading("Section 4: Graduate / Alumni (Jobseeker) Portal Operations", level=1)
    
    doc.add_heading("4.1 Alumni Authentication & Career Dashboard", level=2)
    doc.add_paragraph(
        "CHMSU graduates authenticate via /login/ using their registered alumni email (e.g. ron.delatorre.bsit2026@gmail.com). "
        "The Career Dashboard (/jobseeker/#/) displays active applications sent, pending employer reviews, and upcoming interviews."
    )
    add_figure(doc, "Graduate_01_SignIn.png", "4.1", "Alumni jobseeker portal sign in")
    add_figure(doc, "Graduate_02_Dashboard.png", "4.2", "Alumni career opportunities overview")

    doc.add_heading("4.2 Career Portfolio & ATS Resume Showcase", level=2)
    doc.add_paragraph(
        "Graduates maintain an ATS-formatted career portfolio (/jobseeker/#/portfolio), showcasing technical competencies, verified OJT practicum history, and certified projects."
    )
    add_figure(doc, "Graduate_03_PortfolioExperience.png", "4.3", "Alumni professional profile builder")

    doc.add_heading("4.3 Algorithmic Job Matches & Search", level=2)
    doc.add_paragraph(
        "Under 'Job Match' (/jobseeker/#/jobs), graduates browse vacancies ranked by algorithmic skill compatibility scores, with filters for remote work, salary brackets, and job types."
    )
    add_figure(doc, "Graduate_04_JobMatches.png", "4.4", "Algorithmic job match recommendations")

    doc.add_heading("4.4 Multi-Stage Job Application Tracker", level=2)
    doc.add_paragraph(
        "Alumni track their job applications through 'My Applications' (/jobseeker/#/applications), monitoring employer review decisions, scheduled interviews, and formal employment offers."
    )
    add_figure(doc, "Graduate_05_ApplicationPipeline.png", "4.5", "Track job application decisions")

    doc.add_heading("4.5 Corporate Interview Calendar", level=2)
    doc.add_paragraph(
        "The 'Interviews' schedule (/jobseeker/#/interview) coordinates recruiter meetings, displaying calendar dates, venue instructions, and remote Google Meet links."
    )
    add_figure(doc, "Graduate_06_InterviewSchedule.png", "4.6", "Alumni interview schedule calendar")

    doc.add_heading("4.6 Employer Partner Network", level=2)
    doc.add_paragraph(
        "The 'Companies' directory (/jobseeker/#/companies) catalogs university corporate partners actively recruiting CHMSU graduates."
    )
    add_figure(doc, "Graduate_07_PartnerCompanies.png", "4.7", "Corporate employer partner network")

    doc.add_heading("4.7 Secure Alumni Sign Out", level=2)
    doc.add_paragraph(
        "Alumni sign out via their avatar dropdown in the navigation bar."
    )
    add_figure(doc, "Graduate_08_SignOut.png", "4.8", "Secure alumni jobseeker sign out")

    doc.add_page_break()

    # =========================================================================
    # SECTION 5: ADMINISTRATOR / CIER PLACEMENT OFFICE
    # =========================================================================
    doc.add_heading("Section 5: System Administrator / CIER Placement Office", level=1)
    
    doc.add_heading("5.1 Dedicated Administrator Gateway", level=2)
    doc.add_paragraph(
        "CIER administrators log in through the institutional gateway at /login/admin-login using institutional master credentials (e.g. admin@chmsu.edu.ph)."
    )
    add_figure(doc, "Admin_01_SignIn.png", "5.1", "Dedicated administrator login portal")

    doc.add_heading("5.2 Institutional Master Dashboard", level=2)
    doc.add_paragraph(
        "The Admin Dashboard (/admin/#/) provides real-time university KPIs: total student enrollments, active industry MOAs, open job vacancies, and active OJT deployments."
    )
    add_figure(doc, "Admin_02_Dashboard.png", "5.2", "Institutional executive dashboard metrics")

    doc.add_heading("5.3 Student Cohort Management & Dual-Gate Promotion", level=2)
    doc.add_paragraph(
        "The 'Students' module (/admin/#/students) governs student lifecycles. "
        "Administrators broadcast campus-wide notices and execute the Dual-Gate Promotion Engine—transitioning students who have completed 486 hours and verified company appraisals to Alumni status."
    )
    add_figure(doc, "Admin_03_StudentsManagement.png", "5.3", "Student cohort and promotion management")

    doc.add_heading("5.4 Industry Partner Accreditation & MOA Approval", level=2)
    doc.add_paragraph(
        "Under 'Companies' (/admin/#/companies), administrators review pending partner registrations, audit legal documentation, and formally approve Memorandum of Agreement (MOA) contracts to unlock corporate portal access."
    )
    add_figure(doc, "Admin_04_CompaniesManagement.png", "5.4", "Corporate partner MOA accreditation")

    doc.add_heading("5.5 OJT Program Governance & Supervisor Allocation", level=2)
    doc.add_paragraph(
        "The 'OJT' console (/admin/#/ojt) oversees university practicum deployments, provisions faculty coordinators, and adjudicates formal trainee pull-out petitions and incident reports."
    )
    add_figure(doc, "Admin_05_OjtGovernance.png", "5.5", "University OJT program governance")

    doc.add_heading("5.6 Institutional Vacancy Moderation", level=2)
    doc.add_paragraph(
        "The 'Jobs' moderation panel (/admin/#/jobs) audits corporate postings to ensure compliance with university standards and fair labor guidelines."
    )
    add_figure(doc, "Admin_06_JobListings.png", "5.6", "Institutional vacancy moderation panel")

    doc.add_heading("5.7 Skill Matching Engine Matrix", level=2)
    doc.add_paragraph(
        "Under 'Matching' (/admin/#/matching), administrators inspect the algorithmic scoring matrix correlating student academic proficiencies with industry partner job specifications."
    )
    add_figure(doc, "Admin_07_SkillsMatching.png", "5.7", "Talent matching suitability matrix")

    doc.add_heading("5.8 Alumni Tracer & 3-Pillar PEO Reports", level=2)
    doc.add_paragraph(
        "The 'Reports' module (/admin/#/reports) tracks longitudinal graduate employment outcomes across the three Program Educational Objectives (PEO 1 Alignment, PEO 2 Career Progression, and PEO 3 Industry Relevancy)."
    )
    add_figure(doc, "Admin_08_AlumniTracerReports.png", "5.8", "Longitudinal PEO tracer analytics")

    doc.add_heading("5.9 System Parameters & Configuration", level=2)
    doc.add_paragraph(
        "Under 'Settings' (/admin/#/settings), administrators configure institutional academic terms (e.g. 2025–2026), system email dispatch rules, and security policies."
    )
    add_figure(doc, "Admin_09_Settings.png", "5.9", "University system configuration settings")

    doc.add_heading("5.10 Secure Administrator Sign Out", level=2)
    doc.add_paragraph(
        "Administrators sign out through the sidebar footer logout action, securing the central management console."
    )
    add_figure(doc, "Admin_10_SignOut.png", "5.10", "Secure administrator sign out action")

    doc.add_page_break()

    # =========================================================================
    # SECTION 6: ISSUES FOUND & QA OBSERVATIONS
    # =========================================================================
    doc.add_heading("Section 6: Issues Found & QA Technical Observations", level=1)
    doc.add_paragraph(
        "During live operational testing and documentation, the following technical observations and edge-case behaviors were verified in the live system:"
    )

    issues = [
        ("Landing Page Footer Anchor Placeholders", "Public landing footer links (Help Center, Documentation, Blog, Privacy Policy, Terms of Service) currently point to '#' and do not open distinct destination URLs.", "Informational", "Documented in User Manual"),
        ("Generic Login Error Suppression", "Failed authentication at /login/ always displays a generic 'Invalid credentials.' banner without indicating whether email or password was invalid (standard security practice, but can confuse new users).", "Low", "Documented in User Manual"),
        ("Leaflet Map Popup Route Hash Catching", "Dismissing popups on the Leaflet GIS map fires a '#close' hash change; the SPA router cleanly catches and filters this non-route hash to prevent unwanted page re-renders.", "Informational", "Verified Stable"),
        ("GPS Geofence Boundary Enforcement", "Attempting attendance punches outside the company's designated geographic coordinate radius triggers an immediate warning toast and prevents invalid DTR submissions.", "High (Security)", "Operating Correctly"),
    ]

    t_iss = doc.add_table(rows=len(issues) + 1, cols=4)
    t_iss.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_iss, color="D1D5DB", sz="4", val="single")

    headers = ["Observation / Issue", "Technical Description", "Severity", "System Impact / Resolution"]
    widths = [Inches(1.8), Inches(2.7), Inches(0.9), Inches(1.1)]

    for idx, (h, w) in enumerate(zip(headers, widths)):
        cell = t_iss.rows[0].cells[idx]
        cell.width = w
        set_cell_bg(cell, "005930")
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(h)
        run.bold = True
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for idx, (title, desc, sev, stat) in enumerate(issues, start=1):
        row = t_iss.rows[idx]
        bg = "F9FAFB" if idx % 2 == 1 else "FFFFFF"
        for i, w in enumerate(widths):
            row.cells[i].width = w
            set_cell_bg(row.cells[i], bg)
            set_cell_margins(row.cells[i], top=70, bottom=70, left=80, right=80)

        p0 = row.cells[0].paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(title)
        r0.bold = True
        r0.font.size = Pt(8.5)
        r0.font.color.rgb = RGBColor(0x00, 0x59, 0x30)

        p1 = row.cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(desc)
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

        p2 = row.cells[2].paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(sev)
        r2.bold = True
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = RGBColor(0x92, 0x40, 0x0E) if "Low" in sev or "Informational" in sev else RGBColor(0x00, 0x59, 0x30)

        p3 = row.cells[3].paragraphs[0]
        p3.paragraph_format.space_before = Pt(0)
        p3.paragraph_format.space_after = Pt(0)
        r3 = p3.add_run(stat)
        r3.font.size = Pt(8.5)
        r3.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    add_callout(
        doc,
        "Conclusion & Operational Readiness",
        "The CHMSU HireMe web platform operates in full production alignment with CHED CMO No. 104 and university SIPP guidelines. All operational screens function seamlessly in 100% light mode with verified data integrity across all user roles.",
        "NOTE"
    )

    for out_path in OUTPUT_FILES:
        doc.save(out_path)
        print(f"Successfully generated new user manual at: {out_path}")

if __name__ == "__main__":
    build_document()
