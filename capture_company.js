import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';
const OUT_DIR = path.resolve('manual_screenshots');

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
  } catch (_) {}
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

  console.log('=== STARTING SECTION 2: COMPANY PORTAL ===');
  await clearSession(page);
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'networkidle' });
  await sleep(800);

  // 2.1 Sign In
  await page.fill('#email', 'hr@naahcompany.com');
  await page.fill('#password', 'Demo@1234');
  await highlight(page, '#submit-btn', 'Sign In');
  await snap(page, 'Company_01_SignIn.png');

  // Submit and wait for company dashboard
  await page.click('#submit-btn');
  await page.waitForURL('**/company/**', { timeout: 15000 });
  await sleep(2000);

  // Check terms modal if any
  const termsBtn = await page.$('#btn-accept-terms, .terms-accept-btn');
  if (termsBtn && await termsBtn.isVisible()) {
    await termsBtn.click();
    await sleep(1000);
  }

  // 2.2 Dashboard
  await highlight(page, '.stat-card, .metric-card, .co-stats-row', 'Company Recruitment KPIs');
  await snap(page, 'Company_02_Dashboard.png');

  // 2.3 Profile & MOA
  await page.goto(`${BASE_URL}/company/#/profile`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.moa-badge, .moa-card, .profile-card', 'MOA Partnership & Accreditation');
  await snap(page, 'Company_03_ProfileSetup.png');

  // 2.4 OJT Slots
  await page.goto(`${BASE_URL}/company/#/ojt-slots`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '#btn-post-slot', 'Post New Slot');
  await snap(page, 'Company_04_OjtSlots.png');

  // 2.5 Post Slot Modal
  const postSlotBtn = await page.$('#btn-post-slot');
  if (postSlotBtn) {
    await postSlotBtn.click();
    await sleep(1000);
    await highlight(page, '.modal-box, #post-slot-modal, .ojt-wizard-modal', 'Internship Slot Parameters');
    await snap(page, 'Company_05_PostSlotModal.png');
    // Close modal cleanly
    await page.evaluate(() => {
      const closeBtn = document.querySelector('#wiz-close');
      if (closeBtn) closeBtn.click();
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    });
    await sleep(500);
  } else {
    await snap(page, 'Company_05_PostSlotModal.png');
  }

  // 2.6 Applicant Screening
  await page.goto(`${BASE_URL}/company/#/applicants`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.ap-grid, .ap-card, .pipeline-tabs', 'Applicant Screening Pipeline');
  await snap(page, 'Company_06_ApplicantScreening.png');

  // 2.7 Candidate Drawer
  const viewProfileBtn = await page.$('.ap-btn-view-profile, .ap-btn-review, .ap-card');
  if (viewProfileBtn) {
    await viewProfileBtn.click();
    await sleep(1000);
    await highlight(page, '.modal-box, .drawer-box, #resume-modal', 'Candidate Dossier & Actions');
    await snap(page, 'Company_07_CandidateDrawer.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Company_07_CandidateDrawer.png');
  }

  // 2.8 & 2.9 Interviews
  await page.goto(`${BASE_URL}/company/#/interviews`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const schedBtn = await page.$('button:has-text("Schedule Interview"), #btn-schedule-interview');
  if (schedBtn) {
    await highlight(page, 'button:has-text("Schedule Interview"), #btn-schedule-interview', 'Schedule Interview');
    await snap(page, 'Company_08_ScheduleInterview.png');
  } else {
    await highlight(page, '.interviews-page-header, .interview-card, table', 'Schedule Interview Tool');
    await snap(page, 'Company_08_ScheduleInterview.png');
  }
  await snap(page, 'Company_09_InterviewsList.png');

  // 2.10 OJT Trainees Roster
  await page.goto(`${BASE_URL}/company/#/ojt-trainees`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.trainee-card, table, .trainee-row', 'Active Intern Roster');
  await snap(page, 'Company_10_TraineesRoster.png');

  // 2.11 Trainee DTR Audit
  const traineeCard = await page.$('.trainee-card, .btn-dtr, button:has-text("View DTR"), button:has-text("Logs")');
  if (traineeCard) {
    await traineeCard.click();
    await sleep(1000);
    await highlight(page, '.modal-box, .dtr-modal, .dossier-panel', 'GPS Geofence Validation Badge');
    await snap(page, 'Company_11_TraineeDtrAudit.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Company_11_TraineeDtrAudit.png');
  }

  // 2.12 Evaluation Form
  const evalBtn = await page.$('button:has-text("Evaluate"), .btn-evaluate');
  if (evalBtn) {
    await evalBtn.click();
    await sleep(1000);
    await highlight(page, '.modal-box, #eval-form, .eval-modal', 'Likert Performance Appraisal Form');
    await snap(page, 'Company_12_EvaluationForm.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Company_12_EvaluationForm.png');
  }

  // 2.13 Job Listings
  await page.goto(`${BASE_URL}/company/#/jobs`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.jobs-header, #btn-post-job, .job-item', 'Published Career Job Listings');
  await snap(page, 'Company_13_JobListings.png');

  // 2.14 Employee Roster
  await page.goto(`${BASE_URL}/company/#/employees`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await highlight(page, '.employee-card, table, .emp-row', 'Hired Alumni & Staff Roster');
  await snap(page, 'Company_14_EmployeeRoster.png');

  // 2.15 Company Sign Out
  const profileTrigger = await page.$('#profile-trigger, .navbar__avatar-btn');
  if (profileTrigger) {
    await profileTrigger.click();
    await sleep(500);
    await highlight(page, 'button[data-action="logout"]', 'Sign Out');
    await snap(page, 'Company_15_SignOut.png');
    const logoutBtn = await page.$('button[data-action="logout"]');
    if (logoutBtn) await logoutBtn.click();
    await sleep(1000);
  }

  console.log('--- SECTION 2 COMPLETE ---');
  await browser.close();
}

main().catch(console.error);
