/**
 * CHMSU HireMe — Universal Terms of Service & Privacy Policy Component
 * Compliant with Republic Act No. 10173 (Data Privacy Act of 2012)
 * and CHMSU Center for Internationalization and External Relations (CIER) OJT Guidelines.
 *
 * Supports two distinct modes:
 * 1. Gate Mode (gateMode: true):
 *    - Un-dismissible blocking modal for users with has_accepted_terms === false.
 *    - Required agreement checkbox.
 *    - Calls POST /api/auth/accept-terms and updates local session on acceptance.
 *    - Provides "Decline & Sign Out" option.
 * 2. Reader Mode (gateMode: false):
 *    - Non-blocking preview modal for public landing page, registration form links, or footer.
 *    - Has close button and backdrop dismissal.
 */

let activeTermsModal = null;

const TERMS_VERSION = '1.0';

/* ─────────────────────────────────────────────────────────────
   LEGAL TEXT CONTENT
   ───────────────────────────────────────────────────────────── */
const LEGAL_CONTENT = {
  terms: {
    title: 'Terms of Service',
    badge: `Version ${TERMS_VERSION} • Effective Academic Year 2026`,
    sections: [
      {
        num: '1',
        heading: 'Agreement to Terms & Institutional Scope',
        content: `Welcome to CHMSU HireMe, the official On-the-Job Training (OJT), Career Placement, and Alumni Career Tracking platform of Carlos Hilado Memorial State University ("CHMSU", "University", "we", "us", or "our").

By creating an account, accessing, or using this platform as a Student, Alumni/Jobseeker, Faculty Internship Supervisor, Company Partner Employer, or Administrator, you acknowledge that you have read, understood, and legally agree to be bound by these Terms of Service. These Terms operate in harmony with CHMSU University Student Handbook, CHED Memorandum Order (CMO) No. 104, Series of 2017 (Revised Guidelines for Student Internship Program in the Philippines - SIPP), and existing laws of the Republic of the Philippines.`
      },
      {
        num: '2',
        heading: 'Account Integrity, Verification & Security',
        content: `• Student & Alumni Accounts: Students and alumni must register using authentic academic records, valid contact information, and their assigned CHMSU credentials. Impersonation of other students or falsification of academic year levels, student ID numbers, or program affiliations is strictly prohibited.
• Host Training Establishments (HTEs) / Companies: Partner companies must be legitimate business entities possessing valid business permits, SEC/DTI registrations, and must execute a formal Memorandum of Agreement (MOA) with CHMSU prior to deploying students.
• Password & Account Security: You are solely responsible for preserving the confidentiality of your login credentials. Any activity conducted under your credentials shall be attributed to you. If you suspect unauthorized access, notify the CIER office or university system administrators immediately.`
      },
      {
        num: '3',
        heading: 'OJT Deployment, Matching & SIPP Guidelines',
        content: `• The platform facilitates internship discovery, applications, supervisor endorsements, and requirement tracking.
• Application Acceptance: An accepted application on CHMSU HireMe constitutes an institutional endorsement subject to formal confirmation by the College OJT Supervisor and CIER Coordinator.
• Student Obligations: Trainees must adhere to workplace health, safety, ethical standards, and confidentiality rules set by the Host Training Establishment during the full duration of their prescribed internship hours (e.g., 600 hours for BSIT or as designated by curriculum).`
      },
      {
        num: '4',
        heading: 'GPS Geofencing & Mandatory Attendance Rules',
        content: `• Geofenced Time-In and Time-Out: To ensure absolute attendance integrity and satisfy CHED audit standards, CHMSU HireMe enforces strict GPS geofencing. Students may only record Time-In and Time-Out when their device's physical coordinates fall within the officially registered 100-meter radius of the Host Training Establishment's training site.
• Prohibition of GPS Manipulation: Any attempt to spoof, fake, bypass, or manipulate geographic coordinates using third-party mock location apps, VPNs, emulator software, or proxy log-ins constitutes severe academic dishonesty.
• Disciplinary Sanctions: Fraudulent attendance entries will result in immediate invalidation of logged hours, reporting to the College Dean and Student Disciplinary Board, and potential failure of the OJT course.`
      },
      {
        num: '5',
        heading: 'Employer & Supervisor Ethical Responsibilities',
        content: `• Partner Employers agree to provide genuine, substantive technical learning experiences aligned with the student's program curriculum, refrain from hazardous or purely menial assignments, and submit fair, objective performance evaluations.
• Non-Discrimination & Equal Opportunity: Employers agree not to discriminate against any applicant or intern on grounds of race, gender, socio-economic background, religious beliefs, or physical abilities.
• Supervisors agree to regularly monitor intern activities, review digital logsheets, conduct periodic on-site or remote check-ins, and validate trainee attendance in an expeditious manner.`
      },
      {
        num: '6',
        heading: 'Intellectual Property Rights',
        content: `• University Assets: All software code, graphical user interfaces, trademarks, CHMSU logos, and system architecture are the exclusive intellectual property of Carlos Hilado Memorial State University.
• Student Portfolio & Artifacts: Students retain ownership of their personal portfolio projects, resumes, and code samples uploaded to the platform, granting CHMSU a non-exclusive license to display these materials to approved partner companies for training and employment matching purposes.`
      },
      {
        num: '7',
        heading: 'Modifications, Suspension & Termination',
        content: `CHMSU reserves the right to amend, update, or revise these Terms at any time to reflect legislative updates, institutional policy shifts, or technological enhancements. Continued use of the platform after updates constitutes acceptance of the modified Terms. The University reserves the right to suspend or terminate accounts that breach these Terms or compromise platform safety.`
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy & Data Processing Notice',
    badge: 'Compliant with Philippine Data Privacy Act of 2012 (R.A. 10173)',
    sections: [
      {
        num: '1',
        heading: 'Commitment to Data Privacy',
        content: `Carlos Hilado Memorial State University is firmly committed to protecting your personal data, privacy, and sensitive personal information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations (IRR), and all circulars issued by the National Privacy Commission (NPC).

This Privacy Policy explains what personal data CHMSU HireMe collects, how it is processed, protected, retained, and the rights you possess as a registered Data Subject.`
      },
      {
        num: '2',
        heading: 'Data We Collect & Process',
        content: `Depending on your platform role, CHMSU HireMe collects and processes the following categories of data:
• Student & Alumni Data: Full name, student ID number, institutional/personal email address, contact number, permanent/current home address, college degree program, year level, academic status, resume, skills, emergency contact details, and uploaded verification documents.
• Partner Company / Employer Data: Company legal business name, trade name, SEC/DTI registration number, business address, company profile, official website, contact person name, designation, corporate email address, contact number, and Memorandum of Agreement (MOA) documents.
• Faculty Supervisor Data: Full name, university employee credentials, department, academic title, and institutional email.
• System & Log Data: IP address, device user agent, session timestamps, and audit log records.`
      },
      {
        num: '3',
        heading: 'Geolocation & GPS Data Processing for OJT Attendance',
        content: `• Explicit GPS Collection: During the exact moments when a student activates the "Time-In" or "Time-Out" action within the OJT Tracker, the platform captures the device's instantaneous geographic coordinates (latitude, longitude, and accuracy radius).
• Specific Purpose: This location data is processed exclusively to compute mathematical distance relative to the Host Training Establishment's registered coordinates and verify that the student is physically within the authorized 100-meter training perimeter.
• No Continuous Surveillance: CHMSU HireMe does NOT track, harvest, or record continuous location or background movement once the attendance transaction is submitted. Your location is never sold, broadcast publicly, or processed for commercial analytics.`
      },
      {
        num: '4',
        heading: 'Purposes of Data Processing',
        content: `Your data is collected and processed solely for legitimate educational and institutional objectives, including:
1. Facilitating OJT placement, company matching, and interview coordination.
2. Accurately tracking, verifying, and computing internship hours toward degree graduation.
3. Conducting supervisor and employer competency evaluations.
4. Monitoring alumni career outcomes, job placements, and national accreditation reporting.
5. Verifying user authenticity and maintaining platform information security.`
      },
      {
        num: '5',
        heading: 'Data Sharing & Third-Party Disclosure',
        content: `Your data is treated with strict confidentiality. It is shared strictly on a need-to-know basis:
• Student resumes and profiles are made accessible only to verified partner companies to which the student has voluntarily applied or been matched by CIER.
• Trainee performance reviews and attendance records are accessible strictly to the student, their assigned faculty supervisor, and authorized CIER coordinators.
• CHMSU will never sell, lease, monetize, or disclose your personal data to unauthorized third parties unless required by statutory legal orders or judicial mandates.`
      },
      {
        num: '6',
        heading: 'Data Security, Retention & Storage',
        content: `We implement rigorous technical, organizational, and physical safeguards:
• Transport Layer Security (TLS/HTTPS) encryption for all client-server communications.
• Strict role-based access control (RBAC) and hashed authentication tokens.
• Database storage hosted on secure university servers with automated backup protocols.
• Retention Period: Personal and academic training data are retained in conformity with the CHMSU University Records Management Policy and National Archives of the Philippines guidelines.`
      },
      {
        num: '7',
        heading: 'Your Rights as a Data Subject',
        content: `Under the Philippine Data Privacy Act of 2012, you possess the following statutory rights:
• Right to be Informed regarding how your data is collected and processed.
• Right to Access your personal records and attendance logs upon request.
• Right to Rectification of inaccurate, obsolete, or incomplete personal data.
• Right to Erasure or Blocking under grounds recognized by the NPC.
• Right to File a Complaint with the National Privacy Commission (NPC) if you feel your privacy rights have been violated.

For privacy inquiries, rights assertion, or concerns, please contact the University Data Protection Officer at:
Data Protection Office (DPO)
Carlos Hilado Memorial State University — Talisay City Campus, Negros Occidental
Email: dpo@chmsu.edu.ph | Phone: (034) 712-0005`
      }
    ]
  }
};

/* ─────────────────────────────────────────────────────────────
   CSS INJECTION (Scoped, Self-Contained & Responsive)
   ───────────────────────────────────────────────────────────── */
function injectTermsStyles() {
  if (document.getElementById('chmsu-terms-policy-styles')) return;

  const style = document.createElement('style');
  style.id = 'chmsu-terms-policy-styles';
  style.textContent = `
    .chmsu-legal-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(10, 25, 18, 0.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      animation: chmsuLegalFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
    }

    @keyframes chmsuLegalFadeIn {
      to { opacity: 1; }
    }

    .chmsu-legal-card {
      position: relative;
      background: #FFFFFF;
      color: #1F2937;
      width: 100%;
      max-width: 820px;
      max-height: min(92vh, 840px);
      border-radius: 20px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 89, 48, 0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(18px) scale(0.98);
      animation: chmsuLegalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      box-sizing: border-box;
    }

    @keyframes chmsuLegalSlideUp {
      to {
        transform: translateY(0) scale(1);
      }
    }

    /* Top Brand Header */
    .chmsu-legal-header {
      padding: 1.25rem 1.75rem 1rem;
      background: linear-gradient(135deg, #005930 0%, #004526 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-bottom: 2px solid rgba(217, 119, 6, 0.35);
      flex-shrink: 0;
    }

    .chmsu-legal-header__branding {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .chmsu-legal-header__seal {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.15);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .chmsu-legal-header__title-group h2 {
      margin: 0;
      font-size: 1.18rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chmsu-legal-header__badge {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(217, 119, 6, 0.35);
      color: #FDE68A;
      border: 1px solid rgba(217, 119, 6, 0.5);
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
    }

    .chmsu-legal-header__sub {
      margin: 0.2rem 0 0;
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.82);
    }

    .chmsu-legal-header__close-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.18s ease;
      flex-shrink: 0;
    }

    .chmsu-legal-header__close-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }

    /* Tabs Bar */
    .chmsu-legal-tabs {
      display: flex;
      padding: 0.75rem 1.75rem;
      background: #F9FAFB;
      border-bottom: 1px solid #E5E7EB;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .chmsu-legal-tab-btn {
      flex: 1;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      border: 1.5px solid #E5E7EB;
      background: #FFFFFF;
      color: #4B5563;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      user-select: none;
    }

    .chmsu-legal-tab-btn:hover {
      border-color: #005930;
      color: #005930;
    }

    .chmsu-legal-tab-btn--active {
      background: #005930;
      border-color: #005930;
      color: #FFFFFF !important;
      box-shadow: 0 3px 10px rgba(0, 89, 48, 0.22);
    }

    /* Notice Pill Banner (Highlights GPS Geofence and DPA) */
    .chmsu-legal-banner {
      margin: 1rem 1.75rem 0;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1E40AF;
      font-size: 0.8rem;
      line-height: 1.45;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    .chmsu-legal-banner__icon {
      font-size: 1.15rem;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .chmsu-legal-banner strong {
      color: #1E3A8A;
      font-weight: 600;
    }

    /* Scrollable Body */
    .chmsu-legal-body {
      padding: 1.25rem 1.75rem;
      overflow-y: auto;
      flex: 1;
      overscroll-behavior: contain;
      scroll-behavior: smooth;
    }

    .chmsu-legal-body::-webkit-scrollbar {
      width: 7px;
    }

    .chmsu-legal-body::-webkit-scrollbar-track {
      background: #F3F4F6;
    }

    .chmsu-legal-body::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 4px;
    }

    .chmsu-legal-body::-webkit-scrollbar-thumb:hover {
      background: #94A3B8;
    }

    .chmsu-legal-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px dashed #E5E7EB;
    }

    .chmsu-legal-section:last-child {
      border-bottom: none;
      margin-bottom: 0.5rem;
    }

    .chmsu-legal-section__title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chmsu-legal-section__num {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #E8F5E9;
      color: #005930;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .chmsu-legal-section__text {
      font-size: 0.85rem;
      color: #4B5563;
      line-height: 1.68;
      white-space: pre-line;
      margin: 0;
    }

    /* Bottom Confirmation / Gate Footer */
    .chmsu-legal-footer {
      padding: 1.25rem 1.75rem;
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .chmsu-legal-gate-group {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #FFFFFF;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1.5px solid #D1D5DB;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .chmsu-legal-gate-group:hover {
      border-color: #005930;
      background: #F0FDF4;
    }

    .chmsu-legal-gate-group input[type="checkbox"] {
      width: 19px;
      height: 19px;
      margin-top: 2px;
      accent-color: #005930;
      cursor: pointer;
      flex-shrink: 0;
    }

    .chmsu-legal-gate-group__text {
      font-size: 0.84rem;
      line-height: 1.5;
      color: #374151;
      font-weight: 500;
    }

    .chmsu-legal-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .chmsu-legal-btn {
      padding: 0.72rem 1.4rem;
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
      user-select: none;
    }

    .chmsu-legal-btn--decline {
      background: transparent;
      color: #6B7280;
      border: 1px solid #D1D5DB;
    }

    .chmsu-legal-btn--decline:hover {
      background: #FEE2E2;
      color: #DC2626;
      border-color: #F87171;
    }

    .chmsu-legal-btn--primary {
      background: linear-gradient(135deg, #005930 0%, #004526 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(0, 89, 48, 0.28);
      flex: 1;
    }

    .chmsu-legal-btn--primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #006D3B 0%, #005930 100%);
      box-shadow: 0 6px 18px rgba(0, 89, 48, 0.35);
      transform: translateY(-1px);
    }

    .chmsu-legal-btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .chmsu-legal-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: chmsuLegalSpin 0.7s linear infinite;
      display: inline-block;
    }

    @keyframes chmsuLegalSpin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .chmsu-legal-card {
        max-height: 96vh;
        border-radius: 16px;
      }
      .chmsu-legal-header {
        padding: 1rem 1.25rem;
      }
      .chmsu-legal-tabs {
        padding: 0.5rem 1.25rem;
      }
      .chmsu-legal-body {
        padding: 1rem 1.25rem;
      }
      .chmsu-legal-banner {
        margin: 0.75rem 1.25rem 0;
      }
      .chmsu-legal-footer {
        padding: 1rem 1.25rem;
      }
      .chmsu-legal-actions {
        flex-direction: column-reverse;
      }
      .chmsu-legal-btn {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────────────────────
   MODAL RENDERER
   ───────────────────────────────────────────────────────────── */
export function openTermsModal({
  initialTab = 'terms',
  gateMode = false,
  user = null,
  onAccept = null,
} = {}) {
  // If modal is already showing, return
  if (activeTermsModal) return activeTermsModal;

  injectTermsStyles();

  let currentTab = initialTab === 'privacy' ? 'privacy' : 'terms';

  const overlay = document.createElement('div');
  overlay.className = 'chmsu-legal-overlay';
  overlay.id = 'chmsu-terms-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  function renderContent(tabKey) {
    const data = LEGAL_CONTENT[tabKey];
    return `
      <div class="chmsu-legal-section" style="border-bottom: 2px solid #E5E7EB; margin-bottom: 1.25rem;">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem; color: #005930; font-weight: 700;">${data.title}</h3>
        <p style="margin: 0; font-size: 0.76rem; color: #6B7280; font-weight: 500;">${data.badge}</p>
      </div>
      ${data.sections.map(s => `
        <div class="chmsu-legal-section">
          <div class="chmsu-legal-section__title">
            <span class="chmsu-legal-section__num">${s.num}</span>
            <span>${s.heading}</span>
          </div>
          <p class="chmsu-legal-section__text">${s.content}</p>
        </div>
      `).join('')}
    `;
  }

  overlay.innerHTML = `
    <div class="chmsu-legal-card">
      <!-- Header -->
      <div class="chmsu-legal-header">
        <div class="chmsu-legal-header__branding">
          <div class="chmsu-legal-header__seal">🏛️</div>
          <div class="chmsu-legal-header__title-group">
            <h2>
              <span>CHMSU HireMe Legal Framework</span>
              <span class="chmsu-legal-header__badge">v${TERMS_VERSION}</span>
            </h2>
            <p class="chmsu-legal-header__sub">Carlos Hilado Memorial State University • CIER Guidelines</p>
          </div>
        </div>
        ${!gateMode ? `
          <button class="chmsu-legal-header__close-btn" id="btn-legal-close" aria-label="Close modal">✕</button>
        ` : ''}
      </div>

      <!-- Tabs Bar -->
      <div class="chmsu-legal-tabs">
        <button class="chmsu-legal-tab-btn ${currentTab === 'terms' ? 'chmsu-legal-tab-btn--active' : ''}" id="tab-btn-terms">
          📄 Terms of Service
        </button>
        <button class="chmsu-legal-tab-btn ${currentTab === 'privacy' ? 'chmsu-legal-tab-btn--active' : ''}" id="tab-btn-privacy">
          🛡️ Privacy Policy (R.A. 10173)
        </button>
      </div>

      <!-- Quick OJT & Geofence Notice Banner -->
      <div class="chmsu-legal-banner">
        <span class="chmsu-legal-banner__icon">📍</span>
        <div>
          <strong>Mandatory OJT GPS Verification & Privacy Notice:</strong> In compliance with the Philippine Data Privacy Act of 2012 (R.A. 10173) and CHED SIPP standards, CHMSU HireMe captures instantaneous GPS coordinates exclusively during Time-In and Time-Out to verify physical presence within the 100-meter Host Training Establishment radius. Continuous tracking is strictly disabled.
        </div>
      </div>

      <!-- Content Body -->
      <div class="chmsu-legal-body" id="chmsu-legal-body">
        ${renderContent(currentTab)}
      </div>

      <!-- Footer -->
      <div class="chmsu-legal-footer">
        ${gateMode ? `
          <label class="chmsu-legal-gate-group">
            <input type="checkbox" id="gate-agree-checkbox" />
            <span class="chmsu-legal-gate-group__text">
              I have read, understood, and accept both the <strong>CHMSU HireMe Terms of Service</strong> and the <strong>Privacy Policy</strong>, including the use of GPS geofencing for OJT attendance verification.
            </span>
          </label>
          <div class="chmsu-legal-actions">
            <button class="chmsu-legal-btn chmsu-legal-btn--decline" id="btn-gate-decline">
              Decline & Sign Out
            </button>
            <button class="chmsu-legal-btn chmsu-legal-btn--primary" id="btn-gate-accept" disabled>
              <span id="gate-accept-label">Accept & Continue</span>
            </button>
          </div>
        ` : `
          <div style="display: flex; justify-content: flex-end;">
            <button class="chmsu-legal-btn chmsu-legal-btn--primary" id="btn-legal-done" style="flex: initial; min-width: 140px;">
              Close Viewer
            </button>
          </div>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeTermsModal = overlay;

  // Tab switching handlers
  const tabTerms = overlay.querySelector('#tab-btn-terms');
  const tabPrivacy = overlay.querySelector('#tab-btn-privacy');
  const bodyEl = overlay.querySelector('#chmsu-legal-body');

  function switchTab(tabKey) {
    currentTab = tabKey;
    if (tabKey === 'terms') {
      tabTerms?.classList.add('chmsu-legal-tab-btn--active');
      tabPrivacy?.classList.remove('chmsu-legal-tab-btn--active');
    } else {
      tabPrivacy?.classList.add('chmsu-legal-tab-btn--active');
      tabTerms?.classList.remove('chmsu-legal-tab-btn--active');
    }
    if (bodyEl) {
      bodyEl.innerHTML = renderContent(tabKey);
      bodyEl.scrollTop = 0;
    }
  }

  tabTerms?.addEventListener('click', () => switchTab('terms'));
  tabPrivacy?.addEventListener('click', () => switchTab('privacy'));

  // Close handlers for non-gate mode
  function closeModal() {
    overlay.remove();
    activeTermsModal = null;
    document.removeEventListener('keydown', handleEsc);
  }

  function handleEsc(e) {
    if (e.key === 'Escape' && !gateMode) {
      closeModal();
    }
  }

  if (!gateMode) {
    overlay.querySelector('#btn-legal-close')?.addEventListener('click', closeModal);
    overlay.querySelector('#btn-legal-done')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', handleEsc);
  } else {
    // Gate mode: checkbox toggle
    const chk = overlay.querySelector('#gate-agree-checkbox');
    const acceptBtn = overlay.querySelector('#btn-gate-accept');
    const acceptLbl = overlay.querySelector('#gate-accept-label');
    const declineBtn = overlay.querySelector('#btn-gate-decline');

    chk?.addEventListener('change', () => {
      if (acceptBtn) acceptBtn.disabled = !chk.checked;
    });

    declineBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to decline? You cannot access the CHMSU HireMe portal without accepting the institutional Terms of Service and Privacy Policy.')) {
        localStorage.removeItem('hireme_token');
        localStorage.removeItem('hireme_user');
        localStorage.removeItem('hireme_company_user');
        sessionStorage.clear();
        window.location.href = '../login/';
      }
    });

    acceptBtn?.addEventListener('click', async () => {
      if (!chk?.checked) return;

      acceptBtn.disabled = true;
      if (acceptLbl) acceptLbl.innerHTML = '<span class="chmsu-legal-spinner"></span> Recording agreement…';

      try {
        const token = localStorage.getItem('hireme_token');
        const res = await fetch('/api/auth/accept-terms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ version: TERMS_VERSION }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Update cached users in localStorage
          const cachedUser = localStorage.getItem('hireme_user');
          if (cachedUser) {
            try {
              const u = JSON.parse(cachedUser);
              u.has_accepted_terms = true;
              u.terms_accepted_at = data.user?.terms_accepted_at || new Date().toISOString();
              u.terms_version = TERMS_VERSION;
              localStorage.setItem('hireme_user', JSON.stringify(u));
            } catch (_) {}
          }

          const cachedComp = localStorage.getItem('hireme_company_user');
          if (cachedComp) {
            try {
              const cu = JSON.parse(cachedComp);
              cu.has_accepted_terms = true;
              cu.terms_accepted_at = data.user?.terms_accepted_at || new Date().toISOString();
              cu.terms_version = TERMS_VERSION;
              localStorage.setItem('hireme_company_user', JSON.stringify(cu));
            } catch (_) {}
          }

          if (acceptLbl) acceptLbl.innerHTML = '✓ Agreement Recorded!';
          acceptBtn.style.background = '#10B981';

          setTimeout(() => {
            closeModal();
            if (typeof onAccept === 'function') {
              onAccept(data);
            }
          }, 600);
        } else {
          throw new Error(data.message || 'Failed to record terms acceptance.');
        }
      } catch (err) {
        console.error('[CHMSU Legal] Accept terms failed:', err);
        alert(err.message || 'Unable to record your acceptance at this time. Please check your internet connection.');
        acceptBtn.disabled = false;
        if (acceptLbl) acceptLbl.textContent = 'Accept & Continue';
      }
    });
  }

  return overlay;
}

/**
 * Convenience method for public / reader link opens
 */
export function openTermsReader(initialTab = 'terms') {
  return openTermsModal({ initialTab, gateMode: false });
}

/**
 * Universal Gate Checker for Authenticated Portals
 * Call inside initAuth() or initApp(). If user hasn't accepted terms, blocks UI.
 */
export function checkAndEnforceTermsGate(user, onAccepted) {
  if (!user) return;

  const hasAccepted = Boolean(user.has_accepted_terms) || Boolean(user.terms_accepted_at);

  if (!hasAccepted) {
    openTermsModal({
      gateMode: true,
      initialTab: 'terms',
      user,
      onAccept: (res) => {
        if (typeof onAccepted === 'function') {
          onAccepted(res);
        }
      },
    });
  }
}
