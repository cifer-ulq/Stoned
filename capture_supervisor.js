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

  console.log('=== RESUMING SECTION 3: FACULTY SUPERVISOR PORTAL (04-14) ===');
  await clearSession(page);
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'networkidle' });
  await sleep(800);

  await page.fill('#email', 'alan.turing.bsit@chmsu.edu.ph');
  await page.fill('#password', 'Demo@1234');
  await page.click('#submit-btn');
  await page.waitForURL('**/supervisors/**', { timeout: 15000 });
  await sleep(2000);

  // Check terms modal if any
  const termsOverlay = await page.$('#chmsu-terms-overlay');
  if (termsOverlay && await termsOverlay.isVisible()) {
    await highlight(page, '#btn-gate-accept', 'Accept Terms & Continue');
    await snap(page, 'Student_02_TermsGate.png');
    const chk = await page.$('#gate-agree-checkbox');
    if (chk) await chk.check();
    await sleep(300);
    const acceptBtn = await page.$('#btn-gate-accept');
    if (acceptBtn) await acceptBtn.click();
    await sleep(1500);
  }

  // 3.4: Supervisor Dashboard
  await highlight(page, '.stat-card, .metric-card, .dashboard-overview', 'Trainee Placement Overview');
  await snap(page, 'Supervisor_04_Dashboard.png');

  // 3.5: Trainees Roster
  await page.goto(`${BASE_URL}/supervisors/#/trainees`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await highlight(page, '.tr2-table, table, .trainee-list', 'Student Trainee Cohort Directory');
  await snap(page, 'Supervisor_05_TraineesRoster.png');

  // 3.6: Import Students CSV Modal
  const batchBtn = await page.$('#batch-register-btn, button:has-text("Import Students"), .btn-import');
  if (batchBtn) {
    await batchBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, #import-modal, .student-import-modal', 'Bulk CSV Student Provisioning');
    await snap(page, 'Supervisor_06_ImportStudents.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay, #sup-req-modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Supervisor_06_ImportStudents.png');
  }

  // 3.7: Clearance Review Drawer
  const reqBtn = await page.$('.btn-review-req, button:has-text("Requirements"), button:has-text("Clearance"), .tr2-req-btn');
  if (reqBtn) {
    await reqBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, #review-req-modal, .requirements-modal', 'Pre-Deployment Clearance Verification');
    await snap(page, 'Supervisor_07_ClearanceReview.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay, #sup-req-modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Supervisor_07_ClearanceReview.png');
  }

  // 3.8: Endorsements Inbox
  await page.goto(`${BASE_URL}/supervisors/#/interests`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await highlight(page, '.ojts-grid, .interest-card, table', 'Company Endorsement Requests');
  await snap(page, 'Supervisor_08_EndorsementInbox.png');

  // 3.9: Send Endorsement Letter Modal
  const endorseBtn = await page.$('button:has-text("Endorse"), button:has-text("Send Endorsement"), .btn-endorse');
  if (endorseBtn) {
    await endorseBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, .endorse-modal, .swal2-modal', 'Official Endorsement Slip Issuance');
    await snap(page, 'Supervisor_09_IssueEndorsement.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Supervisor_09_IssueEndorsement.png');
  }

  // 3.10: Spatial GIS Monitoring Map
  await page.goto(`${BASE_URL}/supervisors/#/map`, { waitUntil: 'domcontentloaded' });
  await sleep(3000); // Wait for Leaflet map tiles
  await highlight(page, '#monitoring-map, .map-container, .leaflet-container', 'Interactive GIS Deployment Map');
  await snap(page, 'Supervisor_10_MonitoringMap.png');

  // 3.11: Rubric Builder
  await page.goto(`${BASE_URL}/supervisors/#/evaluations`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await highlight(page, '.template-card, #btn-create-template, .rubric-builder', 'Likert Rubric Template Authoring');
  await snap(page, 'Supervisor_11_RubricBuilder.png');

  // 3.12: Dispatch Evaluation
  const dispatchBtn = await page.$('button:has-text("Dispatch"), #btn-dispatch-eval, .btn-send-eval');
  if (dispatchBtn) {
    await highlight(page, 'button:has-text("Dispatch"), #btn-dispatch-eval', 'Dispatch Appraisal to Host Mentors');
    await snap(page, 'Supervisor_12_DispatchEvaluation.png');
  } else {
    await snap(page, 'Supervisor_12_DispatchEvaluation.png');
  }

  // 3.13: Trainee Pull-Out Review
  await page.goto(`${BASE_URL}/supervisors/#/trainees`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  const pullOutBtn = await page.$('.btn-pullout-review, button:has-text("Pull-Out"), .badge-pullout');
  if (pullOutBtn) {
    await pullOutBtn.click();
    await sleep(800);
    await highlight(page, '.modal-box, .pullout-modal', 'Dean Pull-Out Recommendation');
    await snap(page, 'Supervisor_13_PullOutReview.png');
    await page.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal-overlay').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Supervisor_13_PullOutReview.png');
  }

  // 3.14: Supervisor Sign Out
  const userMenuBtn = await page.$('#profile-trigger, .navbar__avatar-btn, #nav-user-menu');
  if (userMenuBtn) {
    await userMenuBtn.click();
    await sleep(500);
    await highlight(page, 'button[data-action="logout"], button:has-text("Sign Out")', 'Sign Out');
    await snap(page, 'Supervisor_14_SignOut.png');
    const logoutBtn = await page.$('button[data-action="logout"], button:has-text("Sign Out")');
    if (logoutBtn) await logoutBtn.click();
    await sleep(1000);
  }

  console.log('--- SECTION 3 COMPLETE ---');
  await browser.close();
}

main().catch(console.error);
