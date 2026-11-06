import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from doc_helpers import set_cell_margins, set_cell_bg, set_table_borders, add_callout, add_figure

IMG_DIR = os.path.join(os.getcwd(), 'manual_screenshots')
OUTPUT_FILE = os.path.join(os.getcwd(), 'CHMSU_HireMe_User_Manual.docx')

def create_manual():
    doc = Document()
    
    # Configure page geometry (Standard Letter, 1-inch margins)
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11.0)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    
    # Configure default styles
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
    p_dept.paragraph_format.space_after = Pt(36)
    run = p_dept.add_run("Center for Industry and External Relations (CIER)\nCollege of Computer Studies")
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    
    # Decorative rule
    p_rule = doc.add_paragraph()
    p_rule.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rule.paragraph_format.space_after = Pt(28)
    run = p_rule.add_run("―" * 35)
    run.bold = True
    run.font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Main Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(8)
    run = p_title.add_run("CHMSU HireMe")
    run.bold = True
    run.font.size = Pt(34)
    run.font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(18)
    run = p_sub.add_run("Comprehensive System User Manual & Step-by-Step Operations Guide")
    run.bold = True
    run.font.size = Pt(15)
    run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # Edition description
    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_before = Pt(0)
    p_desc.paragraph_format.space_after = Pt(54)
    run = p_desc.add_run("A Complete End-to-End Operational Manual Covering Public Access, Student Internships, Corporate Recruitment, Faculty Governance, Alumni Job Placement, and Institutional CIER Administration (100% Light Mode Edition).")
    run.italic = True
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # Metadata Box Table
    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.columns[0].width = Inches(2.2)
    meta_tbl.columns[1].width = Inches(4.3)
    set_table_borders(meta_tbl, color="E2E8F0", sz="4")
    
    meta_data = [
        ("Target System:", "CHMSU HireMe Production (https://chmsu-hireme.vercel.app)"),
        ("Document Reference:", "CIER-OJT-MANUAL-2026-V2.0-LIGHT"),
        ("System Theme Standard:", "Institutional Light Theme (100% Brightness Standard)"),
        ("Academic Year & Date:", "Academic Year 2025–2026 | Document Release Date: November 2026")
    ]
    for i, (label, val) in enumerate(meta_data):
        row = meta_tbl.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        set_cell_bg(c0, "F8FAFC")
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(0x00, 0x59, 0x30)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_page_break()

    # =========================================================================
    # 2. TABLE OF CONTENTS
    # =========================================================================
    h_toc = doc.add_heading("Table of Contents", level=1)
    h_toc.paragraph_format.space_before = Pt(12)
    h_toc.paragraph_format.space_after = Pt(14)
    h_toc.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    toc_tbl = doc.add_table(rows=1, cols=3)
    toc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_tbl.columns[0].width = Inches(1.1)
    toc_tbl.columns[1].width = Inches(4.3)
    toc_tbl.columns[2].width = Inches(1.1)
    set_table_borders(toc_tbl, color="CBD5E1", sz="6")

    hdr_cells = toc_tbl.rows[0].cells
    set_cell_bg(hdr_cells[0], "005930")
    set_cell_bg(hdr_cells[1], "005930")
    set_cell_bg(hdr_cells[2], "005930")
    for idx, name in enumerate(["Section", "Title / Target Operations", "Figures"]):
        set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[idx].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(name)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    toc_rows = [
        ("Intro", "System Overview & User Role Matrix", "—"),
        ("Section 0", "Public Entry, User Registration & Initial Onboarding", "Figure 0.1 – 0.7"),
        ("Section 1", "Student / OJT Trainee Portal Operations", "Figure 1.1 – 1.17"),
        ("Section 2", "Employer / Company Partner Portal Operations", "Figure 2.1 – 2.15"),
        ("Section 3", "Faculty OJT Supervisor Portal Operations", "Figure 3.1 – 3.12"),
        ("Section 4", "Graduate / Alumni (Jobseeker) Portal Operations", "Figure 4.1 – 4.10"),
        ("Section 5", "System Administrator & CIER Placement Office Console", "Figure 5.1 – 5.15"),
        ("Section 6", "QA Technical Observations & Compliance Verification", "Report")
    ]

    for sec, title, figs in toc_rows:
        row = toc_tbl.add_row()
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        for c in (c0, c1, c2):
            set_cell_margins(c, top=80, bottom=80, left=120, right=120)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(sec)
        r0.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(0x00, 0x59, 0x30)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(title)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(figs)
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    doc.add_page_break()

    # =========================================================================
    # 3. INTRODUCTION
    # =========================================================================
    h_intro = doc.add_heading("Introduction", level=1)
    h_intro.paragraph_format.space_before = Pt(12)
    h_intro.paragraph_format.space_after = Pt(10)
    h_intro.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.line_spacing = 1.2
    p_intro.paragraph_format.space_after = Pt(12)
    r_intro = p_intro.add_run(
        "CHMSU HireMe is an integrated institutional career placement, internship management, and alumni tracer platform engineered for Carlos Hilado Memorial State University. "
        "It connects student trainees, academic supervisors, accredited industry partners, and graduating alumni with the CIER Placement Office through automated workflows, competency-based matching, and real-time compliance monitoring. "
        "The system serves five primary user roles: Student/OJT Trainees, Accredited Employers, Faculty OJT Supervisors, Alumni Jobseekers, and System Administrators."
    )
    r_intro.font.size = Pt(11)

    add_callout(
        doc,
        "System Architecture & Dual-Gate Governance",
        "The platform incorporates strict CHED CMO No. 104, Series of 2017 (Student Internship Program in the Philippines) guidelines and Republic Act 10173 (Data Privacy Act of 2012). All user interfaces are displayed in the standardized institutional Light Theme, ensuring high contrast, clean typography, and optimal readability across all stakeholder portals."
    )

    # Role Matrix Table
    p_mtx = doc.add_paragraph()
    p_mtx.paragraph_format.space_before = Pt(8)
    p_mtx.paragraph_format.space_after = Pt(6)
    r = p_mtx.add_run("Platform User Roles & Operational Scope")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    role_tbl = doc.add_table(rows=1, cols=3)
    role_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    role_tbl.columns[0].width = Inches(1.8)
    role_tbl.columns[1].width = Inches(1.6)
    role_tbl.columns[2].width = Inches(3.1)
    set_table_borders(role_tbl, color="CBD5E1", sz="4")

    rh_cells = role_tbl.rows[0].cells
    set_cell_bg(rh_cells[0], "005930")
    set_cell_bg(rh_cells[1], "005930")
    set_cell_bg(rh_cells[2], "005930")
    for idx, col_name in enumerate(["User Role", "Portal Gateway", "Core Functional Capabilities"]):
        set_cell_margins(rh_cells[idx], top=90, bottom=90, left=100, right=100)
        p = rh_cells[idx].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(col_name)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    role_data = [
        ("Student / OJT Trainee", "/main/#/", "Browse OJT slots, submit clearances, punch daily time tracker, submit pull-out petitions, build resumes."),
        ("Employer / Company Partner", "/company/#/", "Post vacancies/internships, screen applicants, schedule interviews, audit intern DTRs, submit performance evaluations."),
        ("Faculty OJT Supervisor", "/supervisors/#/", "Audit trainee clearances, issue official endorsements, inspect monitoring map, configure rubrics, review cohort funnel."),
        ("Graduate / Alumni Jobseeker", "/jobseeker/#/", "Access career opportunities, AI suitability matching, track multi-stage job offers, maintain ATS portfolio."),
        ("System Administrator (CIER)", "/admin/#/", "Oversee campus placement, approve corporate MOAs, dual-gate graduate promotion, Dean pull-outs, PEO tracer analytics.")
    ]

    for role, route, desc in role_data:
        row = role_tbl.add_row()
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        for c in (c0, c1, c2):
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(role)
        r0.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(0x00, 0x59, 0x30)

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(route)
        r1.font.name = "Consolas"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(desc)
        r2.font.size = Pt(9)
        r2.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    doc.add_page_break()

    # =========================================================================
    # SECTION 0: PUBLIC ACCESS & ONBOARDING
    # =========================================================================
    h_s0 = doc.add_heading("Section 0: Public Access, Registration & Account Setup", level=1)
    h_s0.paragraph_format.space_before = Pt(12)
    h_s0.paragraph_format.space_after = Pt(10)
    h_s0.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Process 0.1
    h_p01 = doc.add_heading("0.1 Navigating the Public Landing Page", level=2)
    h_p01.paragraph_format.space_before = Pt(10)
    h_p01.paragraph_format.space_after = Pt(6)
    h_p01.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Open any modern desktop web browser and navigate to the live platform address: ")
    r = p.add_run("https://chmsu-hireme.vercel.app")
    r.bold = True
    p.add_run(".\n2. Review university announcements, placement metrics, and accredited partner companies.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_01_LandingPage.png"), "0.1", "CHMSU HireMe public landing page")

    p = doc.add_paragraph()
    p.add_run("3. Scroll through the landing page sections to explore role pathways for Students, Employers, Supervisors, and Alumni.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_02_LandingRoles.png"), "0.2", "Explore platform user roles and pathways")

    # Process 0.2
    h_p02 = doc.add_heading("0.2 Student Self-Registration", level=2)
    h_p02.paragraph_format.space_before = Pt(14)
    h_p02.paragraph_format.space_after = Pt(6)
    h_p02.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to the Sign Up view at ")
    p.add_run("/login/?view=signup").font.name = "Consolas"
    p.add_run(".\n2. Enter full legal name, institutional email address ending with @chmsu.edu.ph, and a strong password.\n3. Click 'Create Account' to proceed.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_03_RegisterForm.png"), "0.3", "Student self-registration entry form")

    # Process 0.3
    h_p03 = doc.add_heading("0.3 Academic Role Onboarding & Program Selection", level=2)
    h_p03.paragraph_format.space_before = Pt(14)
    h_p03.paragraph_format.space_after = Pt(6)
    h_p03.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. On the initial onboarding screen, select the intended user persona: Student Intern or Graduate Jobseeker.\n2. Click 'Next Step' to proceed to academic credentials.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_04_OnboardingRole.png"), "0.4", "Select academic role onboarding")

    p = doc.add_paragraph()
    p.add_run("3. Fill in student identification number, enrolled college (College of Computer Studies), academic degree program (e.g., BS Information Technology), and assigned academic year batch.\n4. Click 'Complete Profile' to submit account credentials for administrative synchronization.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_05_OnboardingDetails.png"), "0.5", "Complete program and academic details")

    # Process 0.4
    h_p04 = doc.add_heading("0.4 Corporate Partner Registration & Administrator Entry", level=2)
    h_p04.paragraph_format.space_before = Pt(14)
    h_p04.paragraph_format.space_after = Pt(6)
    h_p04.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Industry partners seeking institutional accreditation navigate to ")
    p.add_run("/login/?view=company-signup").font.name = "Consolas"
    p.add_run(".\n2. Submit official company name, SEC/DTI registration number, corporate email, industry sector, and authorized HR contact information.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_06_CompanySignup.png"), "0.6", "Accredited company partner registration")

    p = doc.add_paragraph()
    p.add_run("3. University placement directors and CIER administrators access the dedicated administrative gateway at ")
    p.add_run("/login/admin-login").font.name = "Consolas"
    p.add_run(" using multi-tier administrative credentials.")
    add_figure(doc, os.path.join(IMG_DIR, "Public_07_AdminLogin.png"), "0.7", "Dedicated administrator login portal")

    doc.add_page_break()

    # =========================================================================
    # SECTION 1: STUDENT / OJT TRAINEE PORTAL
    # =========================================================================
    h_s1 = doc.add_heading("Section 1: Student / OJT Trainee Portal Operations", level=1)
    h_s1.paragraph_format.space_before = Pt(12)
    h_s1.paragraph_format.space_after = Pt(10)
    h_s1.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Process 1.1
    h_p11 = doc.add_heading("1.1 Authentication & Data Privacy Compliance Gate", level=2)
    h_p11.paragraph_format.space_before = Pt(10)
    h_p11.paragraph_format.space_after = Pt(6)
    h_p11.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to the unified Sign In tab at ")
    p.add_run("/login/").font.name = "Consolas"
    p.add_run(".\n2. Enter authorized university email address and secure password.\n3. Click 'Sign In' to proceed.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_01_SignIn.png"), "1.1", "Enter student credentials to sign in")

    p = doc.add_paragraph()
    p.add_run("4. Upon initial login or policy updates, the institutional compliance modal appears, enforcing Republic Act 10173 (Data Privacy Act of 2012) and CHED CMO No. 104 guidelines.\n5. Check the mandatory acknowledgement checkbox and click 'Accept & Continue' to unlock portal access.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_02_TermsGate.png"), "1.2", "Accept Data Privacy Act terms")

    # Process 1.2
    h_p12 = doc.add_heading("1.2 Student Dashboard Navigation", level=2)
    h_p12.paragraph_format.space_before = Pt(14)
    h_p12.paragraph_format.space_after = Pt(6)
    h_p12.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. The Student Dashboard (")
    p.add_run("/main/#/").font.name = "Consolas"
    p.add_run(") provides high-level telemetry including total rendered OJT hours against requirement (486 Hours), clearance checklist progress, company placement status, and upcoming interview cards.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_03_Dashboard.png"), "1.3", "Student portal overview dashboard")

    # Process 1.3
    h_p13 = doc.add_heading("1.3 Portfolio Management & ATS Resume Builder", level=2)
    h_p13.paragraph_format.space_before = Pt(14)
    h_p13.paragraph_format.space_after = Pt(6)
    h_p13.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'Portfolio' from the sidebar navigation (")
    p.add_run("/main/#/portfolio").font.name = "Consolas"
    p.add_run(") to manage your academic profile, contact information, career objective, and GitHub/LinkedIn URLs.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_04_PortfolioOverview.png"), "1.4", "View student professional profile")

    p = doc.add_paragraph()
    p.add_run("2. Navigate to the 'Skills & Competencies' tab. Add technical competencies (e.g., JavaScript, Python, UI/UX Design) and proficiency levels. These skills directly feed the institutional matching algorithm.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_05_PortfolioSkills.png"), "1.5", "Add technical and workplace skills")

    p = doc.add_paragraph()
    p.add_run("3. Click the 'Resume Preview' button. The platform dynamically renders an industry-standard, ATS-optimized curriculum vitae ready for one-click PDF export or corporate application dispatch.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_06_ResumePreview.png"), "1.6", "Generate formatted student resume")

    # Process 1.4
    h_p14 = doc.add_heading("1.4 Pre-Internship Clearance Submission", level=2)
    h_p14.paragraph_format.space_before = Pt(14)
    h_p14.paragraph_format.space_after = Pt(6)
    h_p14.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Clearances' (")
    p.add_run("/main/#/clearance").font.name = "Consolas"
    p.add_run(").\n2. Upload digital scans of required institutional documentation: Medical Certificate, Notarized Parent/Guardian Consent, Good Moral Character, and Enrollment Assessment Form.\n3. Monitor review status as your Faculty OJT Coordinator audits submissions.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_07_ClearanceSubmit.png"), "1.7", "Upload pre-OJT clearance requirements")

    # Process 1.5
    h_p15 = doc.add_heading("1.5 Exploring Verified OJT Opportunities", level=2)
    h_p15.paragraph_format.space_before = Pt(14)
    h_p15.paragraph_format.space_after = Pt(6)
    h_p15.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'OJT Opportunities' (")
    p.add_run("/main/#/ojt-opportunities").font.name = "Consolas"
    p.add_run(") to browse university-accredited Host Training Establishments (HTEs) with active MOAs.\n2. Filter opportunities by course discipline, required skill tags, and work setup (On-site, Hybrid, Remote).")
    add_figure(doc, os.path.join(IMG_DIR, "Student_08_OjtList.png"), "1.8", "Browse verified internship opportunities")

    p = doc.add_paragraph()
    p.add_run("3. Click any slot card to inspect comprehensive details: slot quota, department assignment, allowance details, and supervisor requirements. Click 'Apply for Slot' to submit your portfolio.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_09_OjtDetail.png"), "1.9", "Review internship slot specifications")

    # Process 1.6
    h_p16 = doc.add_heading("1.6 Biometric Time Tracker & DTR Attendance Logging", level=2)
    h_p16.paragraph_format.space_before = Pt(14)
    h_p16.paragraph_format.space_after = Pt(6)
    h_p16.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'OJT Tracker' (")
    p.add_run("/main/#/ojt-tracker").font.name = "Consolas"
    p.add_run(").\n2. Review the monthly calendar displaying daily rendered hours, morning/afternoon session punches, and supervisor verification status.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_10_TrackerCalendar.png"), "1.10", "Monitor attendance and rendered hours")

    p = doc.add_paragraph()
    p.add_run("3. To record daily attendance, click the active session button ('Time In' / 'Time Out'). The platform captures the verified timestamp, GPS workstation coordinates, and IP audit trail.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_11_TrackerTimeIn.png"), "1.11", "Log daily biometric attendance punch")

    # Process 1.7
    h_p17 = doc.add_heading("1.7 Workplace Incident & Emergency Protocols", level=2)
    h_p17.paragraph_format.space_before = Pt(14)
    h_p17.paragraph_format.space_after = Pt(6)
    h_p17.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. In case of workplace safety concerns, medical emergencies, or harassment, click the prominent 'Emergency Protocol' notice in the tracker toolbar to review direct hotlines for the CIER Placement Office, Campus Clinic, and Safety Officers.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_12_EmergencyNotice.png"), "1.12", "Review workplace emergency protocol")

    # Process 1.8
    h_p18 = doc.add_heading("1.8 Formal OJT Pull-Out Petition", level=2)
    h_p18.paragraph_format.space_before = Pt(14)
    h_p18.paragraph_format.space_after = Pt(6)
    h_p18.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. When role divergence, unsafe conditions, or company closure occurs, click 'Request Pull-Out'.\n2. Select the valid reason under CHED guidelines, attach supporting incident documentation, and submit for multi-tiered review (Faculty Supervisor → CIER Placement Office → College Dean).")
    add_figure(doc, os.path.join(IMG_DIR, "Student_13_PullOutModal.png"), "1.13", "Submit formal OJT pull-out request")

    # Process 1.9
    h_p19 = doc.add_heading("1.9 Algorithmic Job Matching & Application Pipeline", level=2)
    h_p19.paragraph_format.space_before = Pt(14)
    h_p19.paragraph_format.space_after = Pt(6)
    h_p19.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Jobs' (")
    p.add_run("/main/#/jobs").font.name = "Consolas"
    p.add_run("). The intelligent engine calculates Suitability Match Scores based on course alignment, technical competencies, and project portfolio.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_14_JobMatches.png"), "1.14", "Review AI-computed job matches")

    p = doc.add_paragraph()
    p.add_run("2. Navigate to 'Applications' (")
    p.add_run("/main/#/applications").font.name = "Consolas"
    p.add_run("). Track live status through color-coded Kanban stages: Under Review, Screening, Interview Scheduled, Shortlisted, Offered, or Declined.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_15_ApplicationsPipeline.png"), "1.15", "Track status of submitted applications")

    # Process 1.10
    h_p110 = doc.add_heading("1.10 Interview Management & Secure Sign Out", level=2)
    h_p110.paragraph_format.space_before = Pt(14)
    h_p110.paragraph_format.space_after = Pt(6)
    h_p110.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Interviews' (")
    p.add_run("/main/#/interview").font.name = "Consolas"
    p.add_run("). View confirmed interview appointments, video conferencing links (Google Meet/Zoom), recruiter notes, and interview preparation checklists.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_16_InterviewList.png"), "1.16", "Access scheduled interview calendar")

    p = doc.add_paragraph()
    p.add_run("2. To securely end your session, click your profile avatar in the upper navigation bar and select 'Sign Out'.")
    add_figure(doc, os.path.join(IMG_DIR, "Student_17_SignOut.png"), "1.17", "Sign out from student account")

    doc.add_page_break()

    # =========================================================================
    # SECTION 2: EMPLOYER / COMPANY PARTNER PORTAL
    # =========================================================================
    h_s2 = doc.add_heading("Section 2: Employer / Company Partner Portal Operations", level=1)
    h_s2.paragraph_format.space_before = Pt(12)
    h_s2.paragraph_format.space_after = Pt(10)
    h_s2.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Process 2.1
    h_p21 = doc.add_heading("2.1 Corporate Authentication & Dashboard Telemetry", level=2)
    h_p21.paragraph_format.space_before = Pt(10)
    h_p21.paragraph_format.space_after = Pt(6)
    h_p21.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Access the corporate login gateway at ")
    p.add_run("/login/").font.name = "Consolas"
    p.add_run(" using verified recruiter credentials.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_01_SignIn.png"), "2.1", "Enter corporate credentials to sign in")

    p = doc.add_paragraph()
    p.add_run("2. The Employer Dashboard (")
    p.add_run("/company/#/").font.name = "Consolas"
    p.add_run(") displays live recruitment metrics: Active OJT Openings, Total Candidates Screened, Active Interns Deployed, and Pending Performance Evaluations.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_02_Dashboard.png"), "2.2", "Employer portal recruitment dashboard")

    # Process 2.2
    h_p22 = doc.add_heading("2.2 Company Branding & Accreditation Profile", level=2)
    h_p22.paragraph_format.space_before = Pt(14)
    h_p22.paragraph_format.space_after = Pt(6)
    h_p22.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Company Profile' (")
    p.add_run("/company/#/profile").font.name = "Consolas"
    p.add_run(").\n2. Update corporate overview, physical office addresses, HR representative details, official website, and upload the company logo and signed Memorandum of Agreement (MOA).")
    add_figure(doc, os.path.join(IMG_DIR, "Company_03_ProfileSetup.png"), "2.3", "Manage corporate profile and branding")

    # Process 2.3
    h_p23 = doc.add_heading("2.3 Internship Slot Management & Vacancy Posting", level=2)
    h_p23.paragraph_format.space_before = Pt(14)
    h_p23.paragraph_format.space_after = Pt(6)
    h_p23.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'OJT Slots' (")
    p.add_run("/company/#/ojt-slots").font.name = "Consolas"
    p.add_run(") to review existing internship postings, filled ratios, and application activity.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_04_OjtSlots.png"), "2.4", "Manage active internship slots")

    p = doc.add_paragraph()
    p.add_run("2. Click '+ Post New Slot'. Define slot title (e.g., Full-Stack Web Development Trainee), target course discipline (BSIT), required skill tags, stipend allowance, slot capacity, and designated mentor.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_05_PostSlotModal.png"), "2.5", "Publish new internship opportunity")

    # Process 2.4
    h_p24 = doc.add_heading("2.4 Candidate Screening & Resume Inspection", level=2)
    h_p24.paragraph_format.space_before = Pt(14)
    h_p24.paragraph_format.space_after = Pt(6)
    h_p24.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Applications' (")
    p.add_run("/company/#/applications").font.name = "Consolas"
    p.add_run("). Filter applicant submissions by role, match suitability score, and clearance compliance.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_06_ApplicantScreening.png"), "2.6", "Screen applicant pipeline candidates")

    p = doc.add_paragraph()
    p.add_run("2. Click any candidate to open the Candidate Inspection Drawer. Review verified academic standing, technical competencies, portfolio repositories, and rendered clearance endorsements.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_07_CandidateDrawer.png"), "2.7", "Inspect applicant resume and scores")

    # Process 2.5
    h_p25 = doc.add_heading("2.5 Interview Scheduling & Recruiter Calendar", level=2)
    h_p25.paragraph_format.space_before = Pt(14)
    h_p25.paragraph_format.space_after = Pt(6)
    h_p25.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Within the candidate drawer or interview console, click 'Schedule Interview'. Select interview mode (Virtual/In-Person), date, time, interviewers, and meeting invite URL.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_08_ScheduleInterview.png"), "2.8", "Schedule interview with candidate")

    p = doc.add_paragraph()
    p.add_run("2. Navigate to 'Interviews' (")
    p.add_run("/company/#/interviews").font.name = "Consolas"
    p.add_run(") to manage upcoming interview agendas, submit interviewer feedback notes, and dispatch formal acceptance offers.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_09_InterviewsList.png"), "2.9", "Review scheduled interview pipeline")

    # Process 2.6
    h_p26 = doc.add_heading("2.6 Intern Monitoring & Daily Time Record Auditing", level=2)
    h_p26.paragraph_format.space_before = Pt(14)
    h_p26.paragraph_format.space_after = Pt(6)
    h_p26.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Active Trainees' (")
    p.add_run("/company/#/trainees").font.name = "Consolas"
    p.add_run(") to review the active roster of placed student interns, supervising mentors, and progress toward total required hours.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_10_TraineesRoster.png"), "2.10", "Monitor deployed student interns")

    p = doc.add_paragraph()
    p.add_run("2. Click 'Audit DTR' on any trainee to inspect individual biometric timestamps. Corporate supervisors can approve, flag anomalies, or reject daily attendance punches.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_11_TraineeDtrAudit.png"), "2.11", "Audit trainee daily time record")

    # Process 2.7
    h_p27 = doc.add_heading("2.7 Performance Evaluation Submission", level=2)
    h_p27.paragraph_format.space_before = Pt(14)
    h_p27.paragraph_format.space_after = Pt(6)
    h_p27.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'Evaluate Trainee' upon reaching mid-term (243 Hours) or final completion (486 Hours).\n2. Grade student performance across CHED-prescribed rubrics: Technical Competence, Quality of Work, Professionalism & Attendance, Problem Solving, and Teamwork.\n3. Enter qualitative commendations and submit to satisfy Dual-Gate graduation requirements.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_12_EvaluationForm.png"), "2.12", "Submit mid-term performance evaluation")

    # Process 2.8
    h_p28 = doc.add_heading("2.8 Full-Time Hiring & Corporate Sign Out", level=2)
    h_p28.paragraph_format.space_before = Pt(14)
    h_p28.paragraph_format.space_after = Pt(6)
    h_p28.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Job Postings' (")
    p.add_run("/company/#/jobs").font.name = "Consolas"
    p.add_run(") to publish full-time employment vacancies directly targeting graduating CHMSU seniors and alumni.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_13_JobListings.png"), "2.13", "Post full-time graduate vacancies")

    p = doc.add_paragraph()
    p.add_run("2. Navigate to 'Employees' (")
    p.add_run("/company/#/employees").font.name = "Consolas"
    p.add_run(") to maintain corporate records of hired CHMSU alumni, directly feeding university alumni tracer telemetry.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_14_EmployeeRoster.png"), "2.14", "Maintain alumni employee records")

    p = doc.add_paragraph()
    p.add_run("3. To securely end the recruitment session, click the account dropdown and select 'Sign Out'.")
    add_figure(doc, os.path.join(IMG_DIR, "Company_15_SignOut.png"), "2.15", "Sign out from company account")

    doc.add_page_break()

    # =========================================================================
    # SECTION 3: FACULTY OJT SUPERVISOR PORTAL (AUTHENTIC & CONNECTED)
    # =========================================================================
    h_s3 = doc.add_heading("Section 3: Faculty OJT Supervisor Portal Operations", level=1)
    h_s3.paragraph_format.space_before = Pt(12)
    h_s3.paragraph_format.space_after = Pt(10)
    h_s3.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Process 3.1
    h_p31 = doc.add_heading("3.1 Faculty Authentication & Portal Entry", level=2)
    h_p31.paragraph_format.space_before = Pt(10)
    h_p31.paragraph_format.space_after = Pt(6)
    h_p31.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Faculty coordinators navigate to ")
    p.add_run("/login/").font.name = "Consolas"
    p.add_run(".\n2. Enter authorized institutional credentials (e.g., ")
    p.add_run("alan.turing.bsit@chmsu.edu.ph").font.name = "Consolas"
    p.add_run(") and password.\n3. Click 'Sign In' to enter the supervisor management console.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_01_SignIn.png"), "3.1", "Enter faculty credentials to sign in")

    # Process 3.2
    h_p32 = doc.add_heading("3.2 Faculty Supervisor Executive Dashboard", level=2)
    h_p32.paragraph_format.space_before = Pt(14)
    h_p32.paragraph_format.space_after = Pt(6)
    h_p32.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. The Supervisor Dashboard (")
    p.add_run("/supervisors/#/").font.name = "Consolas"
    p.add_run(") consolidates academic cohort telemetry: Assigned Trainees, Pending Endorsement Requests, Active Company Placements, and Cohort Hour Completion Averages.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_02_Dashboard.png"), "3.2", "Faculty supervisor monitoring dashboard")

    # Process 3.3
    h_p33 = doc.add_heading("3.3 Assigned Trainee Cohort Directory", level=2)
    h_p33.paragraph_format.space_before = Pt(14)
    h_p33.paragraph_format.space_after = Pt(6)
    h_p33.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Trainees' (")
    p.add_run("/supervisors/#/trainees").font.name = "Consolas"
    p.add_run(") to review all assigned 4th-year students, tracking their rendered hours against the mandatory 486-hour institutional requirement.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_03_TraineesRoster.png"), "3.3", "Review assigned student intern cohort")

    # Process 3.4
    h_p34 = doc.add_heading("3.4 Batch Trainee Enrollment Import", level=2)
    h_p34.paragraph_format.space_before = Pt(14)
    h_p34.paragraph_format.space_after = Pt(6)
    h_p34.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'Import Students' on the trainees toolbar.\n2. Download the official CSV enrollment template and upload the completed roster with automatic temporary credential generation (")
    p.add_run("CHMSU@<student_id>").font.name = "Consolas"
    p.add_run(").")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_04_ImportStudents.png"), "3.4", "Batch import student trainee list")

    # Process 3.5
    h_p35 = doc.add_heading("3.5 Trainee Inspection & Clearance Audit", level=2)
    h_p35.paragraph_format.space_before = Pt(14)
    h_p35.paragraph_format.space_after = Pt(6)
    h_p35.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'Inspect' on any trainee row to audit uploaded clearances: Medical Certificate, Fit-to-Work Clearance, Parent/Guardian Consent, and Police/Barangay clearance documents.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_05_TraineeInspection.png"), "3.5", "Approve student pre-internship clearances")

    # Process 3.6
    h_p36 = doc.add_heading("3.6 Student Placement Endorsement Queue", level=2)
    h_p36.paragraph_format.space_before = Pt(14)
    h_p36.paragraph_format.space_after = Pt(6)
    h_p36.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Interests & Endorsements' (")
    p.add_run("/supervisors/#/interests").font.name = "Consolas"
    p.add_run(") to review incoming endorsement requests submitted by trainees who have cleared pre-OJT document requirements.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_06_EndorsementsList.png"), "3.6", "Review incoming endorsement requests")

    # Process 3.7
    h_p37 = doc.add_heading("3.7 Official Endorsement Letter Dispatch", level=2)
    h_p37.paragraph_format.space_before = Pt(14)
    h_p37.paragraph_format.space_after = Pt(6)
    h_p37.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'Send Endorsement Letter' to generate the official university endorsement document with Dean signature lines and dispatch directly to the Host Training Establishment.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_07_IssueEndorsement.png"), "3.7", "Issue official OJT endorsement letter")

    # Process 3.8
    h_p38 = doc.add_heading("3.8 Geographic Trainee Monitoring Map", level=2)
    h_p38.paragraph_format.space_before = Pt(14)
    h_p38.paragraph_format.space_after = Pt(6)
    h_p38.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Monitoring Map' (")
    p.add_run("/supervisors/#/map").font.name = "Consolas"
    p.add_run(") to visually track trainee workplace distribution clusters across accredited host companies in Negros Occidental.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_08_MonitoringMap.png"), "3.8", "Track student workplace locations")

    # Process 3.9
    h_p39 = doc.add_heading("3.9 CHED Evaluation Rubrics & Templates", level=2)
    h_p39.paragraph_format.space_before = Pt(14)
    h_p39.paragraph_format.space_after = Pt(6)
    h_p39.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Evaluations' (")
    p.add_run("/supervisors/#/evaluations").font.name = "Consolas"
    p.add_run(") to configure evaluation rubric criteria aligned with CHED Program Educational Objectives and institutional competencies.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_09_RubricsEvaluations.png"), "3.9", "Configure CHED-aligned evaluation rubric")

    # Process 3.10
    h_p310 = doc.add_heading("3.10 Evaluation Link Dispatch to Corporate Mentors", level=2)
    h_p310.paragraph_format.space_before = Pt(14)
    h_p310.paragraph_format.space_after = Pt(6)
    h_p310.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click 'Dispatch Evaluation Link' to trigger automated evaluation links to host company mentors as students achieve mid-term (243 Hours) or final completion (486 Hours).")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_10_EvaluationDispatch.png"), "3.10", "Dispatch evaluation request to employer")

    # Process 3.11
    h_p311 = doc.add_heading("3.11 Endorsement Pipeline & Progression Funnel", level=2)
    h_p311.paragraph_format.space_before = Pt(14)
    h_p311.paragraph_format.space_after = Pt(6)
    h_p311.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Reports' (")
    p.add_run("/supervisors/#/reports").font.name = "Consolas"
    p.add_run(") to monitor the Endorsement Pipeline funnel, tracking trainees from placement application through letter endorsement to completed internship.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_11_ReportsFunnel.png"), "3.11", "Track cohort progression and completion")

    # Process 3.12
    h_p312 = doc.add_heading("3.12 Secure Supervisor Sign Out", level=2)
    h_p312.paragraph_format.space_before = Pt(14)
    h_p312.paragraph_format.space_after = Pt(6)
    h_p312.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Click the profile avatar trigger in the upper navigation bar or sidebar footer and select 'Sign Out' to securely disconnect.")
    add_figure(doc, os.path.join(IMG_DIR, "Supervisor_12_SignOut.png"), "3.12", "Sign out from supervisor account")

    doc.add_page_break()

    # =========================================================================
    # SECTION 4: GRADUATE / ALUMNI PORTAL
    # =========================================================================
    h_s4 = doc.add_heading("Section 4: Graduate / Alumni (Jobseeker) Portal Operations", level=1)
    h_s4.paragraph_format.space_before = Pt(12)
    h_s4.paragraph_format.space_after = Pt(10)
    h_s4.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Process 4.1
    h_p41 = doc.add_heading("4.1 Alumni Authentication & Career Dashboard", level=2)
    h_p41.paragraph_format.space_before = Pt(10)
    h_p41.paragraph_format.space_after = Pt(6)
    h_p41.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Graduated students log in at ")
    p.add_run("/login/").font.name = "Consolas"
    p.add_run(" with their permanent alumni credentials.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_01_SignIn.png"), "4.1", "Enter alumni credentials to sign in")

    p = doc.add_paragraph()
    p.add_run("2. The Alumni Dashboard (")
    p.add_run("/jobseeker/#/").font.name = "Consolas"
    p.add_run(") provides career metrics: AI Matched Vacancies, Active Applications, Upcoming Interviews, and Current Employment Verification Status.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_02_Dashboard.png"), "4.2", "Alumni jobseeker dashboard overview")

    # Process 4.2
    h_p42 = doc.add_heading("4.2 Experience Timeline & ATS Resume Generation", level=2)
    h_p42.paragraph_format.space_before = Pt(14)
    h_p42.paragraph_format.space_after = Pt(6)
    h_p42.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Portfolio' (")
    p.add_run("/jobseeker/#/portfolio").font.name = "Consolas"
    p.add_run("). Update professional work history, OJT experience, industry certifications, and technical projects.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_03_PortfolioExperience.png"), "4.3", "Update professional career timeline")

    p = doc.add_paragraph()
    p.add_run("2. Click 'ATS Resume Builder'. The platform formats your entire professional trajectory into an ATS-friendly layout optimized for applicant tracking systems.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_04_AtsResume.png"), "4.4", "Preview ATS-compliant resume builder")

    # Process 4.3
    h_p43 = doc.add_heading("4.3 Algorithmic Job Recommendations & Applications", level=2)
    h_p43.paragraph_format.space_before = Pt(14)
    h_p43.paragraph_format.space_after = Pt(6)
    h_p43.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Job Opportunities' (")
    p.add_run("/jobseeker/#/jobs").font.name = "Consolas"
    p.add_run("). Review vacancies sorted by weighted suitability match scores.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_05_JobMatches.png"), "4.5", "Browse matched graduate job postings")

    p = doc.add_paragraph()
    p.add_run("2. Click any vacancy to inspect salary range, job responsibilities, and required qualifications. Click 'Apply Now' to submit your verified alumni credentials.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_06_JobDetailApply.png"), "4.6", "Review vacancy and submit application")

    # Process 4.4
    h_p44 = doc.add_heading("4.4 Application Lifecycle & Offer Decision", level=2)
    h_p44.paragraph_format.space_before = Pt(14)
    h_p44.paragraph_format.space_after = Pt(6)
    h_p44.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Applications' (")
    p.add_run("/jobseeker/#/applications").font.name = "Consolas"
    p.add_run(") to monitor the progress of all active submissions in real time.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_07_ApplicationPipeline.png"), "4.7", "Track active job application stages")

    p = doc.add_paragraph()
    p.add_run("2. When a corporate partner extends an offer, an interactive Offer Card appears. Review remuneration, contract terms, and start date. Click 'Accept Offer' or 'Decline'.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_08_OfferDecision.png"), "4.8", "Accept or decline job offer")

    # Process 4.5
    h_p45 = doc.add_heading("4.5 Interview Schedule & Alumni Sign Out", level=2)
    h_p45.paragraph_format.space_before = Pt(14)
    h_p45.paragraph_format.space_after = Pt(6)
    h_p45.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Interviews' (")
    p.add_run("/jobseeker/#/interviews").font.name = "Consolas"
    p.add_run(") to view confirmed corporate interviews, meeting credentials, and recruiter notes.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_09_InterviewSchedule.png"), "4.9", "View confirmed job interview schedule")

    p = doc.add_paragraph()
    p.add_run("2. Click the user avatar in the header navigation and select 'Sign Out' to securely disconnect.")
    add_figure(doc, os.path.join(IMG_DIR, "Graduate_10_SignOut.png"), "4.10", "Sign out from alumni account")

    doc.add_page_break()

    # =========================================================================
    # SECTION 5: SYSTEM ADMINISTRATOR PORTAL
    # =========================================================================
    h_s5 = doc.add_heading("Section 5: System Administrator / CIER Placement Office", level=1)
    h_s5.paragraph_format.space_before = Pt(12)
    h_s5.paragraph_format.space_after = Pt(10)
    h_s5.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    # Process 5.1
    h_p51 = doc.add_heading("5.1 Dedicated Admin Gateway & Executive Dashboard", level=2)
    h_p51.paragraph_format.space_before = Pt(10)
    h_p51.paragraph_format.space_after = Pt(6)
    h_p51.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. University placement administrators sign in via ")
    p.add_run("/login/admin-login").font.name = "Consolas"
    p.add_run(" using institutional administrative credentials.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_01_SignIn.png"), "5.1", "Enter administrative credentials to sign in")

    p = doc.add_paragraph()
    p.add_run("2. The Executive Placement Dashboard (")
    p.add_run("/admin/#/").font.name = "Consolas"
    p.add_run(") consolidates university-wide telemetry: Total Enrolled Trainees, Partner MOA Health, Placement Rates, and Active Pull-Out Petitions.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_02_Dashboard.png"), "5.2", "Executive university placement dashboard")

    # Process 5.2
    h_p52 = doc.add_heading("5.2 Student Body Management, Dual-Gate Promotion & Broadcasts", level=2)
    h_p52.paragraph_format.space_before = Pt(14)
    h_p52.paragraph_format.space_after = Pt(6)
    h_p52.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Students' (")
    p.add_run("/admin/#/students").font.name = "Consolas"
    p.add_run("). Audit the complete student directory across colleges, filtering by clearance readiness and hour completion.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_03_StudentsManagement.png"), "5.3", "Manage institutional student directory")

    p = doc.add_paragraph()
    p.add_run("2. Click 'Promote to Graduate'. The platform verifies Dual-Gate criteria (486 Hours + Company Evaluation). Confirming batch promotion instantly transitions students into Alumni status.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_04_PromoteGraduates.png"), "5.4", "Promote graduating cohort to alumni")

    p = doc.add_paragraph()
    p.add_run("3. Click 'Broadcast Notice'. CIER administrators can dispatch immediate pop-up announcements and SMS/email alerts to all active student cohorts.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_05_BroadcastNotice.png"), "5.5", "Dispatch university-wide broadcast notice")

    # Process 5.3
    h_p53 = doc.add_heading("5.3 Industry Partner Directory & MOA Accreditation", level=2)
    h_p53.paragraph_format.space_before = Pt(14)
    h_p53.paragraph_format.space_after = Pt(6)
    h_p53.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Companies' (")
    p.add_run("/admin/#/companies").font.name = "Consolas"
    p.add_run("). Inspect corporate partner statuses color-coded by MOA state: Active, Expiring Soon, Grace Period, or MOA Requested.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_06_CompaniesManagement.png"), "5.6", "Audit accredited industry partner directory")

    p = doc.add_paragraph()
    p.add_run("2. Click any pending partner to open MOA Review. Verify notarized MOA PDF contracts, effectivity start/end dates, and grant Active accreditation.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_07_MoaApproval.png"), "5.7", "Review and approve MOA accreditation")

    # Process 5.4
    h_p54 = doc.add_heading("5.4 OJT Program Governance & Dean Pull-Out Letters", level=2)
    h_p54.paragraph_format.space_before = Pt(14)
    h_p54.paragraph_format.space_after = Pt(6)
    h_p54.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'OJT Management' (")
    p.add_run("/admin/#/ojt").font.name = "Consolas"
    p.add_run("). Assign faculty supervisors to sections, balance faculty loads, and monitor ongoing internships.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_08_OjtGovernance.png"), "5.8", "Supervise campus-wide internship programs")

    p = doc.add_paragraph()
    p.add_run("2. In the OJT Pull-Out Requests section, click 'Review Letter'. The system generates the formal memorandum for the College Dean with one-click print and direct email dispatch.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_09_DeanPullOutLetter.png"), "5.9", "Generate official Dean pull-out letter")

    # Process 5.5
    h_p55 = doc.add_heading("5.5 Institutional Vacancy Auditing & Skills Matching", level=2)
    h_p55.paragraph_format.space_before = Pt(14)
    h_p55.paragraph_format.space_after = Pt(6)
    h_p55.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Jobs' (")
    p.add_run("/admin/#/jobs").font.name = "Consolas"
    p.add_run(") to audit all employment opportunities published by corporate partners across campuses.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_10_JobListings.png"), "5.10", "Audit institutional job postings")

    p = doc.add_paragraph()
    p.add_run("2. Navigate to 'Skills Matching' (")
    p.add_run("/admin/#/matching").font.name = "Consolas"
    p.add_run("). Inspect weighted parameters: Skills (35%), Course Alignment (30%), Proficiency (15%), Projects (15%), and Certifications (5%).")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_11_SkillsMatching.png"), "5.11", "Configure weighted talent matching algorithm")

    p = doc.add_paragraph()
    p.add_run("3. Click 'Run Matching' to compute candidate-to-position suitability rankings with granular factor breakdowns.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_12_MatchingRankings.png"), "5.12", "Review suitability rankings and scores")

    # Process 5.6
    h_p56 = doc.add_heading("5.6 Alumni Tracer Analytics, PEO Attainment & Sign Out", level=2)
    h_p56.paragraph_format.space_before = Pt(14)
    h_p56.paragraph_format.space_after = Pt(6)
    h_p56.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.add_run("1. Navigate to 'Reports & Analytics' (")
    p.add_run("/admin/#/reports").font.name = "Consolas"
    p.add_run("). Under the Career Tracer tab, inspect longitudinal employment rates, industry placement sectors, and salary distributions.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_13_AlumniTracerReports.png"), "5.13", "Analyze alumni career tracer metrics")

    p = doc.add_paragraph()
    p.add_run("2. Switch to the 'PEO Analytics' tab. Review circular telemetry gauges measuring CHED Program Educational Objectives attainment across graduating cohorts.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_14_PeoAnalytics.png"), "5.14", "Track CHED PEO attainment telemetry")

    p = doc.add_paragraph()
    p.add_run("3. To conclude administration, click 'Sign Out' on the sidebar navigation to terminate the secure session.")
    add_figure(doc, os.path.join(IMG_DIR, "Admin_15_SignOut.png"), "5.15", "Sign out from administrator console")

    doc.add_page_break()

    # =========================================================================
    # SECTION 6: ISSUES FOUND & TECHNICAL VERIFICATION REPORT
    # =========================================================================
    h_s6 = doc.add_heading("Section 6: Issues Found & QA Technical Observations", level=1)
    h_s6.paragraph_format.space_before = Pt(12)
    h_s6.paragraph_format.space_after = Pt(10)
    h_s6.runs[0].font.color.rgb = RGBColor(0x00, 0x59, 0x30)

    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.2
    p.paragraph_format.space_after = Pt(12)
    p.add_run(
        "During live operational testing of https://chmsu-hireme.vercel.app across all user roles and public access routes, "
        "the system demonstrated exceptional stability, zero blocking defects, and seamless integration between the frontend SPA and the Render cloud API. "
        "All user interfaces, modal dialogs, and navigation drawers have been verified in the standardized institutional Light Theme. "
        "The table below details technical observations, browser behaviors, and QA resolutions verified during manual walkthrough."
    )

    issues_tbl = doc.add_table(rows=1, cols=4)
    issues_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    issues_tbl.columns[0].width = Inches(1.3)
    issues_tbl.columns[1].width = Inches(1.5)
    issues_tbl.columns[2].width = Inches(1.0)
    issues_tbl.columns[3].width = Inches(2.7)
    set_table_borders(issues_tbl, color="CBD5E1", sz="4")

    ih_cells = issues_tbl.rows[0].cells
    set_cell_bg(ih_cells[0], "005930")
    set_cell_bg(ih_cells[1], "005930")
    set_cell_bg(ih_cells[2], "005930")
    set_cell_bg(ih_cells[3], "005930")
    for idx, col_name in enumerate(["Component / Area", "Observation Description", "Severity", "QA Verification & Status"]):
        set_cell_margins(ih_cells[idx], top=90, bottom=90, left=100, right=100)
        p = ih_cells[idx].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(col_name)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    issues_data = [
        (
            "Vercel Clean URLs",
            "Accessing /login/admin-login.html yielded a 404 page due to Vercel clean URL rewrite configuration.",
            "Low (Config)",
            "System correctly routes via clean path /login/admin-login and /login/onboarding without .html extensions. Verified functional."
        ),
        (
            "Data Privacy Terms Gate",
            "Newly provisioned or updated accounts trigger the #chmsu-terms-overlay compliance gate.",
            "Informational",
            "Fully compliant with RA 10173 and CHED CMO No. 104. Gate unlocks smoothly once checkbox is acknowledged."
        ),
        (
            "Faculty Provisioning Flow",
            "Admin creates supervisor with temporary password, triggering immediate change password overlay on first login.",
            "Informational",
            "Security best practice confirmed. Password transition from temporary to permanent verified live on API."
        ),
        (
            "SPA Hash Navigation",
            "Playwright networkidle waits occasionally timed out due to background telemetry heartbeats.",
            "Low (Testing)",
            "Resolved by binding test listeners to DOMContentLoaded and explicit UI state settles. Portal navigation is snappy."
        ),
        (
            "Dual-Gate Graduation",
            "Students cannot be promoted to Alumni until both 486 rendered hours and corporate evaluation are recorded.",
            "Compliance",
            "Integrity rule strictly enforced. Protects CHMSU placement credibility and accreditation standing."
        )
    ]

    for comp, obs, sev, stat in issues_data:
        row = issues_tbl.add_row()
        c0, c1, c2, c3 = row.cells[0], row.cells[1], row.cells[2], row.cells[3]
        for c in (c0, c1, c2, c3):
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(comp)
        r0.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(0x00, 0x59, 0x30)

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(obs)
        r1.font.size = Pt(9)
        r1.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(sev)
        r2.bold = True
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = RGBColor(0x92, 0x40, 0x0E) if "Low" in sev or "Informational" in sev else RGBColor(0x00, 0x59, 0x30)

        p3 = c3.paragraphs[0]
        p3.paragraph_format.space_before = Pt(0)
        p3.paragraph_format.space_after = Pt(0)
        r3 = p3.add_run(stat)
        r3.font.size = Pt(9)
        r3.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_callout(
        doc,
        "Conclusion & Operational Readiness",
        "The CHMSU HireMe web platform is production-ready across all functional modules. User authentication, clearance compliance, biometric tracking, corporate candidate screening, faculty endorsement, algorithmic matching, and executive tracer analytics operate in complete alignment with institutional requirements and CHED standards in 100% light mode."
    )

    doc.save(OUTPUT_FILE)
    print(f"User manual successfully created at: {OUTPUT_FILE}")

if __name__ == "__main__":
    create_manual()
