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
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#005930"))
            self.drawString(36, letter[1] - 26, "CHMSU HIREME - HOW TO USE THE SYSTEM (USER MANUAL)")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(letter[0] - 36, letter[1] - 26, "STEP-BY-STEP USER DIRECTIONS")
            
            # Line
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, letter[1] - 30, letter[0] - 36, letter[1] - 30)
            self.line(36, 30, letter[0] - 36, 30)
            
            # Footer
            self.drawString(36, 20, "Carlos Hilado Memorial State University (CHMSU) - Center for Industry & External Relations (CIER)")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 36, 20, page_text)
        else:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 30, letter[0] - 36, 30)
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(36, 20, "Carlos Hilado Memorial State University - Official Testing & User Guide")
            self.drawRightString(letter[0] - 36, 20, f"Page 1 of {page_count}")
        self.restoreState()

def build_pdf(filename="CHMSU_HireMe_User_Manual.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Colors
    c_primary = colors.HexColor("#005930")       # CHMSU Green
    c_primary_dark = colors.HexColor("#00381E")
    c_blue = colors.HexColor("#0284C7")
    c_dark = colors.HexColor("#0F172A")
    c_muted = colors.HexColor("#475569")
    c_border = colors.HexColor("#CBD5E1")
    c_bg_light = colors.HexColor("#F8FAFC")
    c_bg_card = colors.HexColor("#F1F5F9")
    
    t_cover = ParagraphStyle('TCover', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=c_primary, spaceAfter=3)
    t_sub = ParagraphStyle('TSub', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=13, textColor=c_muted, spaceAfter=8)
    
    role_title = ParagraphStyle('RTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=c_primary, spaceBefore=8, spaceAfter=4, keepWithNext=True)
    cred_style = ParagraphStyle('Cred', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=c_dark)
    step_head = ParagraphStyle('SHead', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=c_primary_dark, spaceBefore=4, spaceAfter=3, keepWithNext=True)
    step_body = ParagraphStyle('SBody', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=c_dark, spaceAfter=3)
    
    table_cell = ParagraphStyle('TCell', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9, textColor=c_dark)
    table_head = ParagraphStyle('THead', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=9, textColor=colors.white)
    
    story = []
    
    # Header Banner
    story.append(Paragraph("CARLOS HILADO MEMORIAL STATE UNIVERSITY", ParagraphStyle('Inst', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=c_muted)))
    story.append(Paragraph("Center for Industry & External Relations (CIER) &bull; College of Computer Studies", ParagraphStyle('Col', fontName='Helvetica', fontSize=8, leading=10, textColor=c_muted)))
    story.append(Spacer(1, 3))
    story.append(Paragraph("CHMSU HireMe: System User Manual & Step-by-Step Testing Guide", t_cover))
    story.append(Paragraph("A Clear, Practical Guide for All Users: Students, Companies, Supervisors, Graduates, and Admins", t_sub))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=8))
    
    def add_role_section(role_name, email, password, url, steps, cred_extra=None):
        content = []
        content.append(Paragraph(f"<b>{role_name}</b>", role_title))
        
        # Credentials Box
        if cred_extra:
            cred_data = [
                [Paragraph(f"<b>Live Login URL:</b> {url}", cred_style), Paragraph(f"<b>Pre-Deployment Student:</b> {email}", cred_style)],
                [Paragraph(f"<b>Password:</b> {password}", cred_style), Paragraph(f"<b>Active OJT Intern:</b> {cred_extra}", cred_style)]
            ]
        else:
            cred_data = [
                [Paragraph(f"<b>Live Login URL:</b> {url}", cred_style), Paragraph(f"<b>Test Account Email:</b> {email}", cred_style)],
                [Paragraph(f"<b>Password:</b> {password}", cred_style), Paragraph("<b>Status:</b> Ready for immediate login / testing", cred_style)]
            ]
        t_cred = Table(cred_data, colWidths=[270, 270])
        t_cred.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_card),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        content.append(t_cred)
        content.append(Spacer(1, 4))
        content.append(Paragraph("<b>Step-by-Step Directions:</b>", step_head))
        
        for i, s in enumerate(steps, 1):
            content.append(Paragraph(f"<b>Step {i}:</b> {s}", step_body))
            
        content.append(Spacer(1, 8))
        return KeepTogether(content)

    # 1. STUDENTS / OJT TRAINEES
    story.append(add_role_section(
        "Students / OJT Trainees",
        "vhanjhun.gimarangan@chmsu.edu.ph",
        "Demo@1234",
        "http://localhost:5173/login/ (or your live system URL)",
        [
            "Click the live URL link provided for the system (/login/).",
            "Log in using vhanjhun.gimarangan@chmsu.edu.ph (Pre-Deployment, Steps 3–6) or dave.salvador.bsit4b@chmsu.edu.ph (Active OJT Intern, Steps 7–9), with password Demo@1234.",
            "To test the digital portfolio builder, navigate to 'Portfolio' in the top menu and try adding or editing your education history, technical skills (with 0-100% sliders), achievements, or capstone project links.",
            "To test resume generation, click the 'Resume' tab on your portfolio, preview your ATS-formatted profile, and click 'Download PDF' to verify that an official CHMSU resume is created.",
            "To test pre-deployment clearance, locate the 'OJT Clearance Requirements' card on your portfolio, click 'Submit Requirements Drive', and paste your Google Drive folder link for coordinator review.",
            "To test OJT placement features, click 'OJT List' in the left menu, browse active host company postings, click on an opening, and click 'Express Interest' to submit an application message.",
            "To test attendance tracking, open the 'OJT Tracker' module and try clicking 'Time In (Morning)' or 'Time Out' to check the GPS geolocation verification behavior.",
            "To test exception and emergency requests, click the 'Emergency / Leave Notice' button on the tracker, select an emergency category, fill out the reason, and upload a dummy excuse document.",
            "To test trainee pull-out requests, click 'Request Pull-Out' on the tracker, select a valid ground, and submit a dummy formal pull-out letter."
        ],
        cred_extra="dave.salvador.bsit4b@chmsu.edu.ph"
    ))

    # 2. COMPANIES / HOST TRAINING ESTABLISHMENTS
    story.append(add_role_section(
        "Companies / Host Training Establishments (HTEs)",
        "hr@naahcompany.com",
        "Demo@1234",
        "http://localhost:5173/login/",
        [
            "Click the live URL link provided for the system (/login/).",
            "Log in using the company test account email and password given above.",
            "To test corporate profile setup, navigate to 'Profile' in the left menu and review or edit company overview, office address, workforce size, and Memorandum of Agreement (MOA) status.",
            "To test internship slot posting, click 'OJT Slots' in the left menu, click '+ Post New Slot', fill in the position title, target degree (e.g. BSIT), quota slots, allowance, and weekly shift hours, then click 'Publish Slot'.",
            "To test career job recruitment, navigate to 'Jobs', click '+ Post Job', enter a full-time job opening with required competencies and salary range, and publish it for graduates.",
            "To test candidate screening, click 'Applicants' in the left menu, review student applicants along with their algorithmic match scores (e.g. 88% Highly Recommended), and click 'View Portfolio' to inspect credentials.",
            "To test academic endorsement requests, click 'Request Endorsement Letter' on an applicant's card to alert their school supervisor for official clearance.",
            "To test interview scheduling, click 'Schedule Interview' on an endorsed applicant, choose an interview date/time, provide a Google Meet/Zoom link or office address, and send the invitation.",
            "To test trainee onboarding, click 'Accept Student' after interviews, and once coordinator clearance is granted, click 'Set Start Date & Instructions' to designate start date and assigned mentor.",
            "To test attendance auditing, navigate to 'OJT Trainees', select an active intern to view their Daily Time Record (DTR), and inspect clock-in/out timestamps with 'In Site' GPS badges.",
            "To test performance evaluation, click 'Evaluate' on a trainee nearing completion (after university rubric dispatch), rate them across Likert rubric criteria, and submit their appraisal."
        ]
    ))

    # 3. FACULTY SUPERVISORS / COORDINATORS
    story.append(add_role_section(
        "Faculty Supervisors / Academic Coordinators",
        "katenicolebermejooo@gmail.com",
        "Demo@1234",
        "http://localhost:5173/login/",
        [
            "Click the live URL link provided for the system (/login/).",
            "Log in using the supervisor test account email and password given above.",
            "To test class roster management, navigate to 'My Trainees' in the left menu to view enrolled students, or click 'Import Students (CSV)' and upload a class spreadsheet to test batch provisioning.",
            "To test pre-deployment clearance audits, find a student with a pending requirements packet, click 'Review Submission', inspect their Google Drive link, and click 'Approve Requirements' or 'Request Revision'.",
            "To test endorsement slip issuance, navigate to 'OJT Management' in the left menu, review company endorsement requests, verify MOA validity, and click 'Send Endorsement Letter' with your signed letter PDF.",
            "To test spatial trainee monitoring, click 'Monitoring Map' in the left menu to view the interactive Leaflet GIS map showing partner company branches and deployed trainee clusters across the province.",
            "To test attendance auditing, open any student's record under 'My Trainees' and inspect their Daily Time Record (DTR) calendar to audit GPS compliance, total rendered hours, and flagged exceptions.",
            "To test performance rubric dispatch, navigate to 'Evaluations', review standardized university grading criteria, select completed trainees, and click 'Dispatch Evaluation' to send appraisal forms to mentors.",
            "To test trainee pull-out reviews, look for pull-out alerts under 'My Trainees', click 'Review Pull-Out', inspect the student's statement and letter, and recommend it for Dean approval."
        ]
    ))

    # 4. GRADUATES / ALUMNI
    story.append(add_role_section(
        "Graduates / Alumni (Jobseekers)",
        "ron.delatorre.bsit2026@gmail.com",
        "Demo@1234",
        "http://localhost:5173/login/",
        [
            "Click the live URL link provided for the system (/login/).",
            "Log in using the graduate test account email and password given above.",
            "To test career onboarding and profile setup, verify that your degree, graduation year, and baseline employment status (e.g. Employed, Actively Looking) are correctly recorded.",
            "To test job vacancy discovery, navigate to 'Job Match' in the top menu, search by job title or competency keyword, and test filtering by full-time, part-time, or remote openings.",
            "To test application submission, click on a job opening, check your calculated match score percentage, click 'Apply Now', write a brief note to the employer, and click 'Submit Application'.",
            "To test application lifecycle tracking, navigate to 'My Applications' in the menu to track status progression through Applied, Reviewing, Shortlisted, Interview Scheduled, and Hired.",
            "To test interview attendance, navigate to 'Interviews' in the menu when an interview is scheduled to review the date, time, and click 'Join Meeting' to connect to the session.",
            "To test employment history tracking for tracer auditing, navigate to 'My Portfolio', open the 'Experience' section under the About tab, click '+ Add Experience', enter your post-graduation job role, employer, employment type, and start date, and save your career record."
        ]
    ))

    # 5. CIER PLACEMENT ADMIN
    story.append(add_role_section(
        "System Administrators / CIER Placement Office",
        "admin@chmsu.edu.ph",
        "Admin@CHMSU2026!",
        "http://localhost:5173/login/admin-login.html (Dedicated Gateway)",
        [
            "Click the dedicated administrator URL link provided for the system (/login/admin-login.html).",
            "Log in using the administrative credentials given above.",
            "To test institutional oversight, explore the 'Dashboard' to review university-wide statistics on total active students, accredited partner establishments, active OJT placements, and overall placement rate.",
            "To test company accreditation and MOA management, navigate to 'Companies' in the left menu, select a company under 'MOA Review', set partnership validity dates, upload signed MOA PDF, and click 'Upload & Approve MOA Partnership'.",
            "To test student cohort management, navigate to 'Students' in the left menu, inspect the roster, test importing student CSV files, and test 'Promote to Graduate' to transition graduating seniors to alumni.",
            "To test Dean-level pull-out authorization, navigate to 'OJT Management', locate 'OJT Pull-Out Requests & Dean Endorsement', click 'Process' on a recommended request, preview the official letter, and test 'Print Official Letter' or 'Email to Dean'.",
            "To test campus-wide announcements, go to 'Students' > click 'Broadcast Announcement', enter a subject title and message, select the target student group, and broadcast the alert.",
            "To test algorithmic candidate matching, navigate to 'Matching & Scoring' in the left menu and run 'Run Matching' to view candidate suitability rankings for partner company openings.",
            "To test institutional compliance reporting, navigate to 'Alumni Tracker' in the left menu (route: /reports) to review interactive PEO Attainment Analytics and longitudinal Career Trajectory & Tracer progression across graduation cohorts."
        ]
    ))
    
    # Process Verification Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>System Role Coverage & Verification Summary</b>", step_head))
    cov_data = [
        [Paragraph("User Role", table_head), Paragraph("Test Login Email", table_head), Paragraph("Password", table_head), Paragraph("Portal Path", table_head), Paragraph("Status", table_head)],
        [Paragraph("Student (Pre-Deployment)", table_cell), Paragraph("vhanjhun.gimarangan@chmsu.edu.ph", table_cell), Paragraph("Demo@1234", table_cell), Paragraph("/main/#/", table_cell), Paragraph("Verified", table_cell)],
        [Paragraph("Active OJT Intern", table_cell), Paragraph("dave.salvador.bsit4b@chmsu.edu.ph", table_cell), Paragraph("Demo@1234", table_cell), Paragraph("/main/#/", table_cell), Paragraph("Verified", table_cell)],
        [Paragraph("Company / Employer", table_cell), Paragraph("hr@naahcompany.com", table_cell), Paragraph("Demo@1234", table_cell), Paragraph("/company/#/", table_cell), Paragraph("Verified", table_cell)],
        [Paragraph("Faculty Supervisor", table_cell), Paragraph("katenicolebermejooo@gmail.com", table_cell), Paragraph("Demo@1234", table_cell), Paragraph("/supervisors/#/", table_cell), Paragraph("Verified", table_cell)],
        [Paragraph("Graduate / Alumni", table_cell), Paragraph("ron.delatorre.bsit2026@gmail.com", table_cell), Paragraph("Demo@1234", table_cell), Paragraph("/jobseeker/", table_cell), Paragraph("Verified", table_cell)],
        [Paragraph("CIER Admin Director", table_cell), Paragraph("admin@chmsu.edu.ph", table_cell), Paragraph("Admin@CHMSU2026!", table_cell), Paragraph("/admin/#/", table_cell), Paragraph("Verified", table_cell)],
    ]
    t_cov = Table(cov_data, colWidths=[115, 170, 95, 85, 75])
    t_cov.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_cov)
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully compiled {filename}")

if __name__ == "__main__":
    build_pdf()
