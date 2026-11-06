import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';
const OUT_DIR = path.resolve('manual_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const issuesFound = [];
function recordIssue(context, message) {
  issuesFound.push({ context, message, time: new Date().toISOString() });
  console.warn(`[ISSUE] ${context}: ${message}`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function highlight(page, selector, label = null) {
  try {
    await page.evaluate(({ sel, lbl }) => {
      document.querySelectorAll('.manual-highlight-box').forEach(el => el.remove());
      const target = document.querySelector(sel);
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      const box = document.createElement('div');
      box.className = 'manual-highlight-box';
      box.style.position = 'fixed';
      box.style.left = `${Math.max(0, rect.left - 4)}px`;
      box.style.top = `${Math.max(0, rect.top - 4)}px`;
      box.style.width = `${rect.width + 8}px`;
      box.style.height = `${rect.height + 8}px`;
      box.style.border = '3px solid #005930';
      box.style.boxShadow = '0 0 15px rgba(0, 89, 48, 0.6), inset 0 0 10px rgba(0, 89, 48, 0.2)';
      box.style.borderRadius = '8px';
      box.style.pointerEvents = 'none';
      box.style.zIndex = '999999';
      
      if (lbl) {
        const tag = document.createElement('span');
        tag.textContent = lbl;
        tag.style.position = 'absolute';
        tag.style.top = '-24px';
        tag.style.left = '0';
        tag.style.background = '#005930';
        tag.style.color = '#ffffff';
        tag.style.fontSize = '12px';
        tag.style.fontWeight = 'bold';
        tag.style.padding = '2px 8px';
        tag.style.borderRadius = '4px';
        box.appendChild(tag);
      }
      
      document.body.appendChild(box);
    }, { sel: selector, lbl: label });
    await sleep(250);
  } catch (err) {
    // Non-critical
  }
}

async function clearHighlight(page) {
  try {
    await page.evaluate(() => {
      document.querySelectorAll('.manual-highlight-box').forEach(el => el.remove());
    });
  } catch (_) {}
}

async function snap(page, filename) {
  const filePath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[SAVED] ${filename}`);
  await clearHighlight(page);
}

async function maskPii(page) {
  try {
    await page.evaluate(() => {
      document.querySelectorAll('.student-id, .user-phone, .contact-phone').forEach(el => {
        el.style.filter = 'blur(4px)';
      });
    });
  } catch (_) {}
}

async function clearSession(page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await sleep(200);
  } catch (_) {}
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // ══════════════════════════════════════════════════════════════════
  // SECTION 0: PUBLIC & ONBOARDING (Part 2: Details)
  // ══════════════════════════════════════════════════════════════════
  console.log('=== VERIFYING SECTION 0 ONBOARDING DETAILS ===');
  await page.goto(`${BASE_URL}/login/onboarding`, { waitUntil: 'networkidle' });
  await sleep(1000);
  const studentRole = await page.$('.ob-role[data-role="student"]');
  if (studentRole) {
    await studentRole.click();
    await sleep(400);
    const nextBtn = await page.$('#next-btn');
    if (nextBtn) {
      await nextBtn.click();
      await sleep(800);
      await highlight(page, '.ob-form', 'Academic Information Form');
      await snap(page, 'Public_05_OnboardingDetails.png');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 1: STUDENT / OJT TRAINEE PORTAL
  // Account: dave.salvador.bsit4b@chmsu.edu.ph / Demo@1234
  // ══════════════════════════════════════════════════════════════════
  console.log('=== STARTING SECTION 1: STUDENT PORTAL ===');
  await clearSession(page);
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'networkidle' });
  await sleep(800);

  // 1.1 Sign In
  await page.fill('#email', 'dave.salvador.bsit4b@chmsu.edu.ph');
  await page.fill('#password', 'Demo@1234');
  await highlight(page, '#submit-btn', 'Sign In');
  await snap(page, 'Student_01_SignIn.png');

  // Submit and handle redirect
  await page.click('#submit-btn');
  await page.waitForURL('**/main/**', { timeout: 15000 }).catch(e => recordIssue('Student Login', e.message));
  await sleep(2000);

  // 1.2 Terms Gate check
  const termsModal = await page.$('.terms-gate-overlay, #terms-modal, [class*="terms-modal"]');
  if (termsModal && await termsModal.isVisible()) {
    await highlight(page, '#btn-accept-terms, .terms-accept-btn', 'Accept Terms');
    await snap(page, 'Student_02_TermsGate.png');
    const acceptBtn = await page.$('#btn-accept-terms, .terms-accept-btn');
    if (acceptBtn) await acceptBtn.click();
    await sleep(1500);
  } else {
    // If already accepted, snap clean dashboard as 02/03
    console.log('Terms gate already accepted for this session');
  }

  // 1.3 Dashboard
  await highlight(page, '.stat-card, .progress-card, .welcome-banner', 'Trainee Overview');
  await snap(page, 'Student_03_Dashboard.png');

  // 1.4 Portfolio Overview
  await page.goto(`${BASE_URL}/main/#/portfolio`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.profile-hero, .portfolio-hero, .about-section', 'Student Bio & Education');
  await snap(page, 'Student_04_PortfolioOverview.png');

  // 1.5 Portfolio Skills & Projects
  const skillsElem = await page.$('.skills-grid, .skills-section, .projects-grid');
  if (skillsElem) {
    await skillsElem.scrollIntoViewIfNeeded();
    await sleep(500);
    await highlight(page, '.skills-grid, .skills-section', 'Competency Sliders & Badges');
    await snap(page, 'Student_05_PortfolioSkills.png');
  } else {
    await snap(page, 'Student_05_PortfolioSkills.png');
  }

  // 1.6 Resume Preview Tab
  const resumeTab = await page.$('[data-tab="resume"], button:has-text("Resume"), .tab-btn:has-text("Resume")');
  if (resumeTab) {
    await resumeTab.click();
    await sleep(1200);
    await highlight(page, '#download-resume-btn, button:has-text("Download PDF"), .btn-download', 'Download PDF');
    await snap(page, 'Student_06_ResumePreview.png');
  }

  // 1.7 Clearance Submit Card / Modal
  const overviewTab = await page.$('[data-tab="overview"], button:has-text("Overview"), button:has-text("About")');
  if (overviewTab) await overviewTab.click();
  await sleep(800);
  const clearanceBtn = await page.$('button:has-text("Submit Requirements Drive"), button:has-text("Requirements"), #btn-submit-drive');
  if (clearanceBtn) {
    await clearanceBtn.scrollIntoViewIfNeeded();
    await clearanceBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, #requirements-modal', 'Google Drive Clearance Packet');
    await snap(page, 'Student_07_ClearanceSubmit.png');
    // Close modal
    const closeBtn = await page.$('.modal-close, button:has-text("Cancel"), button:has-text("Close")');
    if (closeBtn) await closeBtn.click();
    await sleep(500);
  } else {
    await snap(page, 'Student_07_ClearanceSubmit.png');
  }

  // 1.8 OJT List
  await page.goto(`${BASE_URL}/main/#/ojt`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.ojt-card, .post-card', 'Active Internship Vacancies');
  await snap(page, 'Student_08_OjtList.png');

  // 1.9 OJT Detail Drawer
  const firstOjtCard = await page.$('.ojt-card, .post-card');
  if (firstOjtCard) {
    await firstOjtCard.click();
    await sleep(800);
    await highlight(page, 'button:has-text("Express Interest"), #btn-express-interest', 'Express Interest');
    await snap(page, 'Student_09_OjtDetail.png');
    // Close drawer
    const drawerClose = await page.$('.drawer-close, .modal-close, button:has-text("Close")');
    if (drawerClose) await drawerClose.click();
    await sleep(500);
  }

  // 1.10 Tracker Calendar
  await page.goto(`${BASE_URL}/main/#/ojt-tracker`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.tracker-summary, .hours-progress, .gauge-card', 'Rendered Hours Progress');
  await snap(page, 'Student_10_TrackerCalendar.png');

  // 1.11 Tracker Time In / Geofence
  await highlight(page, '#time-in-btn, button:has-text("Time In"), .time-action-btn', 'GPS Geofenced Clock-In');
  await snap(page, 'Student_11_TrackerTimeIn.png');

  // 1.12 Emergency Leave Modal
  const emergencyBtn = await page.$('button:has-text("Emergency"), button:has-text("Leave Notice"), #btn-emergency');
  if (emergencyBtn) {
    await emergencyBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, #emergency-modal', 'Emergency Stoppage Notice');
    await snap(page, 'Student_12_EmergencyNotice.png');
    const closeEm = await page.$('.modal-close, button:has-text("Cancel")');
    if (closeEm) await closeEm.click();
    await sleep(500);
  }

  // 1.13 Pull-Out Request Modal
  const pullOutBtn = await page.$('button:has-text("Pull-Out"), button:has-text("Withdrawal"), #btn-pull-out');
  if (pullOutBtn) {
    await pullOutBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, #pull-out-modal', 'Formal Pull-Out Filing');
    await snap(page, 'Student_13_PullOutModal.png');
    const closePo = await page.$('.modal-close, button:has-text("Cancel")');
    if (closePo) await closePo.click();
    await sleep(500);
  }

  // 1.14 Job Matches
  await page.goto(`${BASE_URL}/main/#/jobs`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.match-score-pill, .match-badge, .job-card', 'Suitability Match Score');
  await snap(page, 'Student_14_JobMatches.png');

  // 1.15 Applications Pipeline
  await page.goto(`${BASE_URL}/main/#/applications`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.pipeline-stage, .application-card, .status-pill', 'Application Status Stages');
  await snap(page, 'Student_15_ApplicationsPipeline.png');

  // 1.16 Interview List
  await page.goto(`${BASE_URL}/main/#/interview`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.interview-card, .session-box, table', 'Upcoming Interview Schedule');
  await snap(page, 'Student_16_InterviewList.png');

  // 1.17 Student Sign Out
  const navUserBtn = await page.$('.navbar__user-btn, .avatar-btn, #nav-user-menu');
  if (navUserBtn) {
    await navUserBtn.click();
    await sleep(500);
    await highlight(page, 'button:has-text("Sign Out"), button:has-text("Logout"), #btn-logout', 'Secure Sign Out');
    await snap(page, 'Student_17_SignOut.png');
    const logoutBtn = await page.$('button:has-text("Sign Out"), button:has-text("Logout"), #btn-logout');
    if (logoutBtn) await logoutBtn.click();
    await sleep(1000);
  }

  console.log('--- SECTION 1 COMPLETE ---');
  await browser.close();
}

main().catch(console.error);
